import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export const DoctorVerifications = () => {
  const { state, dispatch } = useQueue();
  
  const [rejectModal, setRejectModal] = useState({ isOpen: false, doctorId: null, reason: "" });
  const [changesModal, setChangesModal] = useState({ isOpen: false, doctorId: null, message: "" });
  
  const hospitalId = state.currentUser?.hospitalId;

  const pendingDoctors = state.doctors.filter(d => d.hospitalId === hospitalId && (
    d.verificationStatus === "PENDING_VERIFICATION" || 
    d.verificationStatus === "CHANGES_REQUESTED" ||
    (!d.verificationStatus && state.users.find(u => u.id === d.id && !u.verified)) // Legacy check
  )).filter(d => d.verificationStatus !== 'VERIFIED'); // Ensure they are not verified

  const handleApprove = (doctorId) => {
    dispatch({ type: ACTIONS.APPROVE_DOCTOR_REQUEST, payload: { doctorId } });
  };

  const handleReject = () => {
    dispatch({ 
      type: ACTIONS.REJECT_DOCTOR_REQUEST, 
      payload: { doctorId: rejectModal.doctorId, reason: rejectModal.reason } 
    });
    setRejectModal({ isOpen: false, doctorId: null, reason: "" });
  };

  const handleRequestChanges = () => {
    dispatch({ 
      type: ACTIONS.REQUEST_DOCTOR_CHANGES, 
      payload: { doctorId: changesModal.doctorId, message: changesModal.message } 
    });
    setChangesModal({ isOpen: false, doctorId: null, message: "" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Doctor Verifications</h1>
      
      {pendingDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No pending doctor verifications.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingDoctors.map(doctor => (
            <Card key={doctor.id}>
              <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-navy">{doctor.name}</h3>
                    <Badge variant={doctor.verificationStatus === 'CHANGES_REQUESTED' ? 'warning' : 'primary'}>
                      {doctor.verificationStatus === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Verification'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Email</span>
                      <span className="font-medium">{state.users.find(u => u.id === doctor.id)?.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Medical License Number</span>
                      <span className="font-medium">{doctor.licenseNumber || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Department</span>
                      <span className="font-medium">{doctor.department || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Specialization</span>
                      <span className="font-medium">{doctor.specialization || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Experience (Years)</span>
                      <span className="font-medium">{doctor.experienceYears || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Qualification</span>
                      <span className="font-medium">{doctor.qualification || "Not provided"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button 
                    variant="primary" 
                    onClick={() => handleApprove(doctor.id)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setChangesModal({ isOpen: true, doctorId: doctor.id, message: "" })}
                  >
                    Request Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setRejectModal({ isOpen: true, doctorId: doctor.id, reason: "" })}
                  >
                    <span className="text-red-600">Reject</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={() => setRejectModal({ ...rejectModal, isOpen: false })} title="Reject Doctor Registration">
        <div className="space-y-4">
          <p className="text-sm text-muted">Please provide a reason for rejecting this registration.</p>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Reason</label>
            <Input 
              value={rejectModal.reason} 
              onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})} 
              placeholder="e.g. License verification failed"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}>Cancel</Button>
            <Button onClick={handleReject} disabled={!rejectModal.reason.trim()}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>

      {/* Request Changes Modal */}
      <Modal isOpen={changesModal.isOpen} onClose={() => setChangesModal({ ...changesModal, isOpen: false })} title="Request Changes">
        <div className="space-y-4">
          <p className="text-sm text-muted">Describe what the doctor needs to update in their registration.</p>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Message</label>
            <Input 
              value={changesModal.message} 
              onChange={(e) => setChangesModal({...changesModal, message: e.target.value})} 
              placeholder="e.g. Please provide a clear copy of your medical license"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setChangesModal({ ...changesModal, isOpen: false })}>Cancel</Button>
            <Button onClick={handleRequestChanges} disabled={!changesModal.message.trim()}>Send Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
