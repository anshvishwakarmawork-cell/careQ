const fs = require('fs');
const path = require('path');

const doctorDir = path.join(__dirname, 'src', 'features', 'doctor');

if (!fs.existsSync(doctorDir)) {
  fs.mkdirSync(doctorDir, { recursive: true });
}

const files = {
  'DoctorLayout.jsx': `import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { LayoutDashboard, Users, Clock, User, LogOut } from "lucide-react";
import { Sidebar, SidebarItem } from "../../components/ui/Sidebar";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";

export const DoctorLayout = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  const navItems = [
    { to: "/doctor/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/doctor/queue", icon: <Users size={24} />, label: "Live Queue" },
    { to: "/doctor/patients", icon: <Clock size={24} />, label: "Patients" },
    { to: "/doctor/profile", icon: <User size={24} />, label: "Profile" }
  ];

  return (
    <div className="flex h-screen bg-section overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar title="CareQueue" subtitle="Doctor Portal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${
                  isActive ? "bg-primary text-white" : "text-navy hover:bg-white"
                }\`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-status-danger hover:bg-white w-full transition-colors"
            >
              <LogOut size={24} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden">
        <BottomTabBar>
          {navItems.map((item) => (
            <TabBarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </BottomTabBar>
      </div>
    </div>
  );
};
`,
  'DoctorDashboard.jsx': `import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { QueueTable } from "../../components/queue/QueueTable";
import { Clock, Users, CheckCircle, SkipForward, Play, Check } from "lucide-react";
import { formatWaitTime } from "../../lib/format";

export const DoctorDashboard = () => {
  const { state, dispatch } = useQueue();
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState("");

  const doctorId = state.currentUser?.doctorId;
  const doctor = state.doctors.find(d => d.id === doctorId);
  
  if (!doctor) return null;

  const myQueue = state.queue.filter(q => q.doctorId === doctorId && q.date === new Date().toISOString().split('T')[0]);
  
  const waiting = myQueue.filter(q => q.status === "WAITING");
  const called = myQueue.find(q => q.status === "CALLED" || q.status === "IN_CONSULTATION");
  const completed = myQueue.filter(q => q.status === "COMPLETED");
  const skipped = myQueue.filter(q => q.status === "SKIPPED");
  
  // Calculate average consultation time
  const avgConsultation = completed.length > 0 ? 
    Math.round(completed.reduce((acc, curr) => acc + 10, 0) / completed.length) : 0; // Mock calculation for now

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === "DELAYED") {
      setIsDelayModalOpen(true);
    } else {
      dispatch({ 
        type: ACTIONS.SET_DOCTOR_STATUS, 
        payload: { doctorId, status: newStatus } 
      });
    }
  };

  const submitDelay = () => {
    dispatch({ 
      type: ACTIONS.SET_DOCTOR_STATUS, 
      payload: { doctorId, status: "DELAYED", delayMinutes: parseInt(delayMinutes) || 15 } 
    });
    setIsDelayModalOpen(false);
    setDelayMinutes("");
  };

  const handleCallNext = () => {
    const firstEligible = waiting.find(q => q.checkedIn);
    if (firstEligible) {
      dispatch({ type: ACTIONS.CALL_NEXT, payload: { doctorId, entryId: firstEligible.id } });
    }
  };

  const handleStartConsultation = () => {
    if (called) {
      dispatch({ type: ACTIONS.START_CONSULTATION, payload: { entryId: called.id } });
    }
  };

  const handleComplete = () => {
    if (called) {
      dispatch({ type: ACTIONS.COMPLETE, payload: { entryId: called.id } });
    }
  };

  const handleSkip = () => {
    if (called) {
      dispatch({ type: ACTIONS.SKIP, payload: { entryId: called.id } });
    }
  };

  const handleTogglePause = () => {
    if (doctor.isPaused) {
      dispatch({ type: ACTIONS.RESUME_QUEUE, payload: { doctorId } });
    } else {
      dispatch({ type: ACTIONS.PAUSE_QUEUE, payload: { doctorId } });
    }
  };

  const firstCheckedIn = waiting.find(q => q.checkedIn);
  const canCallNext = !called && !doctor.isPaused && firstCheckedIn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy">{doctor.name}</h1>
          <p className="text-muted">{doctor.specialization} • Room {doctor.room}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            doctor.status === 'AVAILABLE' ? 'success' : 
            doctor.status === 'DELAYED' ? 'warning' : 'danger'
          }>
            {doctor.status} {doctor.delayMinutes ? \`(\${doctor.delayMinutes}m)\` : ''}
          </Badge>
          <Select value={doctor.status} onChange={handleStatusChange} className="w-40">
            <option value="AVAILABLE">Available</option>
            <option value="ON_BREAK">On Break</option>
            <option value="DELAYED">Delayed</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Patients Served" value={completed.length} icon={<CheckCircle size={20} className="text-status-success" />} />
        <StatCard title="Currently Waiting" value={waiting.length} icon={<Users size={20} className="text-status-info" />} />
        <StatCard title="Skipped" value={skipped.length} icon={<SkipForward size={20} className="text-status-warning" />} />
        <StatCard title="Avg Consultation" value={\`\${avgConsultation} min\`} icon={<Clock size={20} className="text-muted" />} />
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Patient */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Current Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {called ? (
                <div className="flex flex-col h-full justify-center items-center text-center py-8">
                  <div className="text-6xl font-bold text-primary mb-4">{called.tokenNumber}</div>
                  <h3 className="text-2xl font-bold text-navy mb-2">{called.patientName}</h3>
                  {called.priority !== 'NORMAL' && (
                    <Badge variant={called.priority === 'EMERGENCY' ? 'danger' : 'warning'} className="mb-4">
                      {called.priority}
                    </Badge>
                  )}
                  <p className="text-muted mb-8">{called.reason || "No specific reason provided"}</p>
                  
                  <div className="flex gap-4 w-full max-w-md">
                    {called.status === 'CALLED' ? (
                      <Button onClick={handleStartConsultation} className="flex-1 text-lg py-6" icon={<Play size={20} />}>
                        Start Consultation
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleComplete} className="flex-1 text-lg py-6 bg-status-success hover:bg-green-700" icon={<Check size={20} />}>
                          Complete
                        </Button>
                        <Button onClick={handleSkip} variant="outline" className="flex-1 text-lg py-6 border-status-danger text-status-danger hover:bg-red-50">
                          Skip
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-center items-center text-center py-16 text-muted">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">No patient currently called.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Queue Controls */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Queue Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <Button 
                onClick={handleCallNext} 
                disabled={!canCallNext}
                className="w-full py-8 text-xl font-bold mb-2 shadow-md"
              >
                Call Next Patient
              </Button>
              {!canCallNext && (
                <p className="text-xs text-center text-status-danger mb-6">
                  {called ? "Finish current consultation first" : 
                   doctor.isPaused ? "Queue is paused" : 
                   waiting.length > 0 ? "Next patient hasn't arrived" : "Queue is empty"}
                </p>
              )}
              
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  onClick={handleTogglePause}
                  className="w-full"
                >
                  {doctor.isPaused ? "Resume Queue" : "Pause Queue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Queue Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Up Next</CardTitle>
        </CardHeader>
        <CardContent>
          {waiting.length === 0 ? (
            <div className="text-center py-8 text-muted">Queue is empty.</div>
          ) : (
            <QueueTable entries={waiting.slice(0, 8)} />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isDelayModalOpen} onClose={() => setIsDelayModalOpen(false)} title="Set Delay">
        <div className="space-y-4">
          <p className="text-sm text-muted">Notify waiting patients about the delay.</p>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Delay duration (minutes)</label>
            <Input 
              type="number" 
              value={delayMinutes} 
              onChange={(e) => setDelayMinutes(e.target.value)} 
              placeholder="15"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDelayModalOpen(false)}>Cancel</Button>
            <Button onClick={submitDelay}>Apply Delay</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
`,
  'DoctorQueue.jsx': `import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const DoctorQueue = () => {
  const { state } = useQueue();
  const doctorId = state.currentUser?.doctorId;
  
  if (!doctorId) return null;

  const myQueue = state.queue.filter(q => q.doctorId === doctorId && q.date === new Date().toISOString().split('T')[0]);
  const waiting = myQueue.filter(q => q.status === "WAITING");
  const called = myQueue.filter(q => q.status === "CALLED" || q.status === "IN_CONSULTATION");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Live Queue</h1>
      
      {called.length > 0 && (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-primary">Currently Serving</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueTable entries={called} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waiting ({waiting.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {waiting.length === 0 ? (
            <div className="text-center py-8 text-muted">No patients waiting.</div>
          ) : (
            <QueueTable entries={waiting} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
`,
  'DoctorPatients.jsx': `import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const DoctorPatients = () => {
  const { state } = useQueue();
  const doctorId = state.currentUser?.doctorId;
  
  if (!doctorId) return null;

  const myQueue = state.queue.filter(q => q.doctorId === doctorId && q.date === new Date().toISOString().split('T')[0]);
  const completed = myQueue.filter(q => q.status === "COMPLETED");
  const skipped = myQueue.filter(q => q.status === "SKIPPED");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Today's Patients</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Completed Consultations ({completed.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-center py-8 text-muted">No completed consultations yet today.</div>
          ) : (
            <QueueTable entries={completed} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skipped Patients ({skipped.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {skipped.length === 0 ? (
            <div className="text-center py-8 text-muted">No patients were skipped today.</div>
          ) : (
            <QueueTable entries={skipped} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
`,
  'DoctorProfile.jsx': `import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ACTIONS } from "../../store/actions";
import { useNavigate } from "react-router-dom";

export const DoctorProfile = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  
  const doctorId = state.currentUser?.doctorId;
  const doctor = state.doctors.find(d => d.id === doctorId);

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  if (!doctor) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">Doctor Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <p className="text-sm text-muted">Name</p>
              <p className="font-medium text-navy">{doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Specialization</p>
              <p className="font-medium text-navy">{doctor.specialization}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <p className="text-sm text-muted">Hospital</p>
              <p className="font-medium text-navy">City Care Hospital</p>
            </div>
            <div>
              <p className="text-sm text-muted">Room</p>
              <p className="font-medium text-navy">{doctor.room}</p>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full text-status-danger border-status-danger hover:bg-red-50" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(doctorDir, filename), content);
}
console.log('Doctor components created.');
