import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { ConfirmationModal } from "./ConfirmationModal";
import { ACTIONS } from "../../store/actions";

export const DirectAlertsTab = ({ state, dispatch }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    relatedContext: "NONE", // "NONE", "APT-id", "Q-id"
    type: "GENERAL",
    message: "",
    newDate: "",
    newTime: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const hospitalId = state.currentUser?.hospitalId;
  const hospital = state.hospitals.find((h) => h.id === hospitalId);

  // 1. Get eligible patients
  const eligiblePatients = useMemo(() => {
    if (!hospitalId) return [];
    const patientIds = new Set();
    
    state.appointments.forEach(a => {
      if (a.hospitalId === hospitalId) patientIds.add(a.patientId);
    });
    
    state.queueEntries.forEach(q => {
      if (q.hospitalId === hospitalId) patientIds.add(q.patientId);
    });

    return state.patients
      .filter(p => patientIds.has(p.id))
      .map(p => ({
        ...p,
        appointments: state.appointments.filter(a => a.patientId === p.id && a.hospitalId === hospitalId && !["CANCELLED", "COMPLETED"].includes(a.status)),
        queues: state.queueEntries.filter(q => q.patientId === p.id && q.hospitalId === hospitalId && !["CANCELLED", "COMPLETED", "SKIPPED"].includes(q.status))
      }));
  }, [state.appointments, state.queueEntries, state.patients, hospitalId]);

  const selectedPatient = eligiblePatients.find(p => p.id === formData.patientId);
  const isAppointmentContext = formData.relatedContext.startsWith("APT-");
  const isQueueContext = formData.relatedContext.startsWith("Q-");

  const selectedAppointment = isAppointmentContext 
    ? state.appointments.find(a => a.id === formData.relatedContext.split("-")[1])
    : null;
    
  const selectedQueue = isQueueContext
    ? state.queueEntries.find(q => q.id === formData.relatedContext.split("-")[1])
    : null;

  const doctor = selectedAppointment 
    ? state.doctors.find(d => d.id === selectedAppointment.doctorId)
    : selectedQueue 
      ? state.doctors.find(d => d.id === selectedQueue.doctorId)
      : null;

  let defaultMsg = "";
  if (selectedPatient) {
    if (formData.type === "RESCHEDULE" && selectedAppointment) {
      defaultMsg = `Your appointment with Dr. ${doctor?.name} at ${hospital?.name} has been rescheduled to ${formData.newDate} ${formData.newTime}.`;
    } else if (formData.type === "CANCEL" && selectedAppointment) {
      defaultMsg = `Your appointment with Dr. ${doctor?.name} on ${selectedAppointment.date} has been cancelled by ${hospital?.name}. Please contact Reception if you need assistance.`;
    } else if (formData.type === "TIME_CHANGE" && selectedAppointment) {
      defaultMsg = `The time for your appointment with Dr. ${doctor?.name} has been updated to ${formData.newTime}.`;
    } else if (formData.type === "VISIT_RECEPTION") {
      defaultMsg = `${hospital?.name} Reception would like to speak with you. Please visit the Reception desk when convenient.`;
    } else if (formData.type === "GUARDIAN") {
      defaultMsg = `Please ask your registered guardian or attendant to visit the Reception desk at ${hospital?.name}.`;
    } else if (formData.type === "INFO_REQUIRED") {
      defaultMsg = `Please visit Reception with the requested identification or appointment information.`;
    } else if (formData.type === "GENERAL") {
      defaultMsg = `${hospital?.name} Reception has an update regarding your visit. Please visit Reception for assistance.`;
    }
  }
  
  const displayMsg = formData.message || defaultMsg;

  const executeSend = (effectiveType, overrideNewDate) => {
    const finalType = effectiveType || formData.type;
    const finalNewDate = overrideNewDate || formData.newDate;

    let finalMsg = formData.message;
    if (!finalMsg) {
       // Recompute in case effectiveType changed
       if (finalType === "RESCHEDULE" && selectedAppointment) {
         finalMsg = `Your appointment with Dr. ${doctor?.name} at ${hospital?.name} has been rescheduled to ${finalNewDate} ${formData.newTime}.`;
       } else if (finalType === "CANCEL" && selectedAppointment) {
         finalMsg = `Your appointment with Dr. ${doctor?.name} on ${selectedAppointment.date} has been cancelled by ${hospital?.name}. Please contact Reception if you need assistance.`;
       } else {
         finalMsg = displayMsg; // fallback
       }
    }

    const broadcast = {
      id: `B-${Date.now()}`,
      hospitalId,
      type: `DIRECT_${finalType}`,
      audienceType: "DIRECT",
      doctorId: doctor?.id || null,
      departmentId: doctor?.departmentId || null,
      message: finalMsg,
      recipientCount: 1,
      sentByUserId: state.currentUser?.id,
      sentByName: state.currentUser?.name,
      createdAt: new Date().toISOString(),
      patientId: selectedPatient.id,
      appointmentId: selectedAppointment?.id || null,
      queueEntryId: selectedQueue?.id || null,
      oldDate: (finalType === "RESCHEDULE" && selectedAppointment) ? selectedAppointment.date : null,
      newDate: finalType === "RESCHEDULE" ? finalNewDate : null,
      oldTime: (finalType === "TIME_CHANGE" && selectedAppointment) ? selectedAppointment.time : null,
      newTime: (finalType === "TIME_CHANGE" || finalType === "RESCHEDULE") ? formData.newTime : null,
    };

    const targetedNotifications = [{
      id: `N-${Date.now()}-${selectedPatient.id}`,
      userId: selectedPatient.id,
      hospitalId,
      doctorId: doctor?.id || null,
      broadcastId: broadcast.id,
      type: broadcast.type,
      title: finalType === "CANCEL" ? "Appointment Cancelled" : 
             finalType === "RESCHEDULE" ? "Appointment Rescheduled" : 
             finalType === "TIME_CHANGE" ? "Appointment Time Changed" :
             finalType === "GUARDIAN" ? "Guardian / Attendant Requested" :
             finalType === "VISIT_RECEPTION" ? "Reception Request" :
             finalType === "INFO_REQUIRED" ? "Document / Information Required" : "Direct Update",
      message: finalMsg,
      read: false,
      popupSeen: false,
      createdAt: new Date().toISOString(),
      targetType: "DIRECT",
      targetId: selectedPatient.id,
      appointmentId: selectedAppointment?.id || null,
      queueEntryId: selectedQueue?.id || null,
      oldDate: (finalType === "RESCHEDULE" && selectedAppointment) ? selectedAppointment.date : null,
      newDate: finalType === "RESCHEDULE" ? finalNewDate : null,
      oldTime: (finalType === "TIME_CHANGE" && selectedAppointment) ? selectedAppointment.time : null,
      newTime: (finalType === "TIME_CHANGE" || finalType === "RESCHEDULE") ? formData.newTime : null,
    }];

    // Update source of truth
    if (finalType === "RESCHEDULE" && selectedAppointment) {
      dispatch({ 
        type: ACTIONS.BULK_RESCHEDULE_APPOINTMENTS, 
        payload: { appointmentIds: [selectedAppointment.id], newDate: finalNewDate, newTime: formData.newTime } 
      });
    } else if (finalType === "CANCEL" && selectedAppointment) {
      dispatch({
        type: ACTIONS.BULK_RESCHEDULE_APPOINTMENTS,
        payload: { appointmentIds: [selectedAppointment.id], status: "CANCELLED" }
      });
    } else if (finalType === "TIME_CHANGE" && selectedAppointment) {
      dispatch({
        type: ACTIONS.BULK_RESCHEDULE_APPOINTMENTS,
        payload: { appointmentIds: [selectedAppointment.id], newTime: formData.newTime }
      });
    }

    dispatch({ type: ACTIONS.CREATE_BROADCAST, payload: { broadcast, targetedNotifications } });
    
    setModalOpen(false);
    setFormData({
      patientId: "",
      relatedContext: "NONE",
      type: "GENERAL",
      message: "",
      newDate: "",
      newTime: "",
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert("Please search for and select a patient first.");
      return;
    }
    if (["RESCHEDULE", "CANCEL", "TIME_CHANGE"].includes(formData.type) && !isAppointmentContext) {
      alert("You must select a specific appointment context to reschedule or cancel.");
      return;
    }
    
    setModalData({
      type: formData.type === "TIME_CHANGE" ? "RESCHEDULE" : formData.type, // Map to ConfirmationModal internal types
      recipientCount: 1,
      doctor: doctor,
      newDate: formData.newDate,
    });
    setModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct Patient Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Patient</label>
              <Select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value, relatedContext: "NONE", type: "GENERAL"})}>
                <option value="">Search Patient / Patient ID...</option>
                {eligiblePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.id})
                  </option>
                ))}
              </Select>
            </div>

            {selectedPatient && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Related Context</label>
                <Select value={formData.relatedContext} onChange={(e) => setFormData({...formData, relatedContext: e.target.value})}>
                  <option value="NONE">None</option>
                  {selectedPatient.appointments.map(a => (
                    <option key={a.id} value={`APT-${a.id}`}>
                      Appointment: {a.date} {a.time} - Dr. {state.doctors.find(d=>d.id===a.doctorId)?.name}
                    </option>
                  ))}
                  {selectedPatient.queues.map(q => (
                    <option key={q.id} value={`Q-${q.id}`}>
                      Queue: Token {q.tokenNumber} - Dr. {state.doctors.find(d=>d.id===q.doctorId)?.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            
            {selectedPatient && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Alert Type</label>
                <Select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  {isAppointmentContext && (
                    <>
                      <option value="RESCHEDULE">Appointment Rescheduled</option>
                      <option value="CANCEL">Appointment Cancelled</option>
                      <option value="TIME_CHANGE">Appointment Time Changed</option>
                    </>
                  )}
                  <option value="VISIT_RECEPTION">Please Visit Reception</option>
                  <option value="GUARDIAN">Guardian / Attendant Requested</option>
                  <option value="INFO_REQUIRED">Document / Information Required</option>
                  <option value="GENERAL">General Reception Message</option>
                </Select>
              </div>
            )}

            {(formData.type === "RESCHEDULE" || formData.type === "TIME_CHANGE") && isAppointmentContext && (
              <div className="grid grid-cols-2 gap-4">
                {formData.type === "RESCHEDULE" && (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">New Date</label>
                    <Input type="date" required value={formData.newDate} onChange={(e) => setFormData({...formData, newDate: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">New Time</label>
                  <Input type="time" required value={formData.newTime} onChange={(e) => setFormData({...formData, newTime: e.target.value})} />
                </div>
              </div>
            )}

            {selectedPatient && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Message</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm h-24 resize-none"
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  placeholder={defaultMsg}
                />
              </div>
            )}
            
            <div className="pt-2">
              <Button type="submit" className="w-full mt-4">
                {["RESCHEDULE","CANCEL","TIME_CHANGE"].includes(formData.type) ? "Confirm & Notify" : "Send Alert"}
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
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="font-semibold text-primary mb-2">Recipient</p>
                <p className="text-sm text-navy">
                  <span className="font-bold text-lg">{selectedPatient.name}</span>
                  <br />
                  <span className="text-xs text-gray-500">Patient ID: {selectedPatient.id}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">Hospital: {hospital?.name}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <h4 className="font-bold text-navy mb-2">
                  {formData.type === "CANCEL" ? "Appointment Cancelled" : 
                   formData.type === "RESCHEDULE" ? "Appointment Rescheduled" : 
                   formData.type === "TIME_CHANGE" ? "Appointment Time Changed" :
                   formData.type === "GUARDIAN" ? "Guardian / Attendant Requested" :
                   formData.type === "VISIT_RECEPTION" ? "Reception Request" :
                   formData.type === "INFO_REQUIRED" ? "Document / Information Required" : "Direct Update"}
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                  {displayMsg}
                </p>
                
                {formData.type === "RESCHEDULE" && selectedAppointment && (
                  <div className="bg-slate-50 p-2 rounded text-xs space-y-1 mt-2">
                    <p className="text-gray-500 line-through">Previous: {selectedAppointment.date} {selectedAppointment.time}</p>
                    <p className="text-primary font-medium">New: {formData.newDate || '...'} {formData.newTime || '...'}</p>
                  </div>
                )}
                
                {formData.type === "TIME_CHANGE" && selectedAppointment && (
                  <div className="bg-slate-50 p-2 rounded text-xs space-y-1 mt-2">
                    <p className="text-gray-500 line-through">Previous Time: {selectedAppointment.time}</p>
                    <p className="text-primary font-medium">New Time: {formData.newTime || '...'}</p>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span>{hospital?.name}</span>
                  <span>Patient Portal Preview</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
              Select a patient to view recipient details and message preview.
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={({ effectiveType, newDate }) => executeSend(effectiveType, newDate)} 
        modalData={modalData}
      />
    </div>
  );
};
