import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { queueReducer, initialState as emptyState } from "./queueReducer";
import { doctors } from "../data/doctors";
import { queueEntries, qrPoints } from "../data/queue";
import { appointments } from "../data/appointments";
import { notifications as initialNotifications } from "../data/notifications";
import { users as initialUsers } from "../data/users";
import { patients as initialPatients } from "../data/patients";
import { hospitals as initialHospitals } from "../data/hospitals";
import { runNotificationEffects } from "./notificationsEffect";
import { initWebSocket, disconnectWebSocket } from "./socket";
import { api } from "./api";
import { ACTIONS } from "./actions";
import { departments as initialDepartments } from "../data/departments";

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const useMock = import.meta.env.VITE_USE_MOCK !== "false"; // Default to true if not explicitly false

  // Populate initial state with mock data
  const initialState = {
    ...emptyState,
    doctors: useMock ? doctors : [],
    queueEntries: useMock ? queueEntries : [],
    appointments: useMock ? appointments : [],
    users: initialUsers,
    patients: initialPatients,
    hospitals: initialHospitals,
    departments: initialDepartments,
    qrPoints: useMock ? qrPoints : [],
    notifications: useMock ? initialNotifications : []
  };

  const [state, baseDispatch] = useReducer(queueReducer, initialState);

  // Initialize WebSockets
  useEffect(() => {
    if (!useMock) {
      initWebSocket(baseDispatch);
      return () => disconnectWebSocket();
    }
  }, [useMock]);

  // Async dispatch wrapper
  const dispatch = useCallback(async (action) => {
    if (useMock) {
      baseDispatch(action);
      return;
    }

    try {
      // Optimistic update
      baseDispatch(action);

      // Map action to API call
      switch (action.type) {
        case ACTIONS.JOIN_QUEUE:
          await api.post("/queue/join", action.payload);
          break;
        case ACTIONS.CHECK_IN:
          await api.post(`/queue/${action.payload.entryId}/checkin`, {});
          break;
        // Other actions would be mapped here similarly
        default:
          console.log(`[API] Unmapped action: ${action.type}`);
      }
    } catch (err) {
      console.error("[Dispatch Error]", err);
      // In a real app, dispatch a rollback action here
    }
  }, [useMock]);

  // Run side effects on state change
  useEffect(() => {
    runNotificationEffects(state, dispatch);
  }, [state.queueEntries, state.doctors, dispatch]);

  // Demo mode logic (Phase 1, part 6)
  useEffect(() => {
    let interval;
    if (state.demoMode) {
      interval = setInterval(() => {
        // Find Dr. Ankit Sharma's queue
        const docId = "DOC1";
        const doctor = state.doctors.find(d => d.id === docId);
        
        if (state.departmentStatus[doctor?.departmentId] === "EMERGENCY_PREPARATION_ACTIVE") {
          // Pause normal queue advancement
          return;
        }

        const q = state.queueEntries.filter(e => e.doctorId === docId && e.status !== "CANCELLED");
        
        // Very basic demo flow
        const inConsult = q.find(e => e.status === "IN_CONSULTATION");
        if (inConsult) {
           setTimeout(() => dispatch({ type: "COMPLETE", payload: { entryId: inConsult.id }}), 5000);
           return;
        }

        const called = q.find(e => e.status === "CALLED");
        if (called) {
           setTimeout(() => dispatch({ type: "START_CONSULTATION", payload: { entryId: called.id }}), 3000);
           return;
        }

        // Call next checked-in waiting patient
        const waiting = q.find(e => e.status === "WAITING" && e.checkedIn);
        if (waiting) {
           dispatch({ type: "CALL_NEXT", payload: { doctorId: docId, entryId: waiting.id } });
        }
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [state.demoMode, state.queueEntries, dispatch]);

  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
