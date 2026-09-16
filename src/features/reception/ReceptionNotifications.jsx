import React, { useState, useMemo } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { ConfirmationModal } from "./ConfirmationModal";
import { DirectAlertsTab } from "./DirectAlertsTab";
const AppointmentAlertsTab = ({ state, dispatch }) => {
  const [formData, setFormData] = useState({
    type: "DELAY",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    timeFrom: "",
    timeTo: "",
    delayMinutes: 30,
    newDate: "",
    message: ""
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const hospitalId = state.currentUser?.hospitalId;
  const hospitalDoctors = state.doctors.filter((d) => d.hospitalId === hospitalId);

  const affectedAppointments = useMemo(() => {
    if (!formData.doctorId || !formData.date) return [];
    
    return state.appointments.filter((a) => {
      if (a.hospitalId !== hospitalId) return false;
      if (a.doctorId !== formData.doctorId) return false;
      if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.status)) return false;

      // Normalize date/time fields between mock data and dynamic bookings
      const apptDate = a.date || (a.appointmentTime ? a.appointmentTime.split('T')[0] : null);
      const apptTime = a.time || (a.appointmentTime ? a.appointmentTime.split('T')[1].substring(0, 5) : null);

      if (apptDate !== formData.date) return false;
      if (formData.timeFrom && apptTime < formData.timeFrom) return false;
      if (formData.timeTo && apptTime > formData.timeTo) return false;
      
      return true;
    });
  }, [state.appointments, formData, hospitalId]);

  const doctor = hospitalDoctors.find((d) => d.id === formData.doctorId);
  const hospital = state.hospitals.find((h) => h.id === hospitalId);

  let defaultMsg = "";
  if (doctor) {
    if (formData.type === "DELAY") defaultMsg = `Dr. ${doctor.name} is currently running approximately ${formData.delayMinutes} minutes behind schedule. Your appointment remains confirmed.`;
    if (formData.type === "RESCHEDULE") defaultMsg = `Your appointment with Dr. ${doctor.name} at ${hospital?.name} has been rescheduled from ${formData.date} to ${formData.newDate}.`;
    if (formData.type === "CANCEL") defaultMsg = `Your appointment with Dr. ${doctor.name} on ${formData.date} has been cancelled by ${hospital?.name}. Please wait for further scheduling information.`;
    if (formData.type === "GENERAL") defaultMsg = `General Update regarding your appointment with Dr. ${doctor.name}.`;
  }
  const displayMsg = formData.message || defaultMsg;

  const executeSend = (effectiveType, overrideNewDate) => {
    const finalType = effectiveType || formData.type;
    const finalNewDate = overrideNewDate || formData.newDate;

    let finalMsg = formData.message;
    if (!finalMsg) {
       if (finalType === "DELAY") finalMsg = `Dr. ${doctor?.name} is currently running approximately ${formData.delayMinutes} minutes behind schedule. Your appointment remains confirmed.`;
       if (finalType === "RESCHEDULE") finalMsg = `Your appointment with Dr. ${doctor?.name} at ${hospital?.name} has been rescheduled from ${formData.date} to ${finalNewDate}.`;
       if (finalType === "CANCEL") finalMsg = `Your appointment with Dr. ${doctor?.name} on ${formData.date} has been cancelled by ${hospital?.name}. Please wait for further scheduling information.`;
       if (finalType === "GENERAL") finalMsg = `General Update regarding your appointment with Dr. ${doctor?.name}.`;
    }

    const broadcast = {
      id: `B-${Date.now()}`,
      hospitalId,
      type: `APPOINTMENT_${finalType}`,
      audienceType: "APPOINTMENT",
      doctorId: formData.doctorId,
      departmentId: doctor?.departmentId,
      affectedDate: formData.date,
      affectedFrom: formData.timeFrom,
      affectedTo: formData.timeTo,
      message: finalMsg,
      recipientCount: affectedAppointments.length,
      sentByUserId: state.currentUser?.id,
      sentByName: state.currentUser?.name,
      createdAt: new Date().toISOString(),
      oldDate: finalType === "RESCHEDULE" ? formData.date : null,
      newDate: finalType === "RESCHEDULE" ? finalNewDate : null
    };

    const targetedNotifications = affectedAppointments.map((a) => ({
      id: `N-${Date.now()}-${a.id}`,
      userId: a.patientId,
      hospitalId,
      doctorId: a.doctorId,
      broadcastId: broadcast.id,
      type: broadcast.type,
      title: finalType === "CANCEL" ? "Appointment Cancelled" : finalType === "RESCHEDULE" ? "Appointment Rescheduled" : "Appointment Update",
      message: finalMsg,
      read: false,
      popupSeen: false,
      createdAt: new Date().toISOString(),
      targetType: "APPOINTMENT",
      targetId: a.id,
      oldDate: finalType === "RESCHEDULE" ? formData.date : null,
      newDate: finalType === "RESCHEDULE" ? finalNewDate : null
    }));

    if (finalType === "RESCHEDULE") {
      dispatch({ 
        type: ACTIONS.BULK_RESCHEDULE_APPOINTMENTS, 
        payload: { appointmentIds: affectedAppointments.map(a=>a.id), newDate: finalNewDate } 
      });
    } else if (finalType === "CANCEL") {
      dispatch({
        type: ACTIONS.BULK_RESCHEDULE_APPOINTMENTS,
        payload: { appointmentIds: affectedAppointments.map(a=>a.id), status: "CANCELLED" }
      });
    }

    dispatch({ type: ACTIONS.CREATE_BROADCAST, payload: { broadcast, targetedNotifications } });
    
    setModalOpen(false);
    setFormData((prev) => ({ ...prev, message: "" }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      alert("Please select a doctor.");
      return;
    }
    if (affectedAppointments.length === 0) {
      alert("No upcoming appointments found for this doctor on the selected date.");
      return;
    }

    setModalData({
      type: formData.type,
      recipientCount: affectedAppointments.length,
      doctor: doctor,
      newDate: formData.type === "RESCHEDULE" ? formData.newDate : null,
    });
    setModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Alert Type</label>
              <Select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="DELAY">Doctor Running Late</option>
                <option value="RESCHEDULE">Appointment Rescheduled</option>
                <option value="CANCEL">Appointment Cancelled</option>
                <option value="GENERAL">General Appointment Update</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Doctor</label>
              <Select required value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})}>
                <option value="">Choose a doctor...</option>
                {hospitalDoctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Date</label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              {formData.type === "RESCHEDULE" && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">New Date</label>
                  <Input type="date" required value={formData.newDate} onChange={(e) => setFormData({...formData, newDate: e.target.value})} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">From Time (Optional)</label>
                <Input type="time" value={formData.timeFrom} onChange={(e) => setFormData({...formData, timeFrom: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">To Time (Optional)</label>
                <Input type="time" value={formData.timeTo} onChange={(e) => setFormData({...formData, timeTo: e.target.value})} />
              </div>
            </div>

            {formData.type === "DELAY" && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Approximate Delay (minutes)</label>
                <Input type="number" required value={formData.delayMinutes} onChange={(e) => setFormData({...formData, delayMinutes: parseInt(e.target.value) || 0})} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Message</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm h-24 resize-none"
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})} 
                placeholder={defaultMsg}
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full">
                {formData.type === "RESCHEDULE" || formData.type === "CANCEL" ? "Confirm & Notify" : "Send Alert"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.doctorId ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="font-semibold text-primary mb-2">Recipients</p>
                <p className="text-sm text-navy">
                  <span className="font-bold text-lg">{affectedAppointments.length}</span> Patients have eligible appointments with Dr. {doctor?.name} 
                  {formData.timeFrom ? ` between ${formData.timeFrom} and ${formData.timeTo}` : ''} on {formData.date}.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <h4 className="font-bold text-navy mb-2">{formData.type === "CANCEL" ? "Appointment Cancelled" : formData.type === "RESCHEDULE" ? "Appointment Rescheduled" : "Appointment Update"}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                  {displayMsg}
                </p>
                {formData.type === "RESCHEDULE" && formData.newDate && (
                  <div className="bg-slate-50 p-2 rounded text-xs space-y-1 mt-2">
                    <p className="text-gray-500 line-through">Previous: {formData.date}</p>
                    <p className="text-primary font-medium">New: {formData.newDate}</p>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span>{hospital?.name}</span>
                  <span>Patient Portal Preview</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted text-sm">
              Select a doctor to view recipient count and message preview.
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalData={modalData}
        onConfirm={({ effectiveType, newDate }) => executeSend(effectiveType, newDate)}
      />
    </div>
  );
};

const QueueAlertsTab = ({ state, dispatch }) => {
  const [formData, setFormData] = useState({
    type: "DELAY",
    doctorId: "",
    delayMinutes: 20,
    message: ""
  });

  const hospitalId = state.currentUser?.hospitalId;
  const hospitalDoctors = state.doctors.filter((d) => d.hospitalId === hospitalId);

  const affectedEntries = useMemo(() => {
    if (!formData.doctorId) return [];
    
    return state.queueEntries.filter((q) => {
      if (q.hospitalId !== hospitalId) return false;
      if (q.doctorId !== formData.doctorId) return false;
      if (["COMPLETED", "CANCELLED", "SKIPPED", "PENDING_VERIFICATION", "PENDING", "REJECTED"].includes(q.status)) return false;
      
      return true;
    });
  }, [state.queueEntries, formData, hospitalId]);

  const doctor = hospitalDoctors.find((d) => d.id === formData.doctorId);
  const hospital = state.hospitals.find((h) => h.id === hospitalId);

  let defaultMsg = "";
  if (doctor) {
    if (formData.type === "DELAY") defaultMsg = `Dr. ${doctor.name}'s queue is currently running approximately ${formData.delayMinutes} minutes behind schedule. Your queue position has not changed.`;
    if (formData.type === "PAUSE") defaultMsg = `The queue for Dr. ${doctor.name} is temporarily paused. Your position has been preserved. We will notify you when the queue resumes.`;
    if (formData.type === "RESUME") defaultMsg = `Dr. ${doctor.name}'s queue has resumed. Please continue monitoring your live queue status.`;
    if (formData.type === "GENERAL") defaultMsg = `General Update regarding Dr. ${doctor.name}'s queue.`;
  }
  const displayMsg = formData.message || defaultMsg;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      alert("Please select a doctor.");
      return;
    }
    if (affectedEntries.length === 0) {
      alert("No active patients found in the queue for this doctor.");
      return;
    }

    setModalData({
      type: formData.type,
      recipientCount: affectedEntries.length,
      doctor: doctor,
    });
    setModalOpen(true);
  };

  const executeSend = (effectiveType) => {
    const finalType = effectiveType || formData.type;
    
    const broadcast = {
      id: `B-${Date.now()}`,
      hospitalId,
      type: `QUEUE_${finalType}`,
      audienceType: "QUEUE",
      doctorId: formData.doctorId,
      departmentId: doctor?.departmentId,
      message: displayMsg,
      recipientCount: affectedEntries.length,
      sentByUserId: state.currentUser?.id,
      sentByName: state.currentUser?.name,
      createdAt: new Date().toISOString()
    };

    const targetedNotifications = affectedEntries.map((q) => ({
      id: `N-${Date.now()}-${q.id}`,
      userId: q.patientId,
      hospitalId,
      doctorId: q.doctorId,
      broadcastId: broadcast.id,
      type: broadcast.type,
      title: finalType === "PAUSE" ? "Queue Paused" : finalType === "RESUME" ? "Queue Resumed" : "Queue Update",
      message: displayMsg,
      read: false,
      popupSeen: false,
      createdAt: new Date().toISOString(),
      targetType: "QUEUE",
      targetId: q.id
    }));
    
    if (finalType === "PAUSE") {
       dispatch({ type: ACTIONS.PAUSE_QUEUE, payload: { doctorId: formData.doctorId }});
    } else if (finalType === "RESUME") {
       dispatch({ type: ACTIONS.RESUME_QUEUE, payload: { doctorId: formData.doctorId }});
    }

    dispatch({ type: ACTIONS.CREATE_BROADCAST, payload: { broadcast, targetedNotifications } });
    
    setModalOpen(false);
    setFormData({
      type: "DELAY",
      doctorId: "",
      delayMinutes: 20,
      message: ""
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Queue Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Alert Type</label>
              <Select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="DELAY">Queue Running Late</option>
                <option value="PAUSE">Queue Temporarily Paused</option>
                <option value="RESUME">Queue Resumed</option>
                <option value="GENERAL">General Queue Update</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Doctor</label>
              <Select required value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})}>
                <option value="">Choose a doctor's queue...</option>
                {hospitalDoctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>

            {formData.type === "DELAY" && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Approximate Delay (minutes)</label>
                <Input type="number" required value={formData.delayMinutes} onChange={(e) => setFormData({...formData, delayMinutes: parseInt(e.target.value) || 0})} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy mb-1">Message</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm h-24 resize-none"
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})} 
                placeholder={defaultMsg}
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full">
                Send Alert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.doctorId ? (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="font-semibold text-purple-700 mb-2">Recipients</p>
                <p className="text-sm text-navy">
                  <span className="font-bold text-lg">{affectedEntries.length}</span> Patients are currently active in Dr. {doctor?.name}'s queue.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <h4 className="font-bold text-navy mb-2">{formData.type === "PAUSE" ? "Queue Paused" : formData.type === "RESUME" ? "Queue Resumed" : "Queue Update"}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                  {displayMsg}
                </p>
                <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span>{hospital?.name}</span>
                  <span>Patient Portal Preview</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted text-sm">
              Select a doctor to view recipient count and message preview.
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmationModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalData={modalData}
        onConfirm={({ effectiveType }) => executeSend(effectiveType)}
      />
    </div>
  );
};

const PreviousBroadcastsTab = ({ state }) => {
  const [filter, setFilter] = useState("ALL");
  const hospitalId = state.currentUser?.hospitalId;
  const myBroadcasts = (state.broadcasts || [])
    .filter((b) => b.hospitalId === hospitalId)
    .filter((b) => filter === "ALL" || b.audienceType === filter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Previous Communications</CardTitle>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
          <option value="ALL">All Communications</option>
          <option value="APPOINTMENT">Appointment Alerts</option>
          <option value="QUEUE">Queue Alerts</option>
          <option value="DIRECT">Direct Alerts</option>
        </Select>
      </CardHeader>
      <CardContent>
        {myBroadcasts.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">No previous communications found.</div>
        ) : (
          <div className="space-y-4">
            {myBroadcasts.map((b) => {
              const doctor = state.doctors.find(d => d.id === b.doctorId);
              const patient = b.audienceType === "DIRECT" && b.patientId ? state.patients.find(p => p.id === b.patientId) : null;
              return (
                <div key={b.id} className="border border-gray-100 rounded-lg p-4 bg-slate-50 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy">
                        {b.type.replace("DIRECT_", "").replace("APPOINTMENT_", "").replace("QUEUE_", "").replace("_", " ")} 
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {b.audienceType}
                      </span>
                    </div>
                    
                    {patient && (
                      <p className="text-sm text-gray-700"><strong>Patient:</strong> {patient.name} (ID: {patient.id})</p>
                    )}
                    
                    {doctor && (
                      <p className="text-sm text-gray-700"><strong>Doctor:</strong> {doctor.name}</p>
                    )}
                    
                    {b.audienceType === "APPOINTMENT" && b.affectedDate && (
                      <p className="text-sm text-gray-700">
                        <strong>Affected Date:</strong> {b.affectedDate} 
                        {b.affectedFrom && ` (${b.affectedFrom} - ${b.affectedTo})`}
                      </p>
                    )}
                    
                    {(b.oldDate || b.newDate || b.oldTime || b.newTime) && (
                      <div className="text-sm text-gray-700 flex gap-4 my-1 bg-white p-2 border rounded">
                        {(b.oldDate || b.oldTime) && <span className="line-through text-gray-400">Old: {b.oldDate} {b.oldTime}</span>}
                        {(b.newDate || b.newTime) && <span className="text-primary font-medium">New: {b.newDate} {b.newTime}</span>}
                      </div>
                    )}

                    <div className="bg-white p-3 rounded text-sm text-gray-600 mt-2 border">
                      "{b.message}"
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 md:text-right min-w-[150px] flex flex-col justify-between">
                    <div>
                      {b.audienceType !== "DIRECT" && (
                        <p className="font-semibold text-primary">{b.recipientCount} Recipients</p>
                      )}
                      <p className="text-xs mt-1">{new Date(b.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-xs mt-4">Sent by: {b.sentByName || b.sentByUserId}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ReceptionNotifications = () => {
  const { state, dispatch } = useQueue();
  const [activeTab, setActiveTab] = useState("APPOINTMENTS");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-navy">Communication Center</h1>
      
      <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "APPOINTMENTS" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-navy"
          }`}
          onClick={() => setActiveTab("APPOINTMENTS")}
        >
          Appointment Alerts
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "QUEUE" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-navy"
          }`}
          onClick={() => setActiveTab("QUEUE")}
        >
          Queue Alerts
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "BROADCASTS" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-navy"
          }`}
          onClick={() => setActiveTab("BROADCASTS")}
        >
          Previous Broadcasts
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "DIRECT" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-navy"
          }`}
          onClick={() => setActiveTab("DIRECT")}
        >
          Direct Patient Alerts
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "APPOINTMENTS" && <AppointmentAlertsTab state={state} dispatch={dispatch} />}
        {activeTab === "QUEUE" && <QueueAlertsTab state={state} dispatch={dispatch} />}
        {activeTab === "DIRECT" && <DirectAlertsTab state={state} dispatch={dispatch} />}
        {activeTab === "BROADCASTS" && <PreviousBroadcastsTab state={state} />}
      </div>
    </div>
  );
};
