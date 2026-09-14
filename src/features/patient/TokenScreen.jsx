import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { getPatientsAhead, getEstimatedWait } from "../../store/selectors";
import { formatWaitTime } from "../../lib/waitTime";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const TokenScreen = () => {
  const { entryId } = useParams();
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  const entry = state.queueEntries.find(e => e.id === entryId);
  if (!entry) return <div className="p-4">Token not found</div>;

  const doctor = state.doctors.find(d => d.id === entry.doctorId);
  const department = state.departments?.find(d => d.id === doctor?.departmentId);

  const inConsult = state.queueEntries.find(e => e.doctorId === entry.doctorId && e.status === "IN_CONSULTATION");

  const handleSimulateScan = () => {
    dispatch({ type: ACTIONS.CHECK_IN, payload: { entryId } });
    setShowQRModal(false);
  };

  const handleLeaveQueue = () => {
    dispatch({ type: ACTIONS.CANCEL_ENTRY, payload: { entryId } });
    setShowLeaveModal(false);
    navigate('/patient/dashboard');
  };

  const handleRejoin = () => {
    dispatch({ type: ACTIONS.REJOIN, payload: { entryId } });
  };

  // Status Banners
  if (entry.status === "CALLED") {
    return (
      <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">It's your turn!</h1>
        <p className="text-2xl mb-8">Please proceed to Room {doctor?.room}</p>
        <p className="text-6xl font-black mb-8">{entry.tokenNumber}</p>
        <p className="text-lg">Dr. {doctor?.name}</p>
      </div>
    );
  }

  if (entry.status === "IN_CONSULTATION") {
    return (
      <div className="min-h-screen bg-section flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">In consultation</h1>
        <p className="text-5xl font-black text-primary mb-8">{entry.tokenNumber}</p>
      </div>
    );
  }

  if (entry.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-section flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-bold text-navy mb-4">Visit complete</h1>
        <Button onClick={() => navigate('/patient/dashboard')} className="mt-8 bg-primary text-white px-8 py-3 rounded-xl">Go Home</Button>
      </div>
    );
  }

  if (entry.status === "SKIPPED") {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">You missed your turn.</h1>
        <Button onClick={handleRejoin} className="mt-8 bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">Rejoin Queue</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {doctor?.queuePaused && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm font-semibold">
          Dr. {doctor.name} has paused the queue briefly. We'll notify you when it resumes.
        </div>
      )}

      <div className="text-center mt-6">
        <p className="text-sm text-muted mb-2">Token Number</p>
        <h1 className="text-6xl font-black text-navy">{entry.tokenNumber}</h1>
        <div className="mt-6 flex flex-col items-center">
          <p className="font-semibold text-lg text-navy">Dr. {doctor?.name}</p>
          <p className="text-muted">{department?.name} • Room {doctor?.room}</p>
        </div>
      </div>

      {entry.source === "APPOINTMENT" && entry.appointmentTime && (
        <Card className="p-4 bg-blue-50 border-blue-100 text-center mx-4">
          <p className="text-sm text-blue-800 font-semibold mb-1">Appointment Time: {entry.appointmentTime}</p>
          <p className="text-xs text-blue-600">Your token priority is based on this scheduled time, not when you checked in.</p>
        </Card>
      )}

      <div className="flex justify-center mt-4">
        {entry.checkedIn ? (
           <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold flex items-center">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Checked in
           </span>
        ) : (
           <span className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-semibold">
             Not checked in
           </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        <Card className="p-3 text-center bg-white shadow-sm border border-gray-100">
          <p className="text-xs text-muted mb-1">Now Serving</p>
          <p className="font-bold text-lg text-navy">{inConsult ? inConsult.tokenNumber : "--"}</p>
        </Card>
        <Card className="p-3 text-center bg-white shadow-sm border border-gray-100">
          <p className="text-xs text-muted mb-1">Ahead</p>
          <p className="font-bold text-lg text-navy">{getPatientsAhead(state, entryId)}</p>
        </Card>
        <Card className="p-3 text-center bg-white shadow-sm border border-gray-100">
          <p className="text-xs text-muted mb-1">Est. Wait</p>
          <p className="font-bold text-lg text-navy">{formatWaitTime(getEstimatedWait(state, entryId))}</p>
        </Card>
      </div>

      {/* Progress Bar placeholder */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-6 overflow-hidden">
         <div className="bg-primary h-full" style={{ width: '30%' }}></div>
      </div>

      <div className="space-y-4 mt-8">
        {!entry.checkedIn && (
          <Button 
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90"
            onClick={() => setShowQRModal(true)}
          >
            I've arrived - Scan QR
          </Button>
        )}
        <Button 
          className="w-full bg-white text-red-600 border border-red-200 py-4 rounded-xl font-bold text-lg hover:bg-red-50"
          onClick={() => setShowLeaveModal(true)}
        >
          Leave Queue
        </Button>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>
            <div className="w-48 h-48 bg-gray-200 mx-auto mb-6 flex items-center justify-center text-muted">QR Placeholder</div>
            <Button className="w-full bg-primary text-white py-3 rounded-lg mb-3" onClick={handleSimulateScan}>Simulate scan</Button>
            <Button className="w-full text-muted py-3" onClick={() => setShowQRModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-2">Leave Queue?</h2>
            <p className="text-muted mb-6">You will lose your current position in the queue.</p>
            <Button className="w-full bg-red-600 text-white py-3 rounded-lg mb-3" onClick={handleLeaveQueue}>Yes, leave queue</Button>
            <Button className="w-full text-muted py-3" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};
