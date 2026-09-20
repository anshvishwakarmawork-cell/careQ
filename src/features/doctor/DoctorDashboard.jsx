import React, { useState } from "react";
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
import { AlertTriangle } from "lucide-react";

export const DoctorDashboard = () => {
  const { state, dispatch } = useQueue();
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState("");

  const doctorId = state.currentUser?.doctorId;
  const doctor = state.doctors.find(d => d.id === doctorId);
  
  if (!doctor) return null;

  const isEmergencyPrepActive = state.departmentStatus[doctor.departmentId] === "EMERGENCY_PREPARATION_ACTIVE";

  const todayStr = new Date().toISOString().split('T')[0];
  const myQueue = state.queueEntries.filter(q => q.doctorId === doctorId && q.joinedAt && q.joinedAt.startsWith(todayStr));
  
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
  const canCallNext = !called && !doctor.isPaused && firstCheckedIn && !isEmergencyPrepActive;

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
            {doctor.status} {doctor.delayMinutes ? `(${doctor.delayMinutes}m)` : ''}
          </Badge>
          <Select value={doctor.status} onChange={handleStatusChange} className="w-40">
            <option value="AVAILABLE">Available</option>
            <option value="ON_BREAK">On Break</option>
            <option value="DELAYED">Delayed</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </Select>
        </div>
      </div>

      {state.emergencyRequests
        .filter(req => req.doctorId === doctorId && ['ACCEPTED', 'PATIENT_EN_ROUTE', 'ARRIVED', 'HANDED_TO_DOCTOR'].includes(req.status))
        .map(req => (
          <div key={req.id} className="bg-red-600 text-white p-4 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top">
            <div className="flex items-start gap-4">
              <AlertTriangle className="shrink-0 mt-1 animate-pulse" size={28} />
              <div>
                <h2 className="text-xl font-bold mb-1">EMERGENCY: {req.status.replace(/_/g, ' ')}</h2>
                <p className="font-medium text-red-100 mb-2">
                  Patient: {req.patientName} • Mobile: {req.mobile}
                </p>
                <p className="text-sm text-red-100 max-w-2xl">
                  {req.emergencyType} - {req.description} (Conscious: {req.conscious}, Breathing: {req.breathing})
                </p>
              </div>
            </div>
            {req.status === 'HANDED_TO_DOCTOR' && (
              <Button 
                onClick={() => {
                  dispatch({
                    type: ACTIONS.UPDATE_EMERGENCY_STATUS,
                    payload: { requestId: req.id, status: 'RESOLVED', resolutionType: 'COMPLETED' }
                  });
                  dispatch({
                    type: ACTIONS.RESUME_NORMAL_QUEUE,
                    payload: { departmentId: doctor.departmentId, requestIdToIgnore: req.id }
                  });
                }}
                className="bg-white text-red-700 hover:bg-red-50 shrink-0 font-bold px-6"
              >
                Resolve Emergency
              </Button>
            )}
          </div>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Patients Served" value={completed.length} icon={<CheckCircle size={20} className="text-status-success" />} />
        <StatCard title="Currently Waiting" value={waiting.length} icon={<Users size={20} className="text-status-info" />} />
        <StatCard title="Skipped" value={skipped.length} icon={<SkipForward size={20} className="text-status-warning" />} />
        <StatCard title="Avg Consultation" value={`${avgConsultation} min`} icon={<Clock size={20} className="text-muted" />} />
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
                className={`w-full py-8 text-xl font-bold mb-2 shadow-md ${isEmergencyPrepActive ? 'bg-gray-400 cursor-not-allowed' : ''}`}
              >
                Call Next Patient
              </Button>
              {!canCallNext && (
                <p className="text-xs text-center text-status-danger mb-6">
                  {isEmergencyPrepActive ? "Queue paused for emergency prep" :
                   called ? "Finish current consultation first" : 
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
