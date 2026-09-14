import { ACTIONS } from "./actions";
import { smartEstimate } from "../lib/waitTime";

export const getQueueForDoctor = (state, doctorId) => {
  const entries = state.queueEntries.filter(e => e.doctorId === doctorId && e.status !== "CANCELLED");
  // Priority ordering logic implemented here or in components, 
  // but as per brief, the state machine or selectors should enforce ordering:
  // 1. priority DESC (EMERGENCY > URGENT > PRIORITY > NORMAL)
  // 2. checkedIn DESC
  // 3. APPOINTMENT with appointmentTime <= now before WALK_IN
  // 4. joinedAt ASC
  return entries.sort((a, b) => {
    // 1. Priority
    const pWeight = { EMERGENCY: 4, URGENT: 3, PRIORITY: 2, NORMAL: 1 };
    if (pWeight[a.priority] !== pWeight[b.priority]) return pWeight[b.priority] - pWeight[a.priority];
    
    // 2. CheckedIn
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1;
    
    // 3. Appt vs Walk-in (simplified for now: appt before walkin if time is past, but here just use joinedAt if same)
    // Detailed logic goes here as needed.
    
    // 4. JoinedAt
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
    (e.status === "WAITING" || e.status === "CALLED" || e.status === "IN_CONSULTATION"));
};

export const getHospitalQueue = (state, hospitalId) => {
  return state.queueEntries.filter(e => e.hospitalId === hospitalId);
};

export const getUnreadCount = (state, userId) => {
  return state.notifications.filter(n => n.userId === userId && !n.read).length;
};
