import React, { useState } from "react";
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
        title: `Delay Notice`,
        message: broadcast.message || `Dr. ${state.doctors.find(d=>d.id===broadcast.doctorId)?.name} is delayed by ${broadcast.minutes} minutes.`,
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
