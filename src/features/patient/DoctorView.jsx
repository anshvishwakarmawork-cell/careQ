import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { getActiveEntryForPatient, getPendingRequestsForPatient } from "../../store/selectors";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { AlertTriangle } from "lucide-react";
import { EmergencyRequestForm } from "../../components/emergency/EmergencyRequestForm";

export const DoctorView = () => {
  const { id } = useParams();
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("JOIN");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEmergencyFlow, setIsEmergencyFlow] = useState(false);
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  
  const doctor = state.doctors.find(d => d.id === id);
  const { currentUser } = state;

  if (!doctor) return <div className="p-4">Doctor not found</div>;

  const activeEntry = currentUser ? getActiveEntryForPatient(state, currentUser.patientId) : null;
  const pendingRequests = currentUser ? getPendingRequestsForPatient(state, currentUser.patientId) : [];
  const hasPendingRequest = pendingRequests.length > 0;
  const isUnavailable = doctor.status === "UNAVAILABLE" || doctor.status === "ON_BREAK";
  
  const waitingQueue = state.queueEntries.filter(e => e.doctorId === doctor.id && (e.status === "WAITING" || e.status === "CALLED"));
  const waitingCount = waitingQueue.length;
  
  const inConsult = state.queueEntries.find(e => e.doctorId === doctor.id && e.status === "IN_CONSULTATION");

  const handleJoinQueue = () => {
    const requestId = `QR-${Date.now()}`;
    dispatch({
      type: ACTIONS.CREATE_TOKEN_REQUEST,
      payload: {
        id: requestId,
        patientId: currentUser.patientId,
        doctorId: doctor.id,
        source: "PATIENT"
      }
    });
    setTimeout(() => {
       navigate(`/patient/queue-request/${requestId}`);
    }, 100);
  };

  const handleBook = () => {
    dispatch({
      type: ACTIONS.BOOK_APPOINTMENT,
      payload: {
        patientId: currentUser.patientId,
        doctorId: doctor.id,
        date: generateDates()[selectedDate].toISOString().split('T')[0],
        time: selectedTime
      }
    });
    setShowConfirm(true);
    setTimeout(() => {
       navigate('/patient/visits');
    }, 2000);
  };

  const handleEmergencySubmit = (formData) => {
    dispatch({
      type: ACTIONS.SUBMIT_EMERGENCY_REQUEST,
      payload: {
        request: {
          id: `EMG-${Date.now()}`,
          patientId: currentUser.patientId,
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          hospitalId: doctor.hospitalId,
          ...formData
        }
      }
    });
    setEmergencySubmitted(true);
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  
  const dates = generateDates();

  const generateSlots = () => {
    const [startH, startM] = doctor.todayHours.start.split(':').map(Number);
    const [endH, endM] = doctor.todayHours.end.split(':').map(Number);
    const slots = [];
    let curH = startH, curM = startM;
    while (curH < endH || (curH === endH && curM < endM)) {
      slots.push(`${curH.toString().padStart(2, '0')}:${curM.toString().padStart(2, '0')}`);
      curM += 15;
      if (curM >= 60) {
        curH += 1;
        curM = 0;
      }
    }
    return slots;
  };
  const slots = generateSlots();

  if (emergencySubmitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-red-900">Emergency Request Submitted</h2>
        <p className="text-gray-700">The reception team at the hospital has been notified and is reviewing your request.</p>
        <p className="text-sm font-bold text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          If this is a life-threatening situation, please call local emergency services immediately!
        </p>
        <button 
          onClick={() => navigate('/patient/dashboard')}
          className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isEmergencyFlow) {
    return (
      <div className="p-4 pb-20 animate-in slide-in-from-bottom-4">
        <button 
          onClick={() => setIsEmergencyFlow(false)}
          className="mb-4 text-sm font-semibold text-gray-500 flex items-center gap-2"
        >
          &larr; Back to Booking
        </button>
        <EmergencyRequestForm 
          hospital={{ name: "CareQueue General Hospital" }} // mock
          department={{ name: doctor.department }} // mock
          onSubmit={handleEmergencySubmit}
          onCancel={() => setIsEmergencyFlow(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {doctor.status === "DELAYED" && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm font-semibold">
          Running ~{doctor.delayMinutes} min late
        </div>
      )}

      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shrink-0">
          {doctor.photoInitials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">{doctor.name}</h1>
          <p className="text-muted">{doctor.specialization}</p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted">Today's Hours</span>
          <span className="font-semibold">{doctor.todayHours.start} - {doctor.todayHours.end}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted">Room</span>
          <span className="font-semibold">{doctor.room}</span>
        </div>
      </Card>

      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "JOIN" ? "border-primary text-primary" : "border-transparent text-muted"}`}
          onClick={() => setActiveTab("JOIN")}
        >
          Join Queue Now
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "BOOK" ? "border-primary text-primary" : "border-transparent text-muted"}`}
          onClick={() => setActiveTab("BOOK")}
        >
          Book Appointment
        </button>
      </div>

      {activeTab === "JOIN" ? (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-muted text-sm mb-1">Now Serving</p>
              <p className="font-bold text-xl text-primary">{inConsult ? inConsult.tokenNumber : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted text-sm mb-1">Waiting</p>
              <p className="font-bold text-xl">{waitingCount}</p>
            </Card>
          </div>

          <div className="mt-8">
            <button 
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
              disabled={isUnavailable || activeEntry || hasPendingRequest}
              onClick={handleJoinQueue}
            >
              {activeEntry || hasPendingRequest
                ? (hasPendingRequest 
                    ? "You already have a queue request waiting for verification" 
                    : "You already have an active token") 
                : "Join Queue"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          {showConfirm ? (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Appointment Confirmed!</h3>
              <p className="text-sm text-muted">Redirecting to your visits...</p>
            </Card>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-navy mb-3">Select Date</h3>
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                  {dates.map((d, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border ${selectedDate === i ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-navy'}`}
                    >
                      <span className="text-xs uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-xl font-bold">{d.getDate()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-3">Select Time</h3>
                <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 pb-2">
                  {slots.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 px-1 rounded-lg border text-sm font-medium ${selectedTime === t ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-navy'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
                  disabled={!selectedTime}
                  onClick={handleBook}
                >
                  Confirm Appointment
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="pt-6 border-t border-gray-100 mt-6">
        <button 
          onClick={() => setIsEmergencyFlow(true)}
          className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl font-bold transition-colors border border-red-200"
        >
          <AlertTriangle size={20} />
          Is this a medical emergency?
        </button>
      </div>
    </div>
  );
};
