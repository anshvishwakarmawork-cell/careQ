import React from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { useNavigate } from "react-router-dom";

export const DevPill = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  if (!import.meta.env.DEV) return null;

  const unverifiedDoctors = state.users.filter(u => u.role === "DOCTOR" && u.verified === false);

  const handleApprove = () => {
    unverifiedDoctors.forEach(doc => {
      dispatch({ type: ACTIONS.APPROVE_DOCTOR_REQUEST, payload: { doctorId: doc.id } });
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
            value={state.currentUser?.id || ""}
            onChange={(e) => {
              const user = state.users.find(u => u.id === e.target.value);
              if(user) {
                dispatch({ type: ACTIONS.SWITCH_ROLE_DEV, payload: user });
                if (user.role === "PATIENT") navigate("/patient/dashboard");
                if (user.role === "DOCTOR") navigate("/doctor/dashboard");
                if (user.role === "RECEPTION") navigate("/reception/dashboard");
              }
            }}
          >
            <option value="">None</option>
            <option value="U1">Patient</option>
            <option value="U2">Doctor (Ankit Sharma)</option>
            <option value="U3">Reception (City Care)</option>
            <option value="U4">Reception (Medicare)</option>
            <option value="U5">Reception (Apollo)</option>
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
