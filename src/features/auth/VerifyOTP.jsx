import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OTPInput } from "../../components/ui/OTPInput";
import { Button } from "../../components/ui/Button";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";

export const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useQueue();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const pendingUser = location.state?.user;
  const role = location.state?.role;

  useEffect(() => {
    if (!pendingUser) {
      navigate("/register");
    }
  }, [pendingUser, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (role === "PATIENT") {
        const newPatient = {
          id: `P${Date.now()}`,
          name: pendingUser.name,
          mobile: pendingUser.mobile,
          gender: pendingUser.gender,
          dob: pendingUser.dob,
          city: pendingUser.city
        };

        const newUser = {
          id: `U${Date.now()}`,
          name: newPatient.name,
          email: pendingUser.email,
          password: pendingUser.password,
          role: "PATIENT",
          patientId: newPatient.id
        };

        dispatch({ type: ACTIONS.REGISTER_PATIENT, payload: { user: newUser, patient: newPatient } });
        dispatch({ type: ACTIONS.LOGIN, payload: newUser });
        navigate("/patient");
      }
    }
  };

  if (!pendingUser) return null;

  return (
    <div className="min-h-screen bg-section py-12 px-4 flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-navy mb-2">Verify Mobile Number</h1>
        <p className="text-muted mb-8">
          We've sent a 6-digit code to <strong>{pendingUser.mobile}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput length={6} value={otp} onChange={setOtp} />
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            disabled={otp.length !== 6}
          >
            Verify & Create Account
          </Button>
        </form>

        <div className="mt-6 text-sm">
          {timeLeft > 0 ? (
            <p className="text-muted">Resend code in <span className="font-medium text-primary">00:{timeLeft.toString().padStart(2, '0')}</span></p>
          ) : (
            <button className="text-primary font-medium hover:underline" onClick={() => setTimeLeft(60)}>
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
