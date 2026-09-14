import React from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const PatientProfile = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const { currentUser } = state;

  if (!currentUser) return null;

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate('/login');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Profile</h1>
      
      <Card className="p-6 bg-white flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
        <h2 className="text-xl font-bold">{currentUser.name}</h2>
        <p className="text-muted">{currentUser.email}</p>
      </Card>

      <Button onClick={handleLogout} className="w-full bg-white border border-gray-200 text-red-600 py-3 rounded-xl font-semibold">
        Log Out
      </Button>
    </div>
  );
};
