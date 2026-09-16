import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { LayoutDashboard, Users, UserRound, Calendar, Bell, LogOut, BarChart3, ShieldAlert } from "lucide-react";
import { Sidebar } from "../../components/ui/Sidebar";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";

export const ReceptionLayout = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  const navItems = [
    { to: "/reception/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/reception/queues", icon: <Users size={24} />, label: "Queues" },
    { to: "/reception/verifications", icon: <ShieldAlert size={24} />, label: "Verifications" },
    { to: "/reception/doctors", icon: <UserRound size={24} />, label: "Doctors" },
    { to: "/reception/appointments", icon: <Calendar size={24} />, label: "Appointments" },
    { to: "/reception/qr", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>, label: "Patient QR" },
    { to: "/reception/notifications", icon: <Bell size={24} />, label: "Broadcast" }
  ];

  const currentHospital = state.hospitals.find(h => h.id === state.currentUser?.hospitalId);
  const hospitalName = currentHospital ? currentHospital.name : "Hospital Name";
  const userName = state.currentUser?.name || "Staff";
  const employeeId = state.currentUser?.employeeId || "Staff ID";

  return (
    <div className="flex h-screen bg-section overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-[#E2E8F0] bg-white">
        <Sidebar title="CareQueue" subtitle="">
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
          
          {/* Profile / Staff Identity Footer */}
          <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
            <div className="px-4 py-3 mb-2 bg-slate-50 rounded-lg">
              <p className="font-semibold text-navy text-sm">{userName}</p>
              <p className="text-xs text-muted font-medium mb-1">Reception Coordinator</p>
              <p className="text-xs text-navy font-medium">{hospitalName}</p>
              {state.currentUser?.employeeId && (
                <p className="text-[10px] text-muted mt-1">ID: {employeeId}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-status-danger hover:bg-slate-50 w-full transition-colors"
            >
              <LogOut size={20} />
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
