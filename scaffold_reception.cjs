const fs = require('fs');
const path = require('path');

const receptionDir = path.join(__dirname, 'src', 'features', 'reception');

if (!fs.existsSync(receptionDir)) {
  fs.mkdirSync(receptionDir, { recursive: true });
}

const files = {
  'ReceptionLayout.jsx': `import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { LayoutDashboard, Users, UserRound, Calendar, Bell, LogOut } from "lucide-react";
import { Sidebar } from "../../components/ui/Sidebar";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";

export const ReceptionLayout = () => {
  const { dispatch } = useQueue();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  const navItems = [
    { to: "/reception/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/reception/queues", icon: <Users size={24} />, label: "Queues" },
    { to: "/reception/doctors", icon: <UserRound size={24} />, label: "Doctors" },
    { to: "/reception/appointments", icon: <Calendar size={24} />, label: "Appointments" },
    { to: "/reception/notifications", icon: <Bell size={24} />, label: "Notifications" }
  ];

  return (
    <div className="flex h-screen bg-section overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-[#E2E8F0] bg-white">
        <Sidebar title="CareQueue" subtitle="Coordinator Portal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                \`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors \${
                  isActive ? "bg-primary text-white" : "text-navy hover:bg-slate-50"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-status-danger hover:bg-slate-50 w-full transition-colors"
            >
              <LogOut size={24} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden">
        <BottomTabBar>
          {navItems.slice(0, 4).map((item) => (
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
  'ReceptionDashboard.jsx': `import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { QueueTable } from "../../components/queue/QueueTable";
import { Users, Clock, AlertCircle, Plus, Activity } from "lucide-react";

export const ReceptionDashboard = () => {
  const { state, dispatch } = useQueue();
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  
  const [walkInForm, setWalkInForm] = useState({
    patientName: "",
    mobile: "",
    doctorId: "",
    reason: "",
    priority: "NORMAL"
  });

  const activeDoctors = state.doctors.filter(d => d.status !== "UNAVAILABLE");
  
  const todayQueue = state.queue.filter(q => q.date === new Date().toISOString().split('T')[0]);
  const waitingPatients = todayQueue.filter(q => q.status === "WAITING");
  const emergencies = todayQueue.filter(q => q.priority === "EMERGENCY");
  const notCheckedIn = waitingPatients.filter(q => !q.checkedIn);
  
  const handleAddWalkIn = (e) => {
    e.preventDefault();
    dispatch({
      type: ACTIONS.ADD_WALK_IN,
      payload: { ...walkInForm }
    });
    // Assuming dispatch resolves sync for UI mock
    setIsWalkInModalOpen(false);
    setWalkInForm({ patientName: "", mobile: "", doctorId: "", reason: "", priority: "NORMAL" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Coordinator Dashboard — City Care Hospital</h1>
          <p className="text-muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button onClick={() => setIsWalkInModalOpen(true)} icon={<Plus size={20} />} className="w-full md:w-auto text-lg py-6 shadow-md">
          Add Walk-in
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Active Doctors" value={activeDoctors.length} icon={<Activity size={20} className="text-primary" />} />
        <StatCard title="Waiting" value={waitingPatients.length} icon={<Users size={20} className="text-status-info" />} />
        <StatCard title="Avg Wait" value="25m" icon={<Clock size={20} className="text-muted" />} />
        <StatCard title="Emergencies" value={emergencies.length} icon={<AlertCircle size={20} className="text-status-danger" />} />
        <StatCard title="Not Checked In" value={notCheckedIn.length} icon={<Users size={20} className="text-status-warning" />} />
      </div>

      {/* Doctor Queues Overview */}
      <h2 className="text-xl font-bold text-navy pt-4">Doctor Queues Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeDoctors.map(doctor => {
          const doctorQueue = waitingPatients.filter(q => q.doctorId === doctor.id);
          const currentCall = todayQueue.find(q => q.doctorId === doctor.id && (q.status === "CALLED" || q.status === "IN_CONSULTATION"));
          const waitingCount = doctorQueue.length;
          
          let borderColor = "border-[#E2E8F0]";
          if (waitingCount > 15) borderColor = "border-status-danger border-t-4";
          else if (waitingCount > 8) borderColor = "border-status-warning border-t-4";

          return (
            <Card key={doctor.id} className={\`\${borderColor} transition-colors\`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-navy">{doctor.name}</h3>
                    <p className="text-sm text-muted">{doctor.department}</p>
                  </div>
                  <Badge variant={doctor.status === 'AVAILABLE' ? 'success' : doctor.status === 'DELAYED' ? 'warning' : 'danger'}>
                    {doctor.status}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted">Current / Waiting</p>
                    <p className="font-bold text-lg">
                      {currentCall ? currentCall.tokenNumber : "--"} / <span className={waitingCount > 8 ? "text-status-warning" : ""}>{waitingCount}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs py-1">View Queue</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Patient Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Patient Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {waitingPatients.length === 0 ? (
             <div className="text-center py-8 text-muted">No patients currently waiting.</div>
          ) : (
            <QueueTable entries={waitingPatients.slice(0, 10)} showActions={true} />
          )}
        </CardContent>
      </Card>

      {/* Add Walk-In Modal */}
      <Modal isOpen={isWalkInModalOpen} onClose={() => setIsWalkInModalOpen(false)} title="Add Walk-in Patient">
        <form onSubmit={handleAddWalkIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Patient Name *</label>
            <Input required value={walkInForm.patientName} onChange={e => setWalkInForm({...walkInForm, patientName: e.target.value})} placeholder="Full Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Mobile (Optional)</label>
            <Input value={walkInForm.mobile} onChange={e => setWalkInForm({...walkInForm, mobile: e.target.value})} placeholder="+91" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Doctor *</label>
            <Select required value={walkInForm.doctorId} onChange={e => setWalkInForm({...walkInForm, doctorId: e.target.value})}>
              <option value="">Select Doctor...</option>
              {activeDoctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Priority</label>
            <Select value={walkInForm.priority} onChange={e => setWalkInForm({...walkInForm, priority: e.target.value})}>
              <option value="NORMAL">Normal</option>
              <option value="PRIORITY">Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="EMERGENCY">Emergency</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Reason (Optional)</label>
            <Input value={walkInForm.reason} onChange={e => setWalkInForm({...walkInForm, reason: e.target.value})} placeholder="Brief reason for visit" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsWalkInModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Token</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
`,
  'ReceptionQueues.jsx': `import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const ReceptionQueues = () => {
  const { state } = useQueue();
  const [activeTab, setActiveTab] = useState("ALL");

  const todayQueue = state.queue.filter(q => q.date === new Date().toISOString().split('T')[0] && q.status === "WAITING");
  const filteredQueue = activeTab === "ALL" ? todayQueue : todayQueue.filter(q => q.doctorId === activeTab);
  
  const activeDoctors = state.doctors.filter(d => d.status !== "UNAVAILABLE");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">All Hospital Queues</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap \${activeTab === "ALL" ? "bg-navy text-white" : "bg-white text-navy border border-[#E2E8F0]"}\`}
        >
          All Doctors
        </button>
        {activeDoctors.map(doctor => (
          <button
            key={doctor.id}
            onClick={() => setActiveTab(doctor.id)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap \${activeTab === doctor.id ? "bg-primary text-white" : "bg-white text-navy border border-[#E2E8F0]"}\`}
          >
            {doctor.name}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredQueue.length === 0 ? (
             <div className="text-center py-8 text-muted">No patients waiting.</div>
          ) : (
            <QueueTable entries={filteredQueue} showActions={true} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
`,
  'ReceptionDoctors.jsx': `import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export const ReceptionDoctors = () => {
  const { state, dispatch } = useQueue();
  const [delayModal, setDelayModal] = useState({ isOpen: false, doctorId: null, minutes: 15 });

  const handleStatusChange = (doctorId, status) => {
    dispatch({ type: ACTIONS.SET_DOCTOR_STATUS, payload: { doctorId, status } });
  };

  const handleApplyDelay = () => {
    dispatch({ 
      type: ACTIONS.SET_DOCTOR_STATUS, 
      payload: { doctorId: delayModal.doctorId, status: "DELAYED", delayMinutes: delayModal.minutes } 
    });
    setDelayModal({ isOpen: false, doctorId: null, minutes: 15 });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Doctor Status Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.doctors.map(doctor => (
          <Card key={doctor.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-navy">{doctor.name}</h3>
                  <p className="text-sm text-muted">{doctor.department} • Room {doctor.room}</p>
                </div>
                <Badge variant={doctor.status === 'AVAILABLE' ? 'success' : doctor.status === 'DELAYED' ? 'warning' : 'danger'}>
                  {doctor.status} {doctor.delayMinutes ? \`(\${doctor.delayMinutes}m)\` : ''}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant={doctor.status === 'AVAILABLE' ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(doctor.id, 'AVAILABLE')}
                >
                  Available
                </Button>
                <Button 
                  size="sm" 
                  variant={doctor.status === 'ON_BREAK' ? 'primary' : 'outline'}
                  onClick={() => handleStatusChange(doctor.id, 'ON_BREAK')}
                >
                  On Break
                </Button>
                <Button 
                  size="sm" 
                  variant={doctor.status === 'DELAYED' ? 'primary' : 'outline'}
                  onClick={() => setDelayModal({ isOpen: true, doctorId: doctor.id, minutes: 15 })}
                >
                  Set Delayed
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={delayModal.isOpen} onClose={() => setDelayModal({ ...delayModal, isOpen: false })} title="Set Doctor Delayed">
        <div className="space-y-4">
          <p className="text-sm text-muted">This will automatically notify all waiting patients for this doctor.</p>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Delay duration (minutes)</label>
            <Input 
              type="number" 
              value={delayModal.minutes} 
              onChange={(e) => setDelayModal({...delayModal, minutes: parseInt(e.target.value) || 0})} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDelayModal({ ...delayModal, isOpen: false })}>Cancel</Button>
            <Button onClick={handleApplyDelay}>Confirm Delay</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
`,
  'ReceptionAppointments.jsx': `import React from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export const ReceptionAppointments = () => {
  const { state, dispatch } = useQueue();
  
  // Use mock appointments from state or a generic list if not in global state
  const todayAppointments = state.appointments || []; 
  
  const handleMarkArrived = (appointment) => {
    // Converts appointment to a WAITING queue entry
    dispatch({
      type: ACTIONS.ADD_WALK_IN, // Reusing ADD_WALK_IN logic for generating a token
      payload: {
        patientName: appointment.patientName,
        doctorId: appointment.doctorId,
        priority: "NORMAL",
        reason: appointment.reason,
        patientId: appointment.patientId,
        source: "APPOINTMENT",
        appointmentTime: appointment.time
      }
    });
    // In a real app we'd also mark the appointment as fulfilled
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Today's Appointments</h1>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="p-4">Time</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-muted">No appointments found for today.</td>
                  </tr>
                ) : (
                  todayAppointments.map(app => {
                    const doctor = state.doctors.find(d => d.id === app.doctorId);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-navy">{app.time}</td>
                        <td className="p-4">
                          <p className="font-medium text-navy">{app.patientName}</p>
                        </td>
                        <td className="p-4 text-muted">{doctor?.name}</td>
                        <td className="p-4">
                          <Badge variant={app.status === 'SCHEDULED' ? 'primary' : 'success'}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {app.status === 'SCHEDULED' && (
                            <Button size="sm" onClick={() => handleMarkArrived(app)}>
                              Mark Arrived
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
`,
  'ReceptionNotifications.jsx': `import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";

export const ReceptionNotifications = () => {
  const { state, dispatch } = useQueue();
  const [broadcast, setBroadcast] = useState({ doctorId: "", minutes: 15, message: "" });
  
  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcast.doctorId) return;
    
    // In a real app, this would iterate over all active patients for this doctor
    // and push a notification. For this mock, we'll dispatch a global action.
    dispatch({ 
      type: ACTIONS.PUSH_NOTIFICATION, 
      payload: { 
        userId: "GLOBAL", // Special identifier for broad notifications
        title: \`Delay Notice\`,
        message: broadcast.message || \`Dr. \${state.doctors.find(d=>d.id===broadcast.doctorId)?.name} is delayed by \${broadcast.minutes} minutes.\`,
        type: "warning"
      } 
    });
    
    // Also set doctor delayed status which triggers ETA recalculations natively
    dispatch({ 
      type: ACTIONS.SET_DOCTOR_STATUS, 
      payload: { doctorId: broadcast.doctorId, status: "DELAYED", delayMinutes: broadcast.minutes } 
    });

    setBroadcast({ doctorId: "", minutes: 15, message: "" });
    alert("Broadcast sent successfully!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Notifications & Announcements</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Delay Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Select Doctor</label>
                <Select required value={broadcast.doctorId} onChange={e => setBroadcast({...broadcast, doctorId: e.target.value})}>
                  <option value="">Choose a doctor...</option>
                  {state.doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Delay Duration (minutes)</label>
                <Input 
                  type="number" 
                  required 
                  value={broadcast.minutes} 
                  onChange={e => setBroadcast({...broadcast, minutes: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Custom Message (Optional)</label>
                <Input 
                  value={broadcast.message} 
                  onChange={e => setBroadcast({...broadcast, message: e.target.value})} 
                  placeholder="Leave blank for default message"
                />
              </div>
              <Button type="submit" className="w-full">Send Broadcast</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Outbound Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted">
              System log of outbound SMS/Push notifications would appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(receptionDir, filename), content);
}
console.log('Reception components created.');
