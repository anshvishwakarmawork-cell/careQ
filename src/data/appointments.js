const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

export const appointments = [
  // Today's appointments
  { id: "A1", patientId: "P7", doctorId: "DOC1", hospitalId: "H1", appointmentTime: `${todayStr}T09:15:00Z`, status: "BOOKED" },
  { id: "A2", patientId: "P3", doctorId: "DOC1", hospitalId: "H1", appointmentTime: `${todayStr}T09:45:00Z`, status: "BOOKED" },
  { id: "A3", patientId: "P4", doctorId: "DOC1", hospitalId: "H1", appointmentTime: `${todayStr}T10:00:00Z`, status: "BOOKED" },
  { id: "A4", patientId: "P13", doctorId: "DOC2", hospitalId: "H1", appointmentTime: `${todayStr}T10:30:00Z`, status: "BOOKED" },
  { id: "A5", patientId: "P5", doctorId: "DOC3", hospitalId: "H1", appointmentTime: `${todayStr}T09:30:00Z`, status: "BOOKED" },
  { id: "A6", patientId: "P7", doctorId: "DOC3", hospitalId: "H1", appointmentTime: `${todayStr}T11:00:00Z`, status: "BOOKED" },
  { id: "A7", patientId: "P8", doctorId: "DOC4", hospitalId: "H1", appointmentTime: `${todayStr}T12:00:00Z`, status: "BOOKED" },
  { id: "A8", patientId: "P9", doctorId: "DOC5", hospitalId: "H2", appointmentTime: `${todayStr}T10:15:00Z`, status: "BOOKED" },
  
  // Upcoming (Tomorrow)
  { id: "A9", patientId: "P1", doctorId: "DOC1", hospitalId: "H1", appointmentTime: `${tomorrowStr}T09:00:00Z`, status: "BOOKED" },
  { id: "A10", patientId: "P2", doctorId: "DOC5", hospitalId: "H2", appointmentTime: `${tomorrowStr}T11:30:00Z`, status: "BOOKED" },
  
  // Past (Yesterday)
  { id: "A11", patientId: "P10", doctorId: "DOC2", hospitalId: "H1", appointmentTime: `${yesterdayStr}T14:00:00Z`, status: "COMPLETED" },
  { id: "A12", patientId: "P11", doctorId: "DOC6", hospitalId: "H2", appointmentTime: `${yesterdayStr}T15:30:00Z`, status: "COMPLETED" },
  
  // Cancelled (Today, Yesterday, Tomorrow)
  { id: "A13", patientId: "P12", doctorId: "DOC3", hospitalId: "H1", appointmentTime: `${todayStr}T16:00:00Z`, status: "CANCELLED" },
  { id: "A14", patientId: "P14", doctorId: "DOC5", hospitalId: "H2", appointmentTime: `${tomorrowStr}T09:30:00Z`, status: "CANCELLED" },
  
  // Additional Apollo Care Hospital (H2) Appointments
  { id: "A15", patientId: "P16", doctorId: "DOC5", hospitalId: "H2", appointmentTime: `${todayStr}T10:00:00Z`, status: "BOOKED" },
  { id: "A16", patientId: "P17", doctorId: "DOC6", hospitalId: "H2", appointmentTime: `${todayStr}T09:30:00Z`, status: "COMPLETED" },
  { id: "A17", patientId: "P20", doctorId: "DOC11", hospitalId: "H2", appointmentTime: `${todayStr}T10:30:00Z`, status: "BOOKED" },
  { id: "A18", patientId: "P1", doctorId: "DOC11", hospitalId: "H2", appointmentTime: `${todayStr}T11:00:00Z`, status: "BOOKED" },
  { id: "A19", patientId: "P15", doctorId: "DOC12", hospitalId: "H2", appointmentTime: `${tomorrowStr}T09:00:00Z`, status: "BOOKED" },
  { id: "A20", patientId: "P18", doctorId: "DOC9", hospitalId: "H2", appointmentTime: `${yesterdayStr}T14:30:00Z`, status: "COMPLETED" },
  { id: "A21", patientId: "P19", doctorId: "DOC10", hospitalId: "H2", appointmentTime: `${todayStr}T15:00:00Z`, status: "CANCELLED" },
  
  // Additional Medicare Clinic (H3) Appointments
  { id: "A22", patientId: "P23", doctorId: "DOC13", hospitalId: "H3", appointmentTime: `${todayStr}T10:00:00Z`, status: "BOOKED" },
  { id: "A23", patientId: "P24", doctorId: "DOC14", hospitalId: "H3", appointmentTime: `${todayStr}T10:30:00Z`, status: "BOOKED" },
  { id: "A24", patientId: "P25", doctorId: "DOC7", hospitalId: "H3", appointmentTime: `${tomorrowStr}T11:00:00Z`, status: "BOOKED" },
  { id: "A25", patientId: "P21", doctorId: "DOC8", hospitalId: "H3", appointmentTime: `${yesterdayStr}T16:00:00Z`, status: "COMPLETED" },
  { id: "A26", patientId: "P22", doctorId: "DOC14", hospitalId: "H3", appointmentTime: `${todayStr}T14:00:00Z`, status: "CANCELLED" }
];
