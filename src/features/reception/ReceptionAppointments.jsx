import React from "react";
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
