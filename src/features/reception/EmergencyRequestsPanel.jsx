import React, { useState } from 'react';
import { useQueue } from '../../store/QueueStore';
import { ACTIONS } from '../../store/actions';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Clock, Phone, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const EmergencyRequestsPanel = () => {
  const { state, dispatch } = useQueue();
  
  // Show all requests that are not fully completed/rejected
  const activeRequests = state.emergencyRequests.filter(r => 
    !['COMPLETED', 'REJECTED_OR_REDIRECTED'].includes(r.status)
  ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  if (activeRequests.length === 0) return null;

  const handleUpdateStatus = (requestId, status, departmentId) => {
    dispatch({
      type: ACTIONS.UPDATE_EMERGENCY_STATUS,
      payload: { requestId, status }
    });

    if (status === 'ACCEPTED') {
      dispatch({
        type: ACTIONS.ACTIVATE_EMERGENCY_PREP,
        payload: { departmentId }
      });
    }

    if (status === 'COMPLETED' || status === 'REJECTED_OR_REDIRECTED') {
      dispatch({
        type: ACTIONS.RESUME_NORMAL_QUEUE,
        payload: { departmentId }
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AWAITING_REVIEW': return <Badge variant="warning" className="bg-yellow-100 text-yellow-800 animate-pulse">Awaiting Review</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="warning" className="bg-orange-100 text-orange-800">Under Review</Badge>;
      case 'ACCEPTED': return <Badge variant="danger" className="bg-red-100 text-red-800 animate-pulse">Prep Active</Badge>;
      case 'PATIENT_EN_ROUTE': return <Badge variant="info">En Route</Badge>;
      case 'ARRIVED': return <Badge variant="success">Arrived</Badge>;
      case 'HANDED_TO_DOCTOR': return <Badge variant="success">Handed to Doc</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
        <AlertTriangle />
        Active Emergency Requests
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {activeRequests.map(req => {
          const doc = state.doctors.find(d => d.id === req.doctorId);
          
          return (
            <Card key={req.id} className="border-red-200 bg-red-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-navy">{req.patientName}</h3>
                    <p className="text-sm font-semibold text-red-700">{req.emergencyType}</p>
                    <p className="text-xs text-gray-600 mt-1">{req.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(req.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-red-100 text-sm grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-xs block">Contact</span>
                    <span className="font-medium flex items-center gap-1"><Phone size={12}/> {req.mobile}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Target Doctor/Dept</span>
                    <span className="font-medium">{doc?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Conscious?</span>
                    <span className="font-medium">{req.conscious}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Breathing?</span>
                    <span className="font-medium">{req.breathing}</span>
                  </div>
                </div>

                {/* Action Buttons based on status */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-red-100">
                  {req.status === 'AWAITING_REVIEW' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(req.id, 'UNDER_REVIEW', req.departmentId)}>Start Review</Button>
                  )}
                  {req.status === 'UNDER_REVIEW' && (
                    <>
                      <Button size="sm" variant="outline" className="text-red-700 border-red-200" onClick={() => handleUpdateStatus(req.id, 'REJECTED_OR_REDIRECTED', req.departmentId)}>Reject / Redirect</Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleUpdateStatus(req.id, 'ACCEPTED', req.departmentId)}>Accept & Prep Dept</Button>
                    </>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleUpdateStatus(req.id, 'PATIENT_EN_ROUTE', req.departmentId)}>Mark En-Route</Button>
                  )}
                  {req.status === 'PATIENT_EN_ROUTE' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(req.id, 'ARRIVED', req.departmentId)}>Patient Arrived</Button>
                  )}
                  {req.status === 'ARRIVED' && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleUpdateStatus(req.id, 'HANDED_TO_DOCTOR', req.departmentId)}>Hand to Doctor</Button>
                  )}
                  {req.status === 'HANDED_TO_DOCTOR' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(req.id, 'COMPLETED', req.departmentId)}>Complete Workflow</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
