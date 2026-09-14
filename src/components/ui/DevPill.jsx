import React from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";

export const DevPill = () => {
  const { state, dispatch } = useQueue();

  if (!import.meta.env.DEV) return null;

  const unverifiedDoctors = state.users.filter(u => u.role === "DOCTOR" && u.verified === false);

  const handleApprove = () => {
    unverifiedDoctors.forEach(doc => {
      dispatch({ type: ACTIONS.APPROVE_DOCTOR, payload: { email: doc.email } });
    });
    alert("Approved pending doctors");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg border border-gray-200 rounded-full flex flex-col p-2 z-50 text-xs gap-2">
      <div className="flex items-center space-x-4">
        <div>
          <label className="mr-2 font-semibold">Role:</label>
          <select 
            className="border rounded p-1"
            value={state.currentUser?.role || ""}
            onChange={(e) => {
              const user = state.users.find(u => u.role === e.target.value);
              if(user) dispatch({ type: ACTIONS.SWITCH_ROLE_DEV, payload: user });
            }}
          >
            <option value="">None</option>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="RECEPTION">Reception</option>
          </select>
        </div>
        <div>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={state.demoMode}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DEMO_MODE, payload: { on: e.target.checked }})}
              className="mr-1"
            />
            Demo mode
          </label>
        </div>
      </div>
      {unverifiedDoctors.length > 0 && (
        <div className="text-center">
          <button 
            onClick={handleApprove}
            className="bg-primary text-white px-2 py-1 rounded text-[10px]"
          >
            Approve {unverifiedDoctors.length} Pending Doctor(s)
          </button>
        </div>
      )}
    </div>
  );
};
