import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { getActiveEntryForPatient } from "../../store/selectors";
import { formatDoctorName, formatHumanReadableDate } from "../../lib/format";
import { Calendar, Clock, Activity, XCircle } from "lucide-react";

export const PatientVisits = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, doctors = [], appointments = [], queueEntries = [] } = state;

  const tabParam = searchParams.get("tab") || "upcoming";
  const activeTab = tabParam.toUpperCase();

  const setActiveTab = (tab) => {
    setSearchParams({ tab: tab.toLowerCase() });
  };

  if (!currentUser) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const myAppointments = appointments.filter(a => a.patientId === currentUser.patientId && (a.status === "SCHEDULED" || a.status === "BOOKED"));
  const myCancelled = appointments.filter(a => a.patientId === currentUser.patientId && a.status === "CANCELLED");
  const myHistory = queueEntries.filter(e => e.patientId === currentUser.patientId && (e.status === "COMPLETED" || e.status === "SKIPPED"));
  
  const activeEntry = currentUser ? getActiveEntryForPatient(state, currentUser.patientId) : null;

  const handleCancel = (id) => {
    dispatch({ type: ACTIONS.CANCEL_APPOINTMENT, payload: { appointmentId: id } });
  };

  const handleJoinQueue = (appointment) => {
    const requestId = `QR-${Date.now()}`;
    dispatch({
      type: ACTIONS.CREATE_TOKEN_REQUEST,
      payload: {
        id: requestId,
        patientId: currentUser.patientId,
        doctorId: appointment.doctorId,
        source: "APPOINTMENT",
        appointmentTime: appointment.appointmentTime
      }
    });
    setTimeout(() => {
      navigate(`/patient/queue-request/${requestId}`);
    }, 100);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-navy">My Visits</h1>
        <p className="text-muted text-sm mt-1">Manage your appointments and view history</p>
      </header>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        <button 
          className={`flex-1 whitespace-nowrap px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "UPCOMING" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"}`}
          onClick={() => setActiveTab("UPCOMING")}
        >
          Upcoming
        </button>
        <button 
          className={`flex-1 whitespace-nowrap px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "PAST" || activeTab === "QUEUE-HISTORY" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"}`}
          onClick={() => setActiveTab("PAST")}
        >
          Past Visits
        </button>
        <button 
          className={`flex-1 whitespace-nowrap px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "CANCELLED" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"}`}
          onClick={() => setActiveTab("CANCELLED")}
        >
          Cancelled
        </button>
      </div>

      <div className="animate-in fade-in space-y-4">
        {activeTab === "UPCOMING" && (
          myAppointments.length > 0 ? myAppointments.map(a => {
            const doc = doctors.find(d => d.id === a.doctorId);
            const isToday = new Date(a.appointmentTime || a.date).toISOString().split('T')[0] === todayStr;
            return (
              <Card key={a.id} className="p-5 bg-white space-y-4 shadow-sm border border-gray-100 rounded-2xl hover:border-blue-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-lg">{formatDoctorName(doc?.name)}</p>
                      <p className="text-sm text-primary font-medium">{doc?.specialization || "General"}</p>
                      <div className="flex items-center text-xs text-muted mt-2 gap-2">
                        <Clock size={14} /> {formatHumanReadableDate(a.appointmentTime || a.date)} {a.time ? `at ${a.time}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  {isToday ? (
                    <button 
                      onClick={() => handleJoinQueue(a)}
                      disabled={!!activeEntry}
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {activeEntry 
                        ? (activeEntry.verificationStatus === "PENDING_VERIFICATION" 
                            ? "Request Pending" 
                            : "Queue Active") 
                        : "Join Queue Now"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert("Reschedule functionality coming soon")}
                      className="flex-1 bg-blue-50 text-primary py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
                  <button 
                    onClick={() => handleCancel(a.id)}
                    className="flex-1 bg-white border border-gray-200 text-red-600 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            );
          }) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <p className="text-navy font-bold text-lg mb-1">No upcoming appointments</p>
              <p className="text-muted text-sm mb-6 max-w-xs mx-auto">You don't have any scheduled visits. Book an appointment to get started.</p>
              <button onClick={() => navigate('/patient/search')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700">
                Book Visit
              </button>
            </div>
          )
        )}

        {(activeTab === "PAST" || activeTab === "QUEUE-HISTORY") && (
          myHistory.length > 0 ? myHistory.map(e => {
            const doc = doctors.find(d => d.id === e.doctorId);
            return (
              <Card key={e.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-navy">{formatDoctorName(doc?.name)}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {formatHumanReadableDate(e.completedAt || e.skippedAt || e.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${e.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {e.status === 'COMPLETED' ? 'Completed' : 'Skipped'}
                  </span>
                </div>
              </Card>
            );
          }) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                <Activity size={32} />
              </div>
              <p className="text-navy font-bold text-lg mb-1">No past visits</p>
              <p className="text-muted text-sm">Your completed or skipped visits will appear here.</p>
            </div>
          )
        )}

        {activeTab === "CANCELLED" && (
          myCancelled.length > 0 ? myCancelled.map(a => {
            const doc = doctors.find(d => d.id === a.doctorId);
            return (
              <Card key={a.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl opacity-75">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                      <XCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-navy">{formatDoctorName(doc?.name)}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {formatHumanReadableDate(a.appointmentTime || a.date)} {a.time ? `at ${a.time}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                    Cancelled
                  </span>
                </div>
              </Card>
            );
          }) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                <XCircle size={32} />
              </div>
              <p className="text-navy font-bold text-lg mb-1">No cancelled appointments</p>
              <p className="text-muted text-sm">Your cancelled appointments will appear here.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
