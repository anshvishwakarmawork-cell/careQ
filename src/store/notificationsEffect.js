import { ACTIONS } from "./actions";
import { getPatientsAhead } from "./selectors";

export const runNotificationEffects = (state, dispatch) => {
  // Check thresholds for active entries
  state.queueEntries.forEach(entry => {
    if (entry.status === "WAITING" && entry.checkedIn) {
      const ahead = getPatientsAhead(state, entry.id);
      
      // Threshold: 5 ahead
      if (ahead === 5) {
        // Prevent duplicate firing by tracking if we already sent it
        // A real app would track this in the entry state or a separate log
        const hasNotified = state.notifications.find(n => n.entryId === entry.id && n.type === "AHEAD_5");
        if (!hasNotified) {
          dispatch({
            type: ACTIONS.PUSH_NOTIFICATION,
            payload: {
               userId: entry.patientId,
               entryId: entry.id,
               type: "AHEAD_5",
               message: "Your turn is approaching. You are 5 patients away."
            }
          });
        }
      }
      
      // Threshold: 2 ahead
      if (ahead <= 2) {
         const hasNotified = state.notifications.find(n => n.entryId === entry.id && n.type === "AHEAD_2");
         if (!hasNotified) {
           dispatch({
             type: ACTIONS.PUSH_NOTIFICATION,
             payload: {
                userId: entry.patientId,
                entryId: entry.id,
                type: "AHEAD_2",
                message: "Please return to the waiting area. ~10 minutes to go."
             }
           });
         }
      }
    }
  });
};
