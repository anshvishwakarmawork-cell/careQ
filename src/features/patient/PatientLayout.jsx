import React from "react";
import { Outlet } from "react-router-dom";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";
import { Home, Search, Ticket, Calendar, User } from 'lucide-react';
import { useQueue } from "../../store/QueueStore";
import { getActiveEntryForPatient } from "../../store/selectors";

export const PatientLayout = () => {
  const { state } = useQueue();
  const { currentUser } = state;
  const activeEntry = currentUser ? getActiveEntryForPatient(state, currentUser.patientId) : null;
  const tokenLink = activeEntry ? `/patient/token/${activeEntry.id}` : '#';

  const navItems = [
    { label: 'Home', icon: Home, to: '/patient/dashboard' },
    { label: 'Search', icon: Search, to: '/patient/search' },
    { label: 'Token', icon: Ticket, to: tokenLink, disabled: !activeEntry },
    { label: 'Visits', icon: Calendar, to: '/patient/visits' },
    { label: 'Profile', icon: User, to: '/patient/profile' },
  ];

  return (
    <div className="min-h-screen bg-section pb-20">
      <Outlet />
      <BottomTabBar>
        {navItems.map(item => (
          <TabBarItem key={item.label} {...item} />
        ))}
      </BottomTabBar>
    </div>
  );
};
