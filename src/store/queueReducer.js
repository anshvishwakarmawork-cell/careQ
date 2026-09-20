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
  qrPoints: [],
  broadcasts: []
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
        ),
        notifications: [{
          id: `N${Date.now()}`,
          userId: entry.patientId,
          entryId,
          type: "VERIFIED",
          message: "Your queue request has been verified and approved.",
          read: false,
          createdAt: new Date().toISOString()
        }, ...state.notifications]
      };
    }
    case ACTIONS.REJECT_TOKEN_REQUEST: {
      const { entryId, reason } = action.payload;
      const entry = state.queueEntries.find(e => e.id === entryId);
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === entryId ? { 
            ...e, 
            verificationStatus: "REJECTED", 
            rejectReason: reason 
          } : e
        ),
        notifications: entry ? [{
          id: `N${Date.now()}`,
          userId: entry.patientId,
          entryId,
          type: "REJECTED",
          message: `Your queue request was rejected: ${reason}`,
          read: false,
          createdAt: new Date().toISOString()
        }, ...state.notifications] : state.notifications
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
      const entry = state.queueEntries.find(e => e.id === action.payload.entryId);
      return {
        ...state,
        queueEntries: state.queueEntries.map(e => {
          if (e.id === action.payload.entryId) {
             return { ...e, status: "CALLED", calledAt: new Date().toISOString() };
          }
          return e;
        }),
        notifications: entry ? [{
          id: `N${Date.now()}`,
          userId: entry.patientId,
          entryId: entry.id,
          type: "CALLED",
          message: "The doctor is calling you now. Please proceed to the room.",
          read: false,
          createdAt: new Date().toISOString()
        }, ...state.notifications] : state.notifications
      };
    }
    case ACTIONS.START_CONSULTATION: {
      const entry = state.queueEntries.find(e => e.id === action.payload.entryId);
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "IN_CONSULTATION", startedAt: new Date().toISOString() } : e
        ),
        notifications: entry ? [{
          id: `N${Date.now()}`,
          userId: entry.patientId,
          entryId: entry.id,
          type: "IN_CONSULTATION",
          message: "Your consultation has started.",
          read: false,
          createdAt: new Date().toISOString()
        }, ...state.notifications] : state.notifications
      };
    }
    case ACTIONS.COMPLETE: {
      const entry = state.queueEntries.find(e => e.id === action.payload.entryId);
      return {
        ...state,
        queueEntries: state.queueEntries.map(e =>
          e.id === action.payload.entryId ? { ...e, status: "COMPLETED", completedAt: new Date().toISOString() } : e
        ),
        notifications: entry ? [{
          id: `N${Date.now()}`,
          userId: entry.patientId,
          entryId: entry.id,
          type: "COMPLETED",
          message: "Your consultation is complete. Have a great day!",
          read: false,
          createdAt: new Date().toISOString()
        }, ...state.notifications] : state.notifications
      };
    }
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
    case ACTIONS.MARK_POPUP_SEEN:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, popupSeen: true } : n
        )
      };
    case ACTIONS.CREATE_BROADCAST: {
      const senderHospitalId = state.currentUser?.hospitalId;
      const broadcastHospitalId = action.payload.broadcast?.hospitalId;
      
      // Cross-Hospital Protection: Ensure sender can only broadcast for their own hospital.
      if (senderHospitalId && broadcastHospitalId && senderHospitalId !== broadcastHospitalId) {
        console.error(`CROSS-HOSPITAL ISOLATION VIOLATION: Sender in hospital ${senderHospitalId} attempted to broadcast to hospital ${broadcastHospitalId}`);
        return state;
      }
      
      return {
        ...state,
        broadcasts: [action.payload.broadcast, ...state.broadcasts],
        notifications: [...action.payload.targetedNotifications, ...state.notifications]
      };
    }
    case ACTIONS.BULK_RESCHEDULE_APPOINTMENTS: {
      const { appointmentIds, newDate, newTime, status } = action.payload;
      return {
        ...state,
        appointments: state.appointments.map(a => 
          appointmentIds.includes(a.id) 
            ? { 
                ...a, 
                date: newDate || a.date, 
                time: newTime || a.time,
                status: status || a.status,
                doctorId: action.payload.doctorId || a.doctorId,
                departmentId: action.payload.departmentId || a.departmentId
              } 
            : a
        )
      };
    }
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
        appointmentTime: `${date}T${time}:00Z`,
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
      const appointment = state.appointments.find(a => a.id === appointmentId);
      
      const newNotifications = (status === "CHECKED_IN" && appointment) 
        ? [{
            id: `N${Date.now()}`,
            userId: appointment.patientId,
            appointmentId: appointment.id,
            type: "CHECKED_IN",
            message: "You have successfully checked in for your appointment.",
            read: false,
            createdAt: new Date().toISOString()
          }, ...state.notifications]
        : state.notifications;
        
      return {
        ...state,
        appointments: state.appointments.map(a => 
          a.id === appointmentId ? { ...a, status } : a
        ),
        notifications: newNotifications
      };
    }
    case ACTIONS.SUBMIT_EMERGENCY_REQUEST: {
      const { request } = action.payload;
      // Emergency Duplicate Protection
      const existingActive = state.emergencyRequests.find(r => r.patientId === request.patientId && r.status !== 'RESOLVED');
      if (existingActive) {
        console.warn(`DUPLICATE EMERGENCY BLOCKED: Patient ${request.patientId} already has an active emergency request.`);
        return state;
      }
      return {
        ...state,
        emergencyRequests: [...state.emergencyRequests, { ...request, status: "AWAITING_REVIEW", submittedAt: new Date().toISOString() }]
      };
    }
    case ACTIONS.UPDATE_EMERGENCY_STATUS: {
      const { requestId, status, resolutionType } = action.payload;
      const requestToUpdate = state.emergencyRequests.find(r => r.id === requestId);
      const senderHospitalId = state.currentUser?.hospitalId;
      
      // Cross-Hospital Protection for Receptionists/Doctors
      if (senderHospitalId && requestToUpdate && requestToUpdate.hospitalId !== senderHospitalId) {
        console.error(`CROSS-HOSPITAL ISOLATION VIOLATION: User in hospital ${senderHospitalId} attempted to update emergency ${requestId} for hospital ${requestToUpdate.hospitalId}`);
        return state;
      }

      return {
        ...state,
        emergencyRequests: state.emergencyRequests.map(r => 
          r.id === requestId ? { 
            ...r, 
            status, 
            lastUpdated: new Date().toISOString(),
            ...(resolutionType ? { resolutionType, resolvedAt: new Date().toISOString() } : {})
          } : r
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
      const { departmentId, requestIdToIgnore } = action.payload;
      const otherActiveEmergencies = state.emergencyRequests.some(r => 
        r.departmentId === departmentId && 
        r.id !== requestIdToIgnore && 
        ['ACCEPTED', 'PATIENT_EN_ROUTE', 'ARRIVED', 'HANDED_TO_DOCTOR'].includes(r.status)
      );

      if (otherActiveEmergencies) {
        return state;
      }

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
