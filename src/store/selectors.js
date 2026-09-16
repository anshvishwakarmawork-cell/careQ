import { ACTIONS } from "./actions";
import { smartEstimate } from "../lib/waitTime";

export const getQueueForDoctor = (state, doctorId) => {
  const entries = state.queueEntries.filter(e => e.doctorId === doctorId && e.status !== "CANCELLED");
  return entries.sort((a, b) => {
    const pWeight = { EMERGENCY: 4, URGENT: 3, PRIORITY: 2, NORMAL: 1 };
    if (pWeight[a.priority] !== pWeight[b.priority]) return pWeight[b.priority] - pWeight[a.priority];
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1;
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });
};

export const getPatientsAhead = (state, entryId) => {
  const entry = state.queueEntries.find(e => e.id === entryId);
  if (!entry || (entry.status !== "WAITING" && entry.status !== "CALLED")) return 0;
  
  const doctorQueue = getQueueForDoctor(state, entry.doctorId);
  const activeEntries = doctorQueue.filter(e => e.status === "WAITING" || e.status === "CALLED");
  
  const myIndex = activeEntries.findIndex(e => e.id === entryId);
  return myIndex >= 0 ? myIndex : 0;
};

export const getEstimatedWait = (state, entryId) => {
  const ahead = getPatientsAhead(state, entryId);
  const entry = state.queueEntries.find(e => e.id === entryId);
  if (!entry) return 0;
  const doctor = state.doctors.find(d => d.id === entry.doctorId);
  if (!doctor) return 0;
  
  return smartEstimate(ahead, doctor, entry);
};

export const getCurrentPatient = (state, doctorId) => {
  return state.queueEntries.find(e => e.doctorId === doctorId && e.status === "IN_CONSULTATION");
};

export const getDoctorStats = (state, doctorId) => {
  const doctorQueue = state.queueEntries.filter(e => e.doctorId === doctorId);
  return {
    served: doctorQueue.filter(e => e.status === "COMPLETED").length,
    waiting: doctorQueue.filter(e => e.status === "WAITING").length,
    skipped: doctorQueue.filter(e => e.status === "SKIPPED").length,
    avgConsultationMin: state.doctors.find(d => d.id === doctorId)?.avgConsultationMin || 10
  };
};

export const getActiveEntryForPatient = (state, patientId) => {
  return state.queueEntries.find(e => e.patientId === patientId && 
    (e.status === "WAITING" || e.status === "CALLED" || e.status === "IN_CONSULTATION" || e.verificationStatus === "PENDING_VERIFICATION"));
};

export const getPendingRequests = (state, hospitalId) => {
  if (!hospitalId) return [];
  return state.queueEntries.filter(e => e.hospitalId === hospitalId && e.verificationStatus === "PENDING_VERIFICATION");
};

export const getHospitalQueue = (state, hospitalId) => {
  if (!hospitalId) return [];
  return state.queueEntries.filter(e => e.hospitalId === hospitalId);
};

export const getDoctorsByHospital = (state, hospitalId) => {
  if (!hospitalId) return [];
  return state.doctors.filter(d => d.hospitalId === hospitalId);
};

export const getAppointmentsByHospital = (state, hospitalId) => {
  if (!hospitalId) return [];
  return (state.appointments || []).filter(a => a.hospitalId === hospitalId);
};

export const getEmergenciesByHospital = (state, hospitalId) => {
  if (!hospitalId) return [];
  return (state.emergencyRequests || []).filter(r => r.hospitalId === hospitalId);
};

export const getUnreadCount = (state, userId) => {
  return state.notifications.filter(n => n.userId === userId && !n.read).length;
};

export const getTodayAppointments = (state, hospitalId) => {
  const todayStr = new Date().toISOString().split("T")[0];
  return getAppointmentsByHospital(state, hospitalId)
    .filter(app => app.appointmentTime && app.appointmentTime.startsWith(todayStr) && app.status !== "CANCELLED")
    .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
};

export const getUpcomingAppointments = (state, hospitalId) => {
  const todayStr = new Date().toISOString().split("T")[0];
  return getAppointmentsByHospital(state, hospitalId)
    .filter(app => app.appointmentTime && app.appointmentTime > todayStr && app.appointmentTime.split("T")[0] !== todayStr && app.status !== "CANCELLED")
    .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
};

export const getPastAppointments = (state, hospitalId) => {
  const todayStr = new Date().toISOString().split("T")[0];
  return getAppointmentsByHospital(state, hospitalId)
    .filter(app => app.appointmentTime && (app.appointmentTime < todayStr || app.status === "COMPLETED") && app.appointmentTime.split("T")[0] !== todayStr && app.status !== "CANCELLED")
    .sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
};

export const getCancelledAppointments = (state, hospitalId) => {
  return getAppointmentsByHospital(state, hospitalId)
    .filter(app => app.status === "CANCELLED")
    .sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
};

export const getReceptionDashboardStats = (state, hospitalId) => {
  const scopedDoctors = getDoctorsByHospital(state, hospitalId);
  const scopedQueue = getHospitalQueue(state, hospitalId);
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = getAppointmentsByHospital(state, hospitalId).filter(a => 
    a.appointmentTime?.startsWith(todayStr) &&
    a.status !== "CANCELLED"
  );
  
  const activeEmergencies = getEmergenciesByHospital(state, hospitalId).filter(r => r.status === "ACTIVE").length;
  
  return {
    hospitalName: state.hospitals.find(h => h.id === hospitalId)?.name || "Hospital",
    totalWaiting: scopedQueue.filter(q => q.status === "WAITING" || q.status === "CALLED").length,
    totalServed: scopedQueue.filter(q => q.status === "COMPLETED").length,
    todayAppointmentsCount: todayAppointments.length,
    activeEmergencies,
    activeDoctors: scopedDoctors.filter(d => d.isAvailable).length
  };
};

export const getPatientAppointments = (state, patientId) => {
  return (state.appointments || []).filter(a => 
    a.patientId === patientId && 
    (a.status === "BOOKED" || a.status === "SCHEDULED")
  );
};

export const getPendingRequestsForPatient = (state, patientId) => {
  return (state.queueEntries || []).filter(e => 
    e.patientId === patientId && 
    e.verificationStatus === "PENDING_VERIFICATION"
  );
};

