import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { getActiveEntryForPatient, getPatientsAhead, getEstimatedWait } from "../../store/selectors";
import { formatWaitTime } from "../../lib/waitTime";
import { Card } from "../../components/ui/Card";
import { Download } from "lucide-react";

export const PatientDashboard = () => {
  const { state } = useQueue();
  const navigate = useNavigate();
  const { currentUser, appointments, doctors } = state;
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!currentUser) return null;

  const activeEntry = getActiveEntryForPatient(state, currentUser.patientId);
  const myAppointments = appointments.filter(a => a.patientId === currentUser.patientId && a.status === "BOOKED");
  
  // Sort by time
  myAppointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
  const nextAppointment = myAppointments[0];

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center pt-2">
        <div>
          <p className="text-muted text-sm">Hello,</p>
          <h1 className="text-2xl font-bold text-navy">{currentUser.name}</h1>
        </div>
      </header>

      {/* PWA Install Prompt */}
      {showInstall && (
        <Card className="bg-blue-50 border-blue-100 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Download size={20} />
            </div>
            <div>
              <p className="font-semibold text-navy text-sm">Install MediQueue</p>
              <p className="text-xs text-muted">Add to home screen for quick access</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-sm"
          >
            Install
          </button>
        </Card>
      )}

      {/* Active Token Card */}
      {activeEntry && (
        <Card className="bg-primary text-white p-5 rounded-xl shadow-md" onClick={() => navigate(`/patient/token/${activeEntry.id}`)}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm">Your Token</p>
              <p className="text-4xl font-bold">{activeEntry.tokenNumber}</p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              {activeEntry.status}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-blue-100 text-xs">Ahead of you</p>
              <p className="font-semibold text-lg">{getPatientsAhead(state, activeEntry.id)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs">Est. Wait</p>
              <p className="font-semibold text-lg">{formatWaitTime(getEstimatedWait(state, activeEntry.id))}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 text-sm flex justify-between items-center">
            <span>Dr. {doctors.find(d => d.id === activeEntry.doctorId)?.name}</span>
            <span>Tap to view →</span>
          </div>
        </Card>
      )}

      {/* Next Appointment */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-navy">Upcoming</h2>
        {nextAppointment ? (
          <Card className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-semibold text-navy">Dr. {doctors.find(d => d.id === nextAppointment.doctorId)?.name}</p>
              <p className="text-sm text-muted">{new Date(nextAppointment.appointmentTime).toLocaleString()}</p>
            </div>
            <span className="text-primary text-sm font-semibold">View</span>
          </Card>
        ) : (
          <Card className="p-4 bg-gray-50 rounded-xl text-center text-muted">
            No upcoming appointments
          </Card>
        )}
      </div>
    </div>
  );
};
