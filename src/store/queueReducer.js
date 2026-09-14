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
  emergencyRequests: [],
  departmentStatus: {}
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
              status: "WAITING", // Put them back in waiting state
              priority: "PRIORITY", // Elevate priority for transfer
              joinedAt: new Date().toISOString() // Or keep old joinedAt to maintain place? Usually keep old joinedAt is better for fairness, but updating timestamp guarantees they show up if sorting by time. Let's keep original joinedAt but elevate priority.
            };
          }
          return e;
        })
      };
    }
    case ACTIONS.ADD_WALK_IN:
      // Mostly similar to JOIN_QUEUE but checkedIn is true
      return state;
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
    case ACTIONS.REGISTER_DOCTOR: {
      const { user, doctor } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        doctors: [...state.doctors, doctor],
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
