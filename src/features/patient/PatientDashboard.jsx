import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { getActiveEntryForPatient, getPatientsAhead, getEstimatedWait, getPatientAppointments, getPendingRequestsForPatient, getUnreadCount } from "../../store/selectors";
import { formatWaitTime, formatHumanReadableDate, formatQueueStatus, formatDoctorName } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { Search, Bell, Users, Calendar, QrCode, User, LogOut, Settings, Clock, MapPin, AlertCircle } from "lucide-react";

export const PatientDashboard = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const { currentUser, appointments, doctors, hospitals, departments, requests, notifications } = state;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const activeEntry = getActiveEntryForPatient(state, currentUser.patientId);
  const pendingRequests = getPendingRequestsForPatient(state, currentUser.patientId);
  
  const myAppointments = getPatientAppointments(state, currentUser.patientId);
  myAppointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
  const nextAppointment = myAppointments[0];

  const unreadNotifications = getUnreadCount(state, currentUser.patientId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate('/login');
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header Area */}
      <header className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-xl font-bold text-primary mb-1">CareQueue</h1>
          <p className="text-2xl font-bold text-navy">{getTimeGreeting()}, {currentUser.name.split(' ')[0]}</p>
          <p className="text-muted text-sm mt-1">Manage your appointments and queues</p>
        </div>
        
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <button 
            onClick={() => navigate('/patient/notifications')}
            className="relative p-2 text-navy hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell size={24} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
          
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm border-2 border-blue-100"
          >
            {currentUser.name?.charAt(0).toUpperCase() || 'P'}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-14 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="font-bold text-navy truncate">{currentUser.name}</p>
                <p className="text-xs text-muted">Patient</p>
              </div>
              <div className="py-1">
                <button onClick={() => navigate('/patient/profile')} className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-blue-50 hover:text-primary flex items-center gap-2">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => navigate('/patient/visits')} className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-blue-50 hover:text-primary flex items-center gap-2">
                  <Calendar size={16} /> My Appointments
                </button>
                <button onClick={() => navigate('/patient/visits?tab=queue-history')} className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-blue-50 hover:text-primary flex items-center gap-2">
                  <Clock size={16} /> Queue History
                </button>
              </div>
              <div className="py-1 border-t border-gray-50">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctor, hospital or department........" 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-navy"
        />
      </form>

      {/* Pending Verification Banner */}
      {pendingRequests.length > 0 && !activeEntry && (
        <Card className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => navigate(`/patient/queue-request/${pendingRequests[0].id}`)}>
          <div className="flex gap-3 items-start">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-amber-900">Queue Request Pending</p>
              <p className="text-sm text-amber-800">Your token request is awaiting reception approval.</p>
            </div>
          </div>
          <span className="text-amber-700 font-semibold text-sm whitespace-nowrap ml-4">View Status &rarr;</span>
        </Card>
      )}

      {/* Active Queue Card */}
      {activeEntry ? (() => {
        const doc = doctors.find(d => d.id === activeEntry.doctorId);
        const dept = departments?.find(d => d.id === doc?.departmentId);
        const hosp = hospitals?.find(h => h.id === doc?.hospitalId);
        const ahead = getPatientsAhead(state, activeEntry.id);
        const inConsult = state.queueEntries.find(e => e.doctorId === activeEntry.doctorId && e.status === "IN_CONSULTATION");
        
        // Progress logic: max position assumed 10. If 1 ahead, progress is high.
        const totalEstimatedAheadInitially = Math.max(ahead + 1, 10); 
        const progressPercent = Math.max(10, 100 - ((ahead / totalEstimatedAheadInitially) * 100));

        return (
          <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={120} />
            </div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-200 font-semibold mb-1 text-sm tracking-wider uppercase">Active Queue</p>
                <h2 className="text-xl font-bold">{formatDoctorName(doc?.name)}</h2>
                <p className="text-sm text-blue-100 mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {dept?.name || "Department"} • {hosp?.name || "Hospital"}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                {formatQueueStatus(activeEntry.status)}
              </div>
            </div>
            
            <div className="relative z-10 grid grid-cols-3 gap-4 bg-black/10 rounded-xl p-4 mb-4">
              <div className="text-center border-r border-white/10">
                <p className="text-blue-200 text-xs mb-1">Your Token</p>
                <p className="font-black text-2xl">{activeEntry.tokenNumber}</p>
              </div>
              <div className="text-center border-r border-white/10">
                <p className="text-blue-200 text-xs mb-1">Ahead</p>
                <p className="font-bold text-xl">{ahead}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-200 text-xs mb-1">Est. Wait</p>
                <p className="font-bold text-xl">{formatWaitTime(getEstimatedWait(state, activeEntry.id))}</p>
              </div>
            </div>

            <div className="relative z-10 mb-6">
              <div className="flex justify-between text-xs text-blue-100 mb-2 font-medium">
                <span>Now Serving: {inConsult ? inConsult.tokenNumber : '--'}</span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                 <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
            
            <div className="relative z-10 flex gap-3">
              <button 
                onClick={() => navigate(`/patient/token/${activeEntry.id}`)}
                className="flex-1 bg-white text-primary font-bold py-3 px-4 rounded-xl shadow hover:bg-gray-50 transition-colors text-sm text-center"
              >
                View Live Queue
              </button>
            </div>
          </Card>
        );
      })() : (
        <Card className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center shadow-sm">
          <p className="text-navy font-bold text-lg mb-2">No active queue</p>
          <p className="text-muted text-sm mb-6">You are not currently waiting for a doctor.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/patient/search')} className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Join a Queue
            </button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card onClick={() => navigate('/patient/search')} className="p-4 bg-white hover:bg-blue-50 border-gray-100 cursor-pointer transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
            <p className="font-bold text-navy text-sm mb-1">Join Queue</p>
            <p className="text-xs text-muted leading-tight">Join a doctor's virtual queue</p>
          </Card>
          
          <Card onClick={() => navigate('/patient/search')} className="p-4 bg-white hover:bg-blue-50 border-gray-100 cursor-pointer transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar size={20} />
            </div>
            <p className="font-bold text-navy text-sm mb-1">Book Visit</p>
            <p className="text-xs text-muted leading-tight">Schedule a consultation</p>
          </Card>

          <Card onClick={() => navigate('/patient/search')} className="p-4 bg-white hover:bg-blue-50 border-gray-100 cursor-pointer transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Search size={20} />
            </div>
            <p className="font-bold text-navy text-sm mb-1">Find Doctor</p>
            <p className="text-xs text-muted leading-tight">Search by hospital or specialty</p>
          </Card>

          <Card onClick={() => navigate('/checkin')} className="p-4 bg-white hover:bg-blue-50 border-gray-100 cursor-pointer transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <QrCode size={20} />
            </div>
            <p className="font-bold text-navy text-sm mb-1">QR Check-in</p>
            <p className="text-xs text-muted leading-tight">Check in at the hospital</p>
          </Card>
        </div>
      </div>

      {/* Upcoming Appointment */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-3 px-1">Upcoming Appointment</h2>
        {nextAppointment ? (() => {
          const doc = doctors.find(d => d.id === nextAppointment.doctorId);
          const dept = departments?.find(d => d.id === doc?.departmentId);
          const hosp = hospitals?.find(h => h.id === doc?.hospitalId);
          
          return (
            <Card className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">{formatDoctorName(doc?.name)}</h3>
                    <p className="text-sm text-primary font-medium">{dept?.name || 'Department'}</p>
                    <div className="flex items-center text-xs text-muted mt-2 gap-3">
                      <span className="flex items-center gap-1 font-semibold text-navy"><Clock size={14} /> {formatHumanReadableDate(nextAppointment.appointmentTime)}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted mt-1 gap-3">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {hosp?.name || 'Hospital'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-50 flex gap-3">
                <button 
                  onClick={() => navigate(`/patient/doctor/${doc?.id}`)}
                  className="flex-1 bg-blue-50 text-primary font-bold py-2.5 rounded-xl text-sm hover:bg-blue-100 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => alert("Reschedule functionality coming soon")}
                  className="flex-1 bg-white border border-gray-200 text-navy font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Reschedule
                </button>
              </div>
            </Card>
          );
        })() : (
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-navy font-bold mb-1">No upcoming appointments</p>
            <p className="text-muted text-sm mb-4">Schedule a visit to see your appointments here.</p>
            <button 
              onClick={() => navigate('/patient/search')}
              className="text-primary font-bold text-sm bg-blue-50 px-5 py-2 rounded-lg hover:bg-blue-100"
            >
              Book Appointment
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

