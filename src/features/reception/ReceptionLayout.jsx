import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { LayoutDashboard, Users, UserRound, Calendar, Bell, LogOut, BarChart3 } from "lucide-react";
import { Sidebar } from "../../components/ui/Sidebar";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";

export const ReceptionLayout = () => {
  const { dispatch } = useQueue();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  const navItems = [
    { to: "/reception/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/reception/queues", icon: <Users size={24} />, label: "Queues" },
    { to: "/reception/doctors", icon: <UserRound size={24} />, label: "Doctors" },
    { to: "/reception/appointments", icon: <Calendar size={24} />, label: "Appointments" },
    { to: "/reception/qr", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>, label: "Patient QR" },
    { to: "/reception/analytics", icon: <BarChart3 size={24} />, label: "Analytics" },
    { to: "/reception/notifications", icon: <Bell size={24} />, label: "Notifications" }
  ];

  return (
    <div className="flex h-screen bg-section overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-[#E2E8F0] bg-white">
        <Sidebar title="CareQueue" subtitle="Coordinator Portal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-white" : "text-navy hover:bg-slate-50"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-status-danger hover:bg-slate-50 w-full transition-colors"
            >
              <LogOut size={24} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden">
        <BottomTabBar>
          {navItems.slice(0, 4).map((item) => (
            <TabBarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </BottomTabBar>
      </div>
    </div>
  );
};
