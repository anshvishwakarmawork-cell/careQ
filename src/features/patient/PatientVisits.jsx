import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { getActiveEntryForPatient } from "../../store/selectors";

export const PatientVisits = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState("UPCOMING");

  if (!currentUser) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const myAppointments = state.appointments.filter(a => a.patientId === currentUser.patientId && a.status === "SCHEDULED");
  const myHistory = state.queueEntries.filter(e => e.patientId === currentUser.patientId && e.status === "COMPLETED");
  
  const activeEntry = currentUser ? getActiveEntryForPatient(state, currentUser.patientId) : null;

  const handleCancel = (id) => {
    dispatch({ type: ACTIONS.CANCEL_APPOINTMENT, payload: { appointmentId: id } });
  };

  const handleJoinQueue = (appointment) => {
    dispatch({
      type: ACTIONS.JOIN_QUEUE,
      payload: {
        patientId: currentUser.patientId,
        doctorId: appointment.doctorId,
        source: "APPOINTMENT",
        appointmentTime: appointment.time
      }
    });
    setTimeout(() => {
      navigate('/patient/dashboard');
    }, 100);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-navy">My Visits</h1>

      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "UPCOMING" ? "border-primary text-primary" : "border-transparent text-muted"}`}
          onClick={() => setActiveTab("UPCOMING")}
        >
          Upcoming
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "PAST" ? "border-primary text-primary" : "border-transparent text-muted"}`}
          onClick={() => setActiveTab("PAST")}
        >
          Past
        </button>
      </div>

      <div className="animate-in fade-in space-y-4">
        {activeTab === "UPCOMING" ? (
          myAppointments.length > 0 ? myAppointments.map(a => {
            const doc = state.doctors.find(d => d.id === a.doctorId);
            const isToday = a.date === todayStr;
            return (
              <Card key={a.id} className="p-4 bg-white space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-navy">Dr. {doc?.name}</p>
                    <p className="text-sm text-muted">{doc?.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-sm font-medium">{a.time}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {isToday ? (
                    <button 
                      onClick={() => handleJoinQueue(a)}
                      disabled={!!activeEntry}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {activeEntry ? "Queue Active" : "Join Queue Now"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert("Reschedule flows to calendar UI in full app")}
                      className="flex-1 bg-blue-50 text-primary py-2 rounded-lg text-sm font-semibold"
                    >
                      Reschedule
                    </button>
                  )}
                  <button 
                    onClick={() => handleCancel(a.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            );
          }) : (
            <div className="text-center py-10 text-muted">
              <p>No upcoming appointments.</p>
            </div>
          )
        ) : (
          myHistory.length > 0 ? myHistory.map(e => {
            const doc = state.doctors.find(d => d.id === e.doctorId);
            return (
              <Card key={e.id} className="p-4 bg-gray-50 opacity-80 border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-navy">Dr. {doc?.name}</p>
                    <p className="text-sm text-muted">{new Date(e.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              </Card>
            );
          }) : (
            <div className="text-center py-10 text-muted">
              <p>No past visits.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
