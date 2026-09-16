import React, { useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { getPendingRequests, getQueueForDoctor, getCurrentPatient } from "../../store/selectors";

export const TokenVerification = () => {
  const { state, dispatch } = useQueue();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // In a real app, you'd filter by the receptionist's hospital. For now we use the first hospital or no filter.
  const hospitalId = state.currentUser?.hospitalId;
  const pendingRequests = getPendingRequests(state, hospitalId);

  const handleApprove = () => {
    if (!selectedRequest) return;
    dispatch({ type: ACTIONS.VERIFY_TOKEN_REQUEST, payload: { entryId: selectedRequest.id } });
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason) return;
    dispatch({ type: ACTIONS.REJECT_TOKEN_REQUEST, payload: { entryId: selectedRequest.id, reason: rejectReason } });
    setSelectedRequest(null);
    setIsRejecting(false);
    setRejectReason("");
  };

  const openReview = (req) => {
    setSelectedRequest(req);
    setIsRejecting(false);
    setRejectReason("");
  };

  const doctor = selectedRequest ? state.doctors.find(d => d.id === selectedRequest.doctorId) : null;
  const hospital = doctor ? state.hospitals.find(h => h.id === doctor.hospitalId) : null;
  const doctorQueue = doctor ? getQueueForDoctor(state, doctor.id).filter(e => e.status === "WAITING" || e.status === "CALLED") : [];
  const currentConsult = doctor ? getCurrentPatient(state, doctor.id) : null;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy">Pending Token Requests</h1>
        <p className="text-muted">Review and verify patient requests before adding them to the live queue.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-navy text-sm">Patient</th>
                  <th className="p-4 font-semibold text-navy text-sm">Doctor</th>
                  <th className="p-4 font-semibold text-navy text-sm">Department</th>
                  <th className="p-4 font-semibold text-navy text-sm">Requested</th>
                  <th className="p-4 font-semibold text-navy text-sm">Status</th>
                  <th className="p-4 font-semibold text-navy text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted">
                      No pending requests to verify.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map(req => {
                    const doc = state.doctors.find(d => d.id === req.doctorId);
                    const reqTime = new Date(req.joinedAt);
                    return (
                      <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-navy">{req.patientName}</p>
                          <p className="text-xs text-muted">ID: {req.patientId}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{doc?.name}</p>
                        </td>
                        <td className="p-4 text-sm text-muted">{doc?.department}</td>
                        <td className="p-4 text-sm">{reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-4">
                          <Badge tone="warning">Pending Verification</Badge>
                        </td>
                        <td className="p-4">
                          <Button size="sm" onClick={() => openReview(req)}>Review</Button>
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

      {selectedRequest && doctor && (
        <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Review Token Request" size="lg">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Patient Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-navy border-b pb-2">Patient Details</h3>
                <div>
                  <p className="text-sm text-muted">Name</p>
                  <p className="font-bold">{selectedRequest.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Patient ID</p>
                  <p className="font-medium">{selectedRequest.patientId}</p>
                </div>
                {selectedRequest.reasonForVisit && (
                  <div>
                    <p className="text-sm text-muted">Reason for Visit</p>
                    <p className="font-medium">{selectedRequest.reasonForVisit}</p>
                  </div>
                )}
              </div>

              {/* Queue Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-navy border-b pb-2">Queue Details</h3>
                <div>
                  <p className="text-sm text-muted">Doctor</p>
                  <p className="font-bold">{doctor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Department</p>
                  <p className="font-medium">{doctor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Hospital</p>
                  <p className="font-medium">{hospital?.name || "City Care Hospital"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Request Time</p>
                  <p className="font-medium">{new Date(selectedRequest.joinedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Current Doctor Queue Context */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-navy mb-3">Current Doctor Queue Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted mb-1">Doctor Status</p>
                  <Badge tone={doctor.status === 'AVAILABLE' ? 'success' : 'warning'}>{doctor.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Current Token</p>
                  <p className="font-bold text-lg text-primary">{currentConsult ? currentConsult.tokenNumber : "--"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Waiting Patients</p>
                  <p className="font-bold text-lg">{doctorQueue.length}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isRejecting ? (
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsRejecting(true)}>
                  Reject Request
                </Button>
                <Button onClick={handleApprove}>Approve Token</Button>
              </div>
            ) : (
              <div className="pt-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Reason for Rejection *</label>
                  <Select value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                    <option value="">Select a reason...</option>
                    <option value="Incorrect doctor selected">Incorrect doctor selected</option>
                    <option value="Duplicate request">Duplicate request</option>
                    <option value="Doctor unavailable">Doctor unavailable</option>
                    <option value="Wrong department">Wrong department</option>
                    <option value="Appointment no longer valid">Appointment no longer valid</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                {rejectReason === "Other" && (
                  <Input 
                    placeholder="Enter specific reason..." 
                    onChange={e => setRejectReason(e.target.value)} 
                    autoFocus
                  />
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                  <Button variant="outline" className="bg-red-600 text-white hover:bg-red-700 border-transparent" onClick={handleReject} disabled={!rejectReason}>
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
