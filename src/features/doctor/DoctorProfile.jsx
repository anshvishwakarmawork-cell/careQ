import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ACTIONS } from "../../store/actions";
import { useNavigate } from "react-router-dom";

export const DoctorProfile = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  
  const doctorId = state.currentUser?.doctorId;
  const doctor = state.doctors.find(d => d.id === doctorId);

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  if (!doctor) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">Doctor Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <p className="text-sm text-muted">Name</p>
              <p className="font-medium text-navy">{doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Specialization</p>
              <p className="font-medium text-navy">{doctor.specialization}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <p className="text-sm text-muted">Hospital</p>
              <p className="font-medium text-navy">City Care Hospital</p>
            </div>
            <div>
              <p className="text-sm text-muted">Room</p>
              <p className="font-medium text-navy">{doctor.room}</p>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full text-status-danger border-status-danger hover:bg-red-50" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
