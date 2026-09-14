import React, { useState } from "react";
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
                  {doctor.status} {doctor.delayMinutes ? `(${doctor.delayMinutes}m)` : ''}
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
