import React, { useState } from "react";
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
import { EmergencyRequestsPanel } from "./EmergencyRequestsPanel";

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
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayQueue = state.queueEntries.filter(q => q.joinedAt && q.joinedAt.startsWith(todayStr));
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

      <EmergencyRequestsPanel />

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
            <Card key={doctor.id} className={`${borderColor} transition-colors`}>
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
