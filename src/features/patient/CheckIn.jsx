import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { getActiveEntryForPatient } from "../../store/selectors";

export const CheckIn = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const { currentUser } = state;
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "PATIENT") {
      navigate(`/login?redirect=/checkin`);
      return;
    }

    const activeEntry = getActiveEntryForPatient(state, currentUser.patientId);
    
    if (activeEntry) {
      if (!activeEntry.checkedIn) {
        dispatch({ type: ACTIONS.CHECK_IN, payload: { entryId: activeEntry.id } });
        setStatus("success");
      } else {
        setStatus("already_checked_in");
      }
      setTimeout(() => {
        navigate(`/patient/token/${activeEntry.id}`);
      }, 2000);
    } else {
      setStatus("no_appointment");
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
    }
  }, [currentUser, navigate, state, dispatch]);

  return (
    <div className="min-h-screen bg-section flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-4">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-navy">Processing Check-In...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy">Checked In Successfully!</h2>
            <p className="text-muted">Redirecting to your token...</p>
          </>
        )}
        {status === "already_checked_in" && (
          <>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy">Already Checked In</h2>
            <p className="text-muted">Redirecting to your token...</p>
          </>
        )}
        {status === "no_appointment" && (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy">No Active Queue Entry Found</h2>
            <p className="text-muted">You don't have any active walk-in or appointment today to check in for. Redirecting to dashboard...</p>
          </>
        )}
      </Card>
    </div>
  );
};
