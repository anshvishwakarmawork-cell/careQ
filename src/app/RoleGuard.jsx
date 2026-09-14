import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQueue } from "../store/QueueStore";

export const RoleGuard = ({ allowedRole }) => {
  const { state } = useQueue();
  const { currentUser } = state;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to={`/${currentUser.role.toLowerCase()}/dashboard`} replace />;
  }

  if (currentUser.role === "DOCTOR" && !currentUser.verified) {
    return <Navigate to="/doctor/verification" replace />;
  }

  return <Outlet />;
};
