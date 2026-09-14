import React from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";

export const DoctorVerification = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useQueue();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-section flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileCheck size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-navy mb-4">Verification Pending</h1>
        
        <p className="text-muted mb-6">
          Thank you for registering with CareQueue. Your account is currently under review by the hospital administration.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-left">
          <h3 className="font-semibold text-navy mb-2">What happens next?</h3>
          <ul className="space-y-2 text-muted">
            <li className="flex gap-2">
              <span className="text-primary">•</span> 
              Your medical registration and hospital association will be verified.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span> 
              You will receive an email notification once approved.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span> 
              This process typically takes 1-2 business days.
            </li>
          </ul>
        </div>
        
        <Button onClick={handleLogout} variant="outline" className="w-full">
          Back to Home
        </Button>
      </div>
    </div>
  );
};
