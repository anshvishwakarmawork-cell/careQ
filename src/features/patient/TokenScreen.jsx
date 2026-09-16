import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { getPatientsAhead, getEstimatedWait } from "../../store/selectors";
import { formatWaitTime, formatHumanReadableDate, formatDoctorName } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Clock, MapPin, AlertCircle, CheckCircle2, Calendar, QrCode } from "lucide-react";

export const TokenScreen = () => {
  const { entryId } = useParams();
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  const entry = state.queueEntries.find(e => e.id === entryId);
  if (!entry) return <div className="p-4 flex flex-col items-center justify-center min-h-screen"><p className="text-xl font-bold text-navy mb-4">Token not found</p><Button onClick={() => navigate('/patient/dashboard')}>Go Back</Button></div>;

  const doctor = state.doctors.find(d => d.id === entry.doctorId);
  const department = state.departments?.find(d => d.id === doctor?.departmentId);
  const hospital = state.hospitals?.find(h => h.id === doctor?.hospitalId);

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
      <div className="min-h-screen bg-green-600 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">It's your turn!</h1>
        <p className="text-2xl mb-8">Please proceed to Room {doctor?.room}</p>
        <div className="bg-white text-green-600 rounded-3xl p-8 mb-8 w-full max-w-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-green-500 mb-2">Token Number</p>
          <p className="text-7xl font-black">{entry.tokenNumber}</p>
        </div>
        <p className="text-xl font-medium">{formatDoctorName(doctor?.name)}</p>
      </div>
    );
  }

  if (entry.status === "IN_CONSULTATION") {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">In consultation</h1>
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg">
          <p className="text-5xl font-black">{entry.tokenNumber}</p>
        </div>
        <p className="text-lg text-muted">You are currently seeing {formatDoctorName(doctor?.name)}</p>
      </div>
    );
  }

  if (entry.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto">
           <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-navy mb-2">Visit complete</h1>
        <p className="text-muted mb-8">Thank you for visiting {hospital?.name || "the hospital"}</p>
        <Button onClick={() => navigate('/patient/dashboard')} className="mt-4 bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold w-full max-w-xs shadow-md">Go Home</Button>
      </div>
    );
  }

  if (entry.status === "SKIPPED") {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">You missed your turn.</h1>
        <p className="text-red-500 mb-8 max-w-xs mx-auto text-sm">We called your token but you were not present. You can rejoin the queue.</p>
        <Button onClick={handleRejoin} className="bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 font-bold text-lg w-full max-w-xs shadow-md">Rejoin Queue</Button>
      </div>
    );
  }

  const ahead = getPatientsAhead(state, entryId);
  const totalEstimatedAheadInitially = Math.max(ahead + 1, 10); 
  const progressPercent = Math.max(10, 100 - ((ahead / totalEstimatedAheadInitially) * 100));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate('/patient/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-navy transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-navy">Live Queue Token</h1>
      </header>

      <div className="p-4 md:p-8 space-y-6 flex-1 max-w-lg mx-auto w-full">
        {doctor?.queuePaused && (
          <div className="bg-amber-100 text-amber-800 p-4 rounded-xl text-sm font-semibold flex gap-3 items-start shadow-sm">
            <AlertCircle className="shrink-0 text-amber-600" size={20} />
            <p>Queue paused. {formatDoctorName(doctor.name)} will be back shortly.</p>
          </div>
        )}

        <Card className="bg-white overflow-hidden shadow-md border-0 rounded-2xl relative">
          <div className="bg-primary pt-8 pb-12 px-6 text-center relative overflow-hidden text-white">
            <div className="absolute -right-8 -top-8 opacity-10">
              <Clock size={160} />
            </div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Token Number</p>
            <h1 className="text-7xl font-black relative z-10 tracking-tight">{entry.tokenNumber}</h1>
          </div>
          
          <div className="px-6 py-8 relative -mt-6 bg-white rounded-t-3xl text-center">
            <h2 className="font-bold text-2xl text-navy mb-1">{formatDoctorName(doctor?.name)}</h2>
            <p className="text-muted flex items-center justify-center gap-1.5 text-sm">
              <MapPin size={16} /> {department?.name} • Room {doctor?.room}
            </p>
            <p className="text-muted flex items-center justify-center gap-1.5 text-xs mt-1">
               {hospital?.name}
            </p>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted font-medium mb-1">Serving</p>
                <p className="font-black text-xl text-primary">{inConsult ? inConsult.tokenNumber : "--"}</p>
              </div>
              <div className="text-center border-l border-r border-gray-100">
                <p className="text-xs text-muted font-medium mb-1">Ahead</p>
                <p className="font-bold text-xl text-navy">{ahead}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted font-medium mb-1">Wait Time</p>
                <p className="font-bold text-xl text-navy">{formatWaitTime(getEstimatedWait(state, entryId))}</p>
              </div>
            </div>

            <div className="w-full bg-blue-50 h-2.5 rounded-full mt-8 overflow-hidden relative">
              <div className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-xs text-muted mt-3 font-medium">Queue progress</p>
          </div>
        </Card>

        {entry.source === "APPOINTMENT" && entry.appointmentTime && (
          <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <Calendar className="text-primary shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-navy mb-0.5">Appointment: {formatHumanReadableDate(entry.appointmentTime)}</p>
              <p className="text-xs text-muted">Your token priority is based on this scheduled time.</p>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-2 mb-6">
          {entry.checkedIn ? (
             <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-bold flex items-center shadow-sm">
               <CheckCircle2 className="mr-2" size={18} /> Checked in
             </span>
          ) : (
             <span className="bg-amber-100 text-amber-700 px-5 py-2 rounded-full text-sm font-bold flex items-center shadow-sm">
               <AlertCircle className="mr-2" size={18} /> Not checked in
             </span>
          )}
        </div>

        <div className="space-y-4">
          {!entry.checkedIn && (
            <Button 
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
              onClick={() => setShowQRModal(true)}
            >
              I've arrived - Scan QR
            </Button>
          )}
          <Button 
            className="w-full bg-white text-red-600 border border-gray-200 py-4 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-[0.98]"
            onClick={() => setShowLeaveModal(true)}
          >
            Leave Queue
          </Button>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-navy mb-4">Scan QR Code</h2>
            <div className="w-56 h-56 bg-gray-100 border-2 border-dashed border-gray-300 mx-auto mb-6 flex flex-col items-center justify-center text-muted rounded-2xl">
              <QrCode size={48} className="mb-2 text-gray-400" />
              <p className="text-sm font-medium">QR Scanner Active</p>
            </div>
            <Button className="w-full bg-primary text-white py-4 rounded-xl mb-3 font-bold text-lg shadow-md" onClick={handleSimulateScan}>Simulate scan</Button>
            <Button className="w-full text-navy bg-gray-100 py-4 rounded-xl font-bold" onClick={() => setShowQRModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Leave Queue?</h2>
            <p className="text-muted mb-8 px-4">Are you sure? You will lose your current position in the queue.</p>
            <Button className="w-full bg-red-600 text-white py-4 rounded-xl mb-3 font-bold text-lg shadow-md hover:bg-red-700" onClick={handleLeaveQueue}>Yes, leave queue</Button>
            <Button className="w-full text-navy bg-gray-100 py-4 rounded-xl font-bold" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

