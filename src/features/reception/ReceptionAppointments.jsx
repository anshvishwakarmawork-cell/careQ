import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { 
  getTodayAppointments, 
  getUpcomingAppointments, 
  getPastAppointments, 
  getCancelledAppointments 
} from "../../store/selectors";

export const ReceptionAppointments = () => {
  const { state, dispatch } = useQueue();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("TODAY");
  
  const hospitalId = state.currentUser?.hospitalId;
  
  const todayAppointments = getTodayAppointments(state, hospitalId);
  const upcomingAppointments = getUpcomingAppointments(state, hospitalId);
  const pastAppointments = getPastAppointments(state, hospitalId);
  const cancelledAppointments = getCancelledAppointments(state, hospitalId);
  
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return "--/--/----";
    return new Date(isoString).toLocaleDateString();
  };

  const handleMarkArrived = (appointment, patientName) => {
    dispatch({
      type: ACTIONS.ADD_WALK_IN,
      payload: {
        patientName: patientName,
        doctorId: appointment.doctorId,
        priority: "NORMAL",
        reason: "Appointment check-in",
        patientId: appointment.patientId,
        source: "APPOINTMENT",
        appointmentTime: appointment.appointmentTime
      }
    });
    dispatch({
      type: ACTIONS.UPDATE_APPOINTMENT_STATUS,
      payload: {
        appointmentId: appointment.id,
        status: "CHECKED_IN"
      }
    });
  };

  const renderTable = (appointmentsList, showDate = false) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-semibold text-muted uppercase tracking-wider">
            {showDate && <th className="p-4">Date</th>}
            <th className="p-4">Time</th>
            <th className="p-4">Patient</th>
            <th className="p-4">Doctor</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {appointmentsList.length === 0 ? (
            <tr>
              <td colSpan={showDate ? "6" : "5"} className="p-8 text-center text-muted">No appointments found.</td>
            </tr>
          ) : (
            appointmentsList.map(app => {
              const doctor = state.doctors.find(d => d.id === app.doctorId);
              const patient = state.patients.find(p => p.id === app.patientId) || state.users.find(u => u.patientId === app.patientId);
              const patientName = patient?.name || "Unknown Patient";
              
              return (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  {showDate && <td className="p-4 font-medium text-navy">{formatDate(app.appointmentTime)}</td>}
                  <td className="p-4 font-medium text-navy">{formatTime(app.appointmentTime)}</td>
                  <td className="p-4">
                    <p className="font-medium text-navy">{patientName}</p>
                  </td>
                  <td className="p-4 text-muted">{doctor?.name || "Unknown Doctor"}</td>
                  <td className="p-4">
                    <Badge variant={app.status === 'BOOKED' ? 'primary' : 'success'} tone={app.status === 'CANCELLED' ? 'destructive' : 'default'}>
                      {app.status === 'BOOKED' ? 'Booked' : (app.status === 'CHECKED_IN' ? 'Checked In' : app.status)}
                    </Badge>
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedAppointment({ app, patientName, doctorName: doctor?.name || 'Unknown Doctor', patient })}>
                      View
                    </Button>
                    {app.status === 'BOOKED' && activeTab === 'TODAY' && (
                      <Button size="sm" onClick={() => handleMarkArrived(app, patientName)}>
                        Check In
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
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Appointments</h1>
      
      <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto w-max">
        {['TODAY', 'UPCOMING', 'PAST', 'CANCELLED'].map(tab => (
          <button 
            key={tab}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {activeTab === 'TODAY' && renderTable(todayAppointments, false)}
          {activeTab === 'UPCOMING' && renderTable(upcomingAppointments, true)}
          {activeTab === 'PAST' && renderTable(pastAppointments, true)}
          {activeTab === 'CANCELLED' && renderTable(cancelledAppointments, true)}
        </CardContent>
      </Card>
      
      {selectedAppointment && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedAppointment(null)}
          title="Appointment Details"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Patient Name</span>
              <span className="font-medium text-navy">{selectedAppointment.patientName}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Patient ID</span>
              <span className="font-medium text-navy">{selectedAppointment.patient?.id || selectedAppointment.app.patientId}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Date</span>
              <span className="font-medium text-navy">{formatDate(selectedAppointment.app.appointmentTime)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Time</span>
              <span className="font-medium text-navy">{formatTime(selectedAppointment.app.appointmentTime)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Doctor</span>
              <span className="font-medium text-navy">{selectedAppointment.doctorName}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted text-sm">Status</span>
              <Badge variant={selectedAppointment.app.status === 'BOOKED' ? 'primary' : 'success'} tone={selectedAppointment.app.status === 'CANCELLED' ? 'destructive' : 'default'}>
                {selectedAppointment.app.status === 'BOOKED' ? 'Booked' : (selectedAppointment.app.status === 'CHECKED_IN' ? 'Checked In' : selectedAppointment.app.status)}
              </Badge>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Close</Button>
              {selectedAppointment.app.status === 'BOOKED' && activeTab === 'TODAY' && (
                <Button onClick={() => {
                  handleMarkArrived(selectedAppointment.app, selectedAppointment.patientName);
                  setSelectedAppointment(null);
                }}>
                  Check In Patient
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
