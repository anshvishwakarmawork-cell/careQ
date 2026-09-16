import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { getEstimatedWait, getPatientsAhead } from "../../store/selectors";

export const QueueRequestStatus = () => {
  const { requestId } = useParams();
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  const entry = state.queueEntries.find(e => e.id === requestId);
  const doctor = entry ? state.doctors.find(d => d.id === entry.doctorId) : null;
  const hospital = doctor ? state.hospitals.find(h => h.id === doctor.hospitalId) : null;

  if (!entry) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
        <h2 className="text-2xl font-bold text-navy">Request Not Found</h2>
        <p className="text-gray-700">The request you are looking for does not exist.</p>
        <Button onClick={() => navigate('/patient/dashboard')}>Return Home</Button>
      </div>
    );
  }

  const handleCancel = () => {
    dispatch({ type: ACTIONS.CANCEL_TOKEN_REQUEST, payload: { entryId: entry.id } });
  };

  const getStatusBadge = () => {
    switch (entry.verificationStatus) {
      case "PENDING_VERIFICATION":
        return <Badge tone="warning">PENDING VERIFICATION</Badge>;
      case "VERIFIED":
        return <Badge tone="success">VERIFIED</Badge>;
      case "REJECTED":
        return <Badge tone="danger">REJECTED</Badge>;
      case "CANCELLED":
        return <Badge tone="neutral">CANCELLED</Badge>;
      default:
        return <Badge tone="neutral">{entry.verificationStatus}</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20 animate-in fade-in">
      <h1 className="text-2xl font-bold text-navy">Token Request Status</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Request Details</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Doctor</p>
              <p className="font-bold text-navy">{doctor?.name}</p>
              <p className="text-xs text-muted">{doctor?.specialization}</p>
            </div>
            <div>
              <p className="text-muted">Hospital</p>
              <p className="font-bold text-navy">{hospital?.name || "City Care Hospital"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-navy mb-4">Request Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">Request Submitted</p>
                  <p className="text-xs text-muted">Waiting for hospital verification</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.verificationStatus === 'VERIFIED' ? 'bg-primary/20 text-primary' : (entry.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400')}`}>
                  {entry.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={16} /> : (entry.verificationStatus === 'REJECTED' ? <XCircle size={16} /> : <Clock size={16} />)}
                </div>
                <div>
                  <p className={`font-bold text-sm ${entry.verificationStatus === 'PENDING_VERIFICATION' ? 'text-gray-500' : (entry.verificationStatus === 'REJECTED' ? 'text-red-700' : 'text-navy')}`}>
                    {entry.verificationStatus === 'REJECTED' ? 'Verification Rejected' : 'Hospital Verification'}
                  </p>
                  {entry.verificationStatus === 'PENDING_VERIFICATION' && (
                    <p className="text-xs text-muted">Your request has been sent to hospital reception for verification.</p>
                  )}
                  {entry.verificationStatus === 'REJECTED' && (
                    <p className="text-xs text-red-600 mt-1">Reason: {entry.rejectReason || "No reason provided"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.verificationStatus === 'VERIFIED' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  {entry.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${entry.verificationStatus === 'VERIFIED' ? 'text-navy' : 'text-gray-500'}`}>Token Created</p>
                  {entry.verificationStatus === 'VERIFIED' && (
                    <p className="text-xs text-primary font-bold mt-1">Token {entry.tokenNumber} has been created.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {entry.verificationStatus === "PENDING_VERIFICATION" && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-4">
              <p className="text-sm font-semibold text-amber-800 text-center">
                You will be added to the live queue after the hospital verifies your request.
              </p>
            </div>
          )}

          {entry.verificationStatus === "VERIFIED" && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-navy font-semibold">Your Token:</span>
                <span className="font-bold text-lg text-primary">{entry.tokenNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Patients Ahead:</span>
                <span className="font-bold">{getPatientsAhead(state, entry.id)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Estimated Wait:</span>
                <span className="font-bold">~{Math.round(getEstimatedWait(state, entry.id))} min</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {entry.verificationStatus === "VERIFIED" && (
          <Button className="w-full py-4 text-lg" onClick={() => navigate('/patient/dashboard')}>
            View Live Queue
          </Button>
        )}

        {(entry.verificationStatus === "REJECTED" || entry.verificationStatus === "CANCELLED") && (
          <Button className="w-full" onClick={() => navigate('/patient/dashboard')}>
            Choose Another Doctor
          </Button>
        )}

        {entry.verificationStatus === "PENDING_VERIFICATION" && (
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancel}>
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );
};
