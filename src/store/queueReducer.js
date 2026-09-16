import { ACTIONS } from "./actions";
import { nextToken } from "../lib/tokens";

export const initialState = {
  currentUser: null,
  demoMode: false,
  doctors: [],
  queueEntries: [],
  appointments: [],
  notifications: [],
  users: [],
  patients: [],
  hospitals: [],
  departments: [],
  emergencyRequests: [],
  departmentStatus: {},
  qrPoints: []
};

export const queueReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      // Note: Full auth logic handled in context or separate, but reducer stores user
      return { ...state, currentUser: action.payload };
    case ACTIONS.LOGOUT:
      return { ...state, currentUser: null };
    case ACTIONS.SWITCH_ROLE_DEV:
      // Stub for dev switcher
      return { ...state, currentUser: action.payload };
    case ACTIONS.JOIN_QUEUE: {
      const { patientId, doctorId, source, reasonForVisit, appointmentTime } = action.payload;
      const patient = state.currentUser; // In real app, might look up by ID
      const doctor = state.doctors.find(d => d.id === doctorId);
      
      const newEntry = {
        id: `Q${Date.now()}`,
        tokenNumber: nextToken(doctorId, state.doctors, state.queueEntries),
        patientId,
        patientName: patient?.name || "Unknown",
        doctorId,
        departmentId: doctor?.departmentId,
        hospitalId: doctor?.hospitalId,
        status: "WAITING",
        checkedIn: false, // Patients check in when they arrive, or if WALK_IN it's true (handled by action payload or effect)
        priority: "NORMAL",
        source: source || "APPOINTMENT",
        appointmentTime: appointmentTime || null,
        reasonForVisit: reasonForVisit || "",
        joinedAt: new Date().toISOString()
      };
      
      if (source === "WALK_IN") {
        newEntry.checkedIn = true;
        newEntry.checkedInAt = new Date().toISOString();
      }

      return { ...state, queueEntries: [...state.queueEntries, newEntry] };
    }
    case ACTIONS.CREATE_TOKEN_REQUEST: {
      const { patientId, doctorId, source, reasonForVisit, appointmentTime } = action.payload;
      const patient = state.currentUser;
      const doctor = state.doctors.find(d => d.id === doctorId);
      
      const newEntry = {
        id: action.payload.id || `QR-${Date.now()}`,
        tokenNumber: null,
        patientId,
        patientName: patient?.name || "Unknown",
        doctorId,
        departmentId: doctor?.departmentId,
        hospitalId: doctor?.hospitalId,
        verificationStatus: "PENDING_VERIFICATION",
        status: "PENDING",
        checkedIn: false,
        priority: "NORMAL",
        source: source || "PATIENT",
        appointmentTime: appointmentTime || null,
        reasonForVisit: reasonForVisit || "",
        joinedAt: new Date().toISOString()
      };
      
      return { ...state, queueEntries: [...state.queueEntries, newEntry] };
    }
    case ACTIONS.VERIFY_TOKEN_REQUEST: {
      const { entryId } = action.payload;
      const entry = state.queueEntries.find(e => e.id === entryId);
      if (!entry || entry.verificationStatus !== "PENDING_VERIFICATION") return state;
      
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === entryId ? { 
            ...e, 
            verificationStatus: "VERIFIED", 
            status: "WAITING",
            tokenNumber: nextToken(e.doctorId, state.doctors, state.queueEntries),
            verifiedByUserId: state.currentUser?.id,
            verifiedAt: new Date().toISOString()
          } : e
        )
      };
    }
    case ACTIONS.REJECT_TOKEN_REQUEST: {
      const { entryId, reason } = action.payload;
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === entryId ? { 
            ...e, 
            verificationStatus: "REJECTED", 
            rejectReason: reason 
          } : e
        )
      };
    }
    case ACTIONS.CANCEL_TOKEN_REQUEST: {
      const { entryId } = action.payload;
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === entryId ? { 
            ...e, 
            verificationStatus: "CANCELLED", 
            status: "CANCELLED" 
          } : e
        )
      };
    }
    case ACTIONS.CHECK_IN:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, checkedIn: true, checkedInAt: new Date().toISOString() } : e
        )
      };
    case ACTIONS.CALL_NEXT: {
      const { doctorId } = action.payload;
      return {
        ...state,
        queueEntries: state.queueEntries.map(e => {
          if (e.id === action.payload.entryId) {
             return { ...e, status: "CALLED", calledAt: new Date().toISOString() };
          }
          return e;
        })
      };
    }
    case ACTIONS.START_CONSULTATION:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "IN_CONSULTATION", startedAt: new Date().toISOString() } : e
        )
      };
    case ACTIONS.COMPLETE:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "COMPLETED", completedAt: new Date().toISOString() } : e
        )
      };
    case ACTIONS.SKIP:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "SKIPPED", skippedAt: new Date().toISOString() } : e
        )
      };
    case ACTIONS.REJOIN:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "WAITING", checkedIn: true } : e
        )
      };
    case ACTIONS.CANCEL_ENTRY:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "CANCELLED" } : e
        )
      };
    case ACTIONS.SET_PRIORITY:
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, priority: action.payload.priority } : e
        )
      };
    case ACTIONS.TRANSFER: {
      const { entryId, toDoctorId } = action.payload;
      const targetDoctor = state.doctors.find(d => d.id === toDoctorId);
      
      return {
        ...state,
        queueEntries: state.queueEntries.map(e => {
          if (e.id === entryId) {
            return {
              ...e,
              doctorId: toDoctorId,
              departmentId: targetDoctor?.departmentId,
              hospitalId: targetDoctor?.hospitalId,
              status: "WAITING", 
              tokenNumber: nextToken(toDoctorId, state.doctors, state.queueEntries),
              transferredFromDoctorId: e.doctorId,
              transferredToDoctorId: toDoctorId,
              transferredAt: new Date().toISOString(),
              transferredByUserId: state.currentUser?.id
            };
          }
          return e;
        })
      };
    }
    case ACTIONS.ADD_WALK_IN: {
      const { patientName, mobile, doctorId, reason, priority } = action.payload;
      const doctor = state.doctors.find(d => d.id === doctorId);
      
      const newEntry = {
        id: `Q${Date.now()}`,
        tokenNumber: nextToken(doctorId, state.doctors, state.queueEntries),
        patientId: `W${Date.now()}`, // Walk-in dummy ID
        patientName: patientName || "Walk-in Patient",
        mobile: mobile || "",
        doctorId,
        departmentId: doctor?.departmentId,
        hospitalId: doctor?.hospitalId,
        verificationStatus: "VERIFIED",
        status: "WAITING",
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        priority: priority || "NORMAL",
        source: "WALK_IN",
        appointmentTime: null,
        reasonForVisit: reason || "",
        joinedAt: new Date().toISOString(),
        addedByUserId: state.currentUser?.id
      };
      
      return { ...state, queueEntries: [...state.queueEntries, newEntry] };
    }
    case ACTIONS.SET_DOCTOR_STATUS:
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === action.payload.doctorId ? { ...d, status: action.payload.status, delayMinutes: action.payload.delayMinutes || 0 } : d
        )
      };
    case ACTIONS.PAUSE_QUEUE:
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === action.payload.doctorId ? { ...d, queuePaused: true } : d
        )
      };
    case ACTIONS.RESUME_QUEUE:
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === action.payload.doctorId ? { ...d, queuePaused: false } : d
        )
      };
    case ACTIONS.SET_DEMO_MODE:
      return { ...state, demoMode: action.payload.on };
    case ACTIONS.PUSH_NOTIFICATION:
      return {
        ...state,
        notifications: [{ id: `N${Date.now()}`, ...action.payload, read: false, createdAt: new Date().toISOString() }, ...state.notifications]
      };
    case ACTIONS.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, read: true } : n
        )
      };
    case ACTIONS.REGISTER_PATIENT: {
      const { user, patient } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        patients: [...state.patients, patient],
      };
    }
    case ACTIONS.UPDATE_PATIENT_PROFILE: {
      const { patientId, updates } = action.payload;
      return {
        ...state,
        patients: state.patients.map(p =>
          p.id === patientId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      };
    }
    case ACTIONS.CHANGE_PASSWORD: {
      const { userId, newPassword } = action.payload;
      return {
        ...state,
        users: state.users.map(u =>
          u.id === userId ? { ...u, password: newPassword } : u
        )
      };
    }
    case ACTIONS.REGISTER_DOCTOR: {
      const { user, doctor } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        doctors: [...state.doctors, doctor],
      };
    }
    case ACTIONS.REGISTER_DOCTOR_REQUEST: {
      const { user, doctor } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        doctors: [...state.doctors, doctor],
        currentUser: user,
      };
    }
    case ACTIONS.APPROVE_DOCTOR: {
      const { email } = action.payload;
      return {
        ...state,
        users: state.users.map(u => 
          u.email === email ? { ...u, verified: true } : u
        )
      };
    }
    case ACTIONS.APPROVE_DOCTOR_REQUEST: {
      const { doctorId } = action.payload;
      return {
        ...state,
        users: state.users.map(u => 
          u.id === doctorId ? { ...u, verified: true } : u
        ),
        doctors: state.doctors.map(d =>
          d.id === doctorId ? { 
            ...d, 
            verificationStatus: 'VERIFIED',
            approvedByUserId: state.currentUser?.id,
            approvedAt: new Date().toISOString()
          } : d
        )
      };
    }
    case ACTIONS.REJECT_DOCTOR_REQUEST: {
      const { doctorId, reason } = action.payload;
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === doctorId ? { 
            ...d, 
            verificationStatus: 'REJECTED', 
            rejectReason: reason,
            rejectedByUserId: state.currentUser?.id,
            rejectedAt: new Date().toISOString()
          } : d
        )
      };
    }
    case ACTIONS.REQUEST_DOCTOR_CHANGES: {
      const { doctorId, message } = action.payload;
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === doctorId ? { ...d, verificationStatus: 'CHANGES_REQUESTED', changesMessage: message } : d
        )
      };
    }
    case ACTIONS.UPDATE_DOCTOR_REGISTRATION: {
      const { doctorId, updates } = action.payload;
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === doctorId ? { ...d, ...updates, verificationStatus: 'PENDING_VERIFICATION' } : d
        )
      };
    }
    case ACTIONS.BOOK_APPOINTMENT: {
      const { doctorId, patientId, date, time } = action.payload;
      const patient = state.currentUser;
      const doctor = state.doctors.find(d => d.id === doctorId);
      
      const newAppointment = {
        id: `A${Date.now()}`,
        doctorId,
        patientId,
        patientName: patient?.name || "Unknown",
        departmentId: doctor?.departmentId,
        hospitalId: doctor?.hospitalId,
        date,
        time,
        status: "SCHEDULED",
        createdAt: new Date().toISOString()
      };
      
      return { ...state, appointments: [...state.appointments, newAppointment] };
    }
    case ACTIONS.RESCHEDULE_APPOINTMENT: {
      const { appointmentId, date, time } = action.payload;
      return {
        ...state,
        appointments: state.appointments.map(a => 
          a.id === appointmentId ? { ...a, date, time } : a
        )
      };
    }
    case ACTIONS.CANCEL_APPOINTMENT: {
      const { appointmentId } = action.payload;
      return {
        ...state,
        appointments: state.appointments.map(a => 
          a.id === appointmentId ? { ...a, status: "CANCELLED" } : a
        )
      };
    }
    case ACTIONS.UPDATE_APPOINTMENT_STATUS: {
      const { appointmentId, status } = action.payload;
      return {
        ...state,
        appointments: state.appointments.map(a => 
          a.id === appointmentId ? { ...a, status } : a
        )
      };
    }
    case ACTIONS.SUBMIT_EMERGENCY_REQUEST: {
      const { request } = action.payload;
      return {
        ...state,
        emergencyRequests: [...state.emergencyRequests, { ...request, status: "AWAITING_REVIEW", submittedAt: new Date().toISOString() }]
      };
    }
    case ACTIONS.UPDATE_EMERGENCY_STATUS: {
      const { requestId, status } = action.payload;
      return {
        ...state,
        emergencyRequests: state.emergencyRequests.map(r => 
          r.id === requestId ? { ...r, status, lastUpdated: new Date().toISOString() } : r
        )
      };
    }
    case ACTIONS.ACTIVATE_EMERGENCY_PREP: {
      const { departmentId } = action.payload;
      return {
        ...state,
        departmentStatus: {
          ...state.departmentStatus,
          [departmentId]: "EMERGENCY_PREPARATION_ACTIVE"
        }
      };
    }
    case ACTIONS.RESUME_NORMAL_QUEUE: {
      const { departmentId } = action.payload;
      const newStatus = { ...state.departmentStatus };
      delete newStatus[departmentId];
      return {
        ...state,
        departmentStatus: newStatus
      };
    }
    default:
      console.warn("Unknown action type", action.type);
      return state;
  }
};
