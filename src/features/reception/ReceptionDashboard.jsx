import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Users, Clock, AlertCircle, Plus, Activity, Stethoscope, UserPlus, ShieldCheck, QrCode, TrendingUp, Calendar as CalendarIcon, HeartPulse, Stethoscope as StethIcon } from "lucide-react";
import { EmergencyRequestsPanel } from "./EmergencyRequestsPanel";
import { getEstimatedWait, getPendingRequests, getEmergenciesByHospital, getReceptionDashboardStats, getTodayAppointments } from "../../store/selectors";
import { DoctorStatusBadge } from "../../components/queue/DoctorStatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { waitTimeData, throughputData } from "../../data/analytics";

export const ReceptionDashboard = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  
  const [walkInForm, setWalkInForm] = useState({
    patientName: "", mobile: "", doctorId: "", reason: "", priority: "NORMAL"
  });

  const { currentUser, users } = state;
  const hospitalId = currentUser?.hospitalId;
  const dashboardStats = getReceptionDashboardStats(state, hospitalId);
  const hospitalName = dashboardStats.hospitalName;

  // Scoped Selectors
  const scopedDoctors = state.doctors.filter(d => d.hospitalId === hospitalId);
  const activeDoctors = scopedDoctors.filter(d => d.status !== "UNAVAILABLE");
  
  const todayStr = new Date().toISOString().split('T')[0];
  const scopedQueue = state.queueEntries.filter(q => q.hospitalId === hospitalId);
  const todayQueue = scopedQueue.filter(q => q.joinedAt && q.joinedAt.startsWith(todayStr));
  const waitingPatients = todayQueue.filter(q => q.status === "WAITING" || q.status === "CALLED");
  const emergencies = todayQueue.filter(q => q.priority === "EMERGENCY");
  
  // Stat Card 5: Pending Verifications
  const pendingRequests = getPendingRequests(state, hospitalId);
  const pendingDoctors = scopedDoctors.filter(d => 
    d.verificationStatus === "PENDING_VERIFICATION" || 
    d.verificationStatus === "CHANGES_REQUESTED" || 
    (!d.verificationStatus && users.find(u => u.id === d.id && !u.verified))
  ).filter(d => d.verificationStatus !== 'VERIFIED');
  const totalPendingVerifications = pendingRequests.length + pendingDoctors.length;
  
  // Appointments
  const todayAppointments = getTodayAppointments(state, hospitalId);
  
  // Stat Card 2: Average Wait
  const waitingPatientsWaitTimes = waitingPatients.map(q => getEstimatedWait(state, q.id));
  const avgWait = waitingPatientsWaitTimes.length > 0 
    ? waitingPatientsWaitTimes.reduce((a, b) => a + b, 0) / waitingPatientsWaitTimes.length 
    : 0;
  const avgWaitFormatted = waitingPatientsWaitTimes.length > 0 ? `~${Math.round(avgWait)} min` : "--";

  // Stat Card 6: Emergency Status (Coordination Requests)
  const activeEmergencies = dashboardStats.activeEmergencies;
  const emergencyText = activeEmergencies > 0 ? `${activeEmergencies} Active` : "0 Active";

  // Department Load Data
  const deptLoadMap = {};
  waitingPatients.forEach(q => {
    const doc = state.doctors.find(d => d.id === q.doctorId);
    if (doc) {
      deptLoadMap[doc.specialization] = (deptLoadMap[doc.specialization] || 0) + 1;
    }
  });
  const departmentLoadData = Object.keys(deptLoadMap).map(k => ({
    name: k,
    waiting: deptLoadMap[k]
  })).sort((a, b) => b.waiting - a.waiting);

  // Scoped Analytics Data
  const scopedWaitTimeData = waitTimeData[hospitalId] || waitTimeData["H1"];
  const scopedThroughputData = throughputData[hospitalId] || throughputData["H1"];

  // Peak Hours Data (Derived from waitTimeData or hardcoded mapping)
  const peakHoursData = scopedWaitTimeData.map(d => ({
    time: d.time,
    load: d.avgWait > 40 ? "High" : d.avgWait > 20 ? "Moderate" : "Low",
    value: d.avgWait
  }));
  
  const handleAddWalkIn = (e) => {
    e.preventDefault();
    dispatch({ type: ACTIONS.ADD_WALK_IN, payload: { ...walkInForm } });
    setIsWalkInModalOpen(false);
    setWalkInForm({ patientName: "", mobile: "", doctorId: "", reason: "", priority: "NORMAL" });
  };

  // Scroll to section based on hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const scrollToSection = (id) => {
    navigate(`/reception/dashboard#${id}`);
  };



  return (
    <div className="space-y-8 pb-12">
      {/* Header & Section Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4" id="overview">
        <div>
          <h1 className="text-2xl font-bold text-navy">Coordinator Dashboard</h1>
          <p className="text-lg font-medium text-slate-700">{hospitalName}</p>
          <p className="text-sm text-muted mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2 flex-wrap text-sm">
          <Button variant="outline" size="sm" onClick={() => scrollToSection('overview')}>Overview</Button>
          <Button variant="outline" size="sm" onClick={() => scrollToSection('queues')}>Queues</Button>
          <Button variant="outline" size="sm" onClick={() => scrollToSection('appointments')}>Appointments</Button>
          <Button variant="outline" size="sm" onClick={() => scrollToSection('analytics')}>Analytics</Button>
        </div>
      </div>

      {/* Top Stat Cards (Exactly 6) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Patients Waiting" value={waitingPatients.length} sublabel="Across all active queues" icon={<Users size={20} />} tone="default" />
        <StatCard label="Average Wait" value={avgWaitFormatted} sublabel="Current hospital average" icon={<Clock size={20} />} tone="default" />
        <StatCard label="Active Doctors" value={activeDoctors.length} sublabel={`${activeDoctors.filter(d => d.status === 'AVAILABLE').length} available`} icon={<Stethoscope size={20} />} tone="default" />
        <StatCard label="Today's Appointments" value={todayAppointments.length} sublabel={`${todayAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'BOOKED').length} upcoming`} icon={<CalendarIcon size={20} />} tone="default" />
        <StatCard label="Pending Verifications" value={totalPendingVerifications} sublabel="Patient + doctor requests" icon={<ShieldCheck size={20} />} tone={totalPendingVerifications > 0 ? "warning" : "default"} onClick={() => navigate('/reception/verifications')} className="cursor-pointer transition-transform hover:scale-105" />
        <StatCard label="Emergency Status" value={emergencyText} sublabel={activeEmergencies > 0 ? "Require coordination" : "All clear"} icon={<HeartPulse size={20} />} tone={activeEmergencies > 0 ? "danger" : "success"} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={() => setIsWalkInModalOpen(true)} className="h-12 justify-start shadow-sm" icon={<UserPlus size={18} />}>Add Walk-in</Button>
          <Button variant="outline" onClick={() => navigate('/reception/verification')} className="h-12 justify-start text-navy shadow-sm" icon={<ShieldCheck size={18} />}>Verify Token</Button>
          <Button variant="outline" onClick={() => navigate('/reception/verifications')} className="h-12 justify-start text-navy shadow-sm" icon={<StethIcon size={18} />}>Doctor Verification</Button>
          <Button variant="outline" onClick={() => navigate('/reception/qr')} className="h-12 justify-start text-navy shadow-sm" icon={<QrCode size={18} />}>Patient QR Check-in</Button>
        </div>
      </div>

      {/* Live Operations */}
      <div id="queues" className="pt-4 scroll-mt-6">
        <h2 className="text-xl font-bold text-navy mb-4">Doctor Queues Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeDoctors.map(doctor => {
            const doctorQueue = waitingPatients.filter(q => q.doctorId === doctor.id);
            const currentCall = todayQueue.find(q => q.doctorId === doctor.id && (q.status === "CALLED" || q.status === "IN_CONSULTATION"));
            const waitingCount = doctorQueue.length;
            
            let borderColor = "border-slate-200";
            if (waitingCount > 15) borderColor = "border-status-danger border-t-4";
            else if (waitingCount > 8) borderColor = "border-status-warning border-t-4";

            return (
              <Card key={doctor.id} className={`${borderColor} transition-colors flex flex-col h-full`}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="font-bold text-navy truncate block" title={doctor.name}>{doctor.name}</h3>
                      <p className="text-xs text-muted truncate block" title={doctor.specialization}>{doctor.specialization}</p>
                    </div>
                    <DoctorStatusBadge doctor={doctor} className="shrink-0 text-xs" />
                  </div>
                  <div className="mt-auto pt-4 flex justify-between items-end border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Current Token &nbsp;/&nbsp; Waiting</p>
                      <p className="font-bold text-lg leading-none">
                        {currentCall ? currentCall.tokenNumber : "--"} <span className="text-slate-300 font-light mx-1">/</span> <span className={waitingCount > 8 ? "text-status-warning" : ""}>{waitingCount}</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs py-1 h-8" onClick={() => navigate('/reception/queues/' + doctor.id)}>View Queue</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Live Patient Queue */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live Patient Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {waitingPatients.length === 0 ? (
            <div className="text-center py-12 text-muted border-2 border-dashed border-slate-200 rounded-lg">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p>No patients are currently waiting.</p>
            </div>
          ) : (
            <QueueTable entries={waitingPatients.slice(0, 15)} showActions={true} />
          )}
        </CardContent>
      </Card>

      {/* Emergency / Priority Alerts */}
      <div className={activeEmergencies === 0 ? "hidden" : "block mt-6"}>
        <EmergencyRequestsPanel />
      </div>
      {activeEmergencies === 0 && (
        <div className="text-sm text-slate-400 italic text-center mt-6">No active emergency coordination requests.</div>
      )}

      {/* Today's Appointments */}
      <Card id="appointments" className="scroll-mt-6 mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Appointments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/reception/appointments')}>View All Appointments</Button>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted border-2 border-dashed border-slate-200 rounded-lg">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Time</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.slice(0, 5).map(app => {
                    const patient = state.patients.find(p => p.id === app.patientId) || state.users.find(u => u.patientId === app.patientId);
                    const patientName = patient?.name || "Unknown Patient";
                    const formatTime = (isoString) => isoString ? new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
                    return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-navy">{formatTime(app.appointmentTime)}</td>
                      <td className="px-4 py-3">{patientName}</td>
                      <td className="px-4 py-3 text-slate-600">{state.doctors.find(d => d.id === app.doctorId)?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={app.status === 'CHECKED_IN' ? 'success' : app.status === 'SCHEDULED' || app.status === 'BOOKED' ? 'info' : 'default'}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate('/reception/appointments')}>View</Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Analytics */}
      <div id="analytics" className="pt-8 mt-8 scroll-mt-6 border-t border-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-navy">Hospital Analytics</h2>
          <p className="text-sm text-muted mt-1">Operational insights for today's patient flow</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wait Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Wait Time Trends — Today</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scopedWaitTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="avgWait" name="Average Wait" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="peakWait" name="Peak Wait" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Patient Throughput */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Patient Throughput — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scopedThroughputData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="patients" name="Patients Served" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Load */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Department Load — Current Waiting</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {departmentLoadData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">Not enough data available yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentLoadData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} width={120} />
                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="waiting" name="Waiting Patients" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Queue Load by Time (Peak Hours)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" name="Queue Load Impact" radius={[4, 4, 0, 0]}>
                    {peakHoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.load === 'High' ? '#ef4444' : entry.load === 'Moderate' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs flex justify-center gap-4 text-slate-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#10b981]"></div> Low</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#f59e0b]"></div> Moderate</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#ef4444]"></div> High</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pt-8 mt-8 border-t border-slate-200">
        <h2 className="text-xl font-bold text-navy mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 max-h-60 overflow-y-auto">
          {state.notifications && state.notifications.filter(n => n.hospitalId === hospitalId).length > 0 ? (
            <div className="space-y-4">
              {state.notifications.filter(n => n.hospitalId === hospitalId).slice(0, 10).map((note, idx) => (
                <div key={idx} className="flex gap-3 text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="text-slate-400 whitespace-nowrap min-w-[70px]">
                    {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-navy">{note.message}</div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 text-slate-400 italic">No recent activity found.</div>
          )}
        </div>
      </div>

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
                <option key={d.id} value={d.id}>
                  {d.name} {d.specialization ? `— ${d.specialization}` : ""}
                </option>
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
