import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";

export const DoctorVerification = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useQueue();

  const doctor = state.doctors.find((d) => d.id === state.currentUser?.id);
  const status = doctor?.verificationStatus || "PENDING_VERIFICATION";

  useEffect(() => {
    // If the doctor is verified, they should be on the dashboard, but if they hit this route
    // and are verified, redirect them to dashboard.
    if (status === "VERIFIED") {
       navigate("/doctor/dashboard");
    }
  }, [status, navigate]);

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/");
  };

  const getStatusContent = () => {
    switch (status) {
      case "PENDING_VERIFICATION":
        return {
          icon: <Clock className="h-16 w-16 text-amber-500 mb-4" />,
          title: "Verification Pending",
          message:
            "Your registration has been submitted and is awaiting approval by the hospital administration. You will be able to access your dashboard once verified.",
          color: "bg-amber-50 border-amber-200 text-amber-800",
        };
      case "CHANGES_REQUESTED":
        return {
          icon: <ShieldAlert className="h-16 w-16 text-orange-500 mb-4" />,
          title: "Changes Requested",
          message: `The administration has requested changes to your registration: "${
            doctor?.changesMessage || "Please update your details."
          }"`,
          color: "bg-orange-50 border-orange-200 text-orange-800",
          action: () => navigate("/register/doctor"), // Directs back to registration form
          actionText: "Update Details",
        };
      case "REJECTED":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500 mb-4" />,
          title: "Registration Rejected",
          message: `Your registration was not approved. Reason: "${
            doctor?.rejectReason || "Does not meet hospital criteria."
          }"`,
          color: "bg-red-50 border-red-200 text-red-800",
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-gray-500 mb-4" />,
          title: "Checking Status",
          message: "Loading your verification status...",
          color: "bg-gray-50 border-gray-200 text-gray-800",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-section flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
        {content.icon}

        <h1 className="text-2xl font-bold text-navy mb-4">{content.title}</h1>

        <div
          className={`mt-2 p-4 rounded-md border ${content.color} w-full text-sm mb-6 text-left`}
        >
          {content.message}
        </div>

        <div className="flex flex-col space-y-3 w-full">
          {content.action && (
            <Button onClick={content.action} className="w-full">
              {content.actionText}
            </Button>
          )}

          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
