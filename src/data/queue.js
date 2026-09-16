const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const rawQueueEntries = [
  // Dr. Ankit Sharma (DOC1, Dept D1)
  { id: "Q1", tokenNumber: "A-20", patientId: "P6", patientName: "Arjun Nair", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "COMPLETED", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:00:00Z", checkedInAt: "2026-09-14T09:00:00Z", calledAt: "2026-09-14T09:10:00Z", startedAt: "2026-09-14T09:12:00Z", completedAt: "2026-09-14T09:20:00Z" },
  { id: "Q2", tokenNumber: "A-21", patientId: "P7", patientName: "Kiran Rao", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "COMPLETED", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T09:15:00Z", joinedAt: "2026-09-13T10:00:00Z", checkedInAt: "2026-09-14T09:10:00Z", calledAt: "2026-09-14T09:21:00Z", startedAt: "2026-09-14T09:22:00Z", completedAt: "2026-09-14T09:30:00Z" },
  { id: "Q3", tokenNumber: "A-22", patientId: "P1", patientName: "Priya Mehta", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "COMPLETED", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:15:00Z", checkedInAt: "2026-09-14T09:15:00Z", calledAt: "2026-09-14T09:31:00Z", startedAt: "2026-09-14T09:32:00Z", completedAt: "2026-09-14T09:40:00Z" },
  { id: "Q4", tokenNumber: "A-23", patientId: "P2", patientName: "Mohit Sharma", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:20:00Z", checkedInAt: "2026-09-14T09:20:00Z" },
  { id: "Q5", tokenNumber: "A-24", patientId: "P3", patientName: "Ansh", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "COMPLETED", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T09:45:00Z", joinedAt: "2026-09-13T11:00:00Z", checkedInAt: "2026-09-14T09:30:00Z", calledAt: "2026-09-14T09:45:00Z", startedAt: "2026-09-14T09:47:00Z", completedAt: "2026-09-14T10:00:00Z" },
  { id: "Q6", tokenNumber: "A-25", patientId: "P4", patientName: "Rahul Verma", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:00:00Z", joinedAt: "2026-09-13T12:00:00Z" },
  { id: "Q7", tokenNumber: "A-26", patientId: "P8", patientName: "Vikram Singh", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "WAITING", checkedIn: true, priority: "URGENT", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:35:00Z", checkedInAt: "2026-09-14T09:35:00Z", reasonForVisit: "High Fever" },
  { id: "Q8", tokenNumber: "A-27", patientId: "P9", patientName: "Aarti Desai", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "SKIPPED", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T08:50:00Z", checkedInAt: "2026-09-14T08:50:00Z", calledAt: "2026-09-14T09:00:00Z", skippedAt: "2026-09-14T09:10:00Z" },
  { id: "Q9", tokenNumber: "A-28", patientId: "P10", patientName: "Rohan Kapoor", doctorId: "DOC1", departmentId: "D1", hospitalId: "H1", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:40:00Z" },
  
  // Dr. Priya Verma (DOC2, Dept D2)
  { id: "Q10", tokenNumber: "C-10", patientId: "P11", patientName: "Pooja Joshi", doctorId: "DOC2", departmentId: "D2", hospitalId: "H1", status: "IN_CONSULTATION", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:05:00Z", checkedInAt: "2026-09-14T09:05:00Z", calledAt: "2026-09-14T09:20:00Z", startedAt: "2026-09-14T09:22:00Z" },
  { id: "Q11", tokenNumber: "C-11", patientId: "P12", patientName: "Manish Reddy", doctorId: "DOC2", departmentId: "D2", hospitalId: "H1", status: "WAITING", checkedIn: true, priority: "EMERGENCY", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:25:00Z", checkedInAt: "2026-09-14T09:25:00Z", reasonForVisit: "Chest Pain" },
  { id: "Q12", tokenNumber: "C-12", patientId: "P13", patientName: "Divya Shah", doctorId: "DOC2", departmentId: "D2", hospitalId: "H1", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:30:00Z", joinedAt: "2026-09-13T15:00:00Z" },

  // Dr. Rahul Mehta (DOC3, Dept D3)
  { id: "Q13", tokenNumber: "O-05", patientId: "P5", patientName: "Sneha Iyer", doctorId: "DOC3", departmentId: "D3", hospitalId: "H1", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T09:30:00Z", joinedAt: "2026-09-13T09:00:00Z", checkedInAt: "2026-09-14T09:15:00Z" },
  { id: "Q14", tokenNumber: "O-06", patientId: "P14", patientName: "Tarun Kumar", doctorId: "DOC3", departmentId: "D3", hospitalId: "H1", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:20:00Z", checkedInAt: "2026-09-14T09:20:00Z" },
  { id: "Q15", tokenNumber: "O-07", patientId: "P6", patientName: "Arjun Nair", doctorId: "DOC3", departmentId: "D3", hospitalId: "H1", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:30:00Z" },
  
  // Additional entry to make it ~16 entries
  { id: "Q16", tokenNumber: "O-08", patientId: "P7", patientName: "Kiran Rao", doctorId: "DOC3", departmentId: "D3", hospitalId: "H1", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T11:00:00Z", joinedAt: "2026-09-12T10:00:00Z" },

  // Patient P3 trying to check in to Apollo (H2), Cardiology (D2)
  { id: "Q17", tokenNumber: null, patientId: "P3", patientName: "Ansh", doctorId: "DOC9", departmentId: "D2", hospitalId: "H2", verificationStatus: "PENDING_VERIFICATION", status: "PENDING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T12:00:00Z", joinedAt: "2026-09-14T11:00:00Z" },
  { id: "Q18", tokenNumber: null, patientId: "P4", patientName: "Rahul Verma", doctorId: "DOC10", departmentId: "D3", hospitalId: "H2", verificationStatus: "PENDING_VERIFICATION", status: "PENDING", checkedIn: false, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T11:05:00Z" },
  
  // Apollo Care Hospital (H2) Entries
  { id: "Q19", tokenNumber: "AP-01", patientId: "P15", patientName: "Neha Patel", doctorId: "DOC5", departmentId: "D1", hospitalId: "H2", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:10:00Z", checkedInAt: "2026-09-14T09:10:00Z" },
  { id: "Q20", tokenNumber: "AP-02", patientId: "P16", patientName: "Raju Srivastava", doctorId: "DOC5", departmentId: "D1", hospitalId: "H2", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:00:00Z", joinedAt: "2026-09-13T09:00:00Z" },
  { id: "Q21", tokenNumber: "AP-03", patientId: "P17", patientName: "Sunita Sharma", doctorId: "DOC6", departmentId: "D2", hospitalId: "H2", status: "IN_CONSULTATION", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T09:30:00Z", joinedAt: "2026-09-12T10:00:00Z", checkedInAt: "2026-09-14T09:15:00Z", calledAt: "2026-09-14T09:25:00Z", startedAt: "2026-09-14T09:30:00Z" },
  { id: "Q22", tokenNumber: "AP-04", patientId: "P18", patientName: "Ajay Singh", doctorId: "DOC9", departmentId: "D2", hospitalId: "H2", status: "WAITING", checkedIn: true, priority: "EMERGENCY", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:40:00Z", checkedInAt: "2026-09-14T09:40:00Z", reasonForVisit: "Severe palpitations" },
  { id: "Q23", tokenNumber: "AP-05", patientId: "P19", patientName: "Kavita Reddy", doctorId: "DOC10", departmentId: "D3", hospitalId: "H2", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:45:00Z", checkedInAt: "2026-09-14T09:45:00Z" },
  { id: "Q24", tokenNumber: "AP-06", patientId: "P20", patientName: "Manoj Tiwari", doctorId: "DOC11", departmentId: "D4", hospitalId: "H2", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:30:00Z", joinedAt: "2026-09-13T11:00:00Z", checkedInAt: "2026-09-14T09:50:00Z" },
  { id: "Q25", tokenNumber: "AP-07", patientId: "P1", patientName: "Priya Mehta", doctorId: "DOC11", departmentId: "D4", hospitalId: "H2", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T11:00:00Z", joinedAt: "2026-09-12T12:00:00Z" },
  { id: "Q26", tokenNumber: "AP-08", patientId: "P2", patientName: "Mohit Sharma", doctorId: "DOC12", departmentId: "D6", hospitalId: "H2", status: "CALLED", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:55:00Z", checkedInAt: "2026-09-14T09:55:00Z", calledAt: "2026-09-14T10:05:00Z" },
  
  // Medicare Clinic (H3) Entries
  { id: "Q27", tokenNumber: null, patientId: "P21", patientName: "Anjali Gupta", doctorId: "DOC7", departmentId: "D1", hospitalId: "H3", verificationStatus: "PENDING_VERIFICATION", status: "PENDING", checkedIn: false, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:20:00Z" },
  { id: "Q28", tokenNumber: "MC-01", patientId: "P22", patientName: "Prakash Iyer", doctorId: "DOC7", departmentId: "D1", hospitalId: "H3", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:30:00Z", checkedInAt: "2026-09-14T09:30:00Z" },
  { id: "Q29", tokenNumber: "MC-02", patientId: "P23", patientName: "Meena Menon", doctorId: "DOC13", departmentId: "D5", hospitalId: "H3", status: "WAITING", checkedIn: true, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:00:00Z", joinedAt: "2026-09-12T09:00:00Z", checkedInAt: "2026-09-14T09:40:00Z" },
  { id: "Q30", tokenNumber: "MC-03", patientId: "P24", patientName: "Rahul Verma", doctorId: "DOC14", departmentId: "D4", hospitalId: "H3", status: "WAITING", checkedIn: false, priority: "NORMAL", source: "APPOINTMENT", appointmentTime: "2026-09-14T10:30:00Z", joinedAt: "2026-09-13T10:00:00Z" },
  { id: "Q31", tokenNumber: "MC-04", patientId: "P25", patientName: "Sneha Nair", doctorId: "DOC14", departmentId: "D4", hospitalId: "H3", status: "IN_CONSULTATION", checkedIn: true, priority: "NORMAL", source: "WALK_IN", appointmentTime: null, joinedAt: "2026-09-14T09:10:00Z", checkedInAt: "2026-09-14T09:10:00Z", calledAt: "2026-09-14T09:20:00Z", startedAt: "2026-09-14T09:25:00Z" }
];

export const queueEntries = rawQueueEntries.map(entry => {
  const updatedEntry = { ...entry };
  ['appointmentTime', 'joinedAt', 'checkedInAt', 'calledAt', 'startedAt', 'completedAt', 'skippedAt'].forEach(key => {
    if (updatedEntry[key]) {
      updatedEntry[key] = updatedEntry[key].replace('2026-09-14', today).replace('2026-09-13', yesterday).replace('2026-09-12', yesterday);
    }
  });
  return updatedEntry;
});

export const qrPoints = [
  // City Care Hospital (H1)
  { id: "QR1", hospitalId: "H1", type: "HOSPITAL", label: "City Care Main Entrance" },
  { id: "QR2", hospitalId: "H1", departmentId: "D1", type: "DEPARTMENT", label: "General Medicine" },
  { id: "QR3", hospitalId: "H1", departmentId: "D2", type: "DEPARTMENT", label: "Cardiology" },
  { id: "QR4", hospitalId: "H1", departmentId: "D3", type: "DEPARTMENT", label: "Orthopedics" },
  
  // Apollo Care Hospital (H2)
  { id: "QR5", hospitalId: "H2", type: "HOSPITAL", label: "Apollo Care Main Entrance" },
  { id: "QR6", hospitalId: "H2", departmentId: "D1", type: "DEPARTMENT", label: "General Medicine" },
  { id: "QR7", hospitalId: "H2", departmentId: "D2", type: "DEPARTMENT", label: "Cardiology" },
  { id: "QR8", hospitalId: "H2", departmentId: "D3", type: "DEPARTMENT", label: "Orthopedics" },
  { id: "QR9", hospitalId: "H2", departmentId: "D4", type: "DEPARTMENT", label: "Pediatrics" },
  { id: "QR10", hospitalId: "H2", departmentId: "D5", type: "DEPARTMENT", label: "Dermatology" },
  { id: "QR11", hospitalId: "H2", departmentId: "D6", type: "DEPARTMENT", label: "ENT" },
  
  // Medicare Clinic (H3)
  { id: "QR12", hospitalId: "H3", type: "HOSPITAL", label: "Medicare Clinic Main Entrance" },
  { id: "QR13", hospitalId: "H3", departmentId: "D1", type: "DEPARTMENT", label: "General Medicine" },
  { id: "QR14", hospitalId: "H3", departmentId: "D4", type: "DEPARTMENT", label: "Pediatrics" },
  { id: "QR15", hospitalId: "H3", departmentId: "D5", type: "DEPARTMENT", label: "Dermatology" },
  { id: "QR16", hospitalId: "H3", departmentId: "D6", type: "DEPARTMENT", label: "ENT" }
];
