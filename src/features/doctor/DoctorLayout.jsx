import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { LayoutDashboard, Users, Clock, User, LogOut } from "lucide-react";
import { Sidebar, SidebarItem } from "../../components/ui/Sidebar";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";

export const DoctorLayout = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate("/login");
  };

  const navItems = [
    { to: "/doctor/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/doctor/queue", icon: <Users size={24} />, label: "Live Queue" },
    { to: "/doctor/patients", icon: <Clock size={24} />, label: "Patients" },
    { to: "/doctor/profile", icon: <User size={24} />, label: "Profile" }
  ];

  return (
    <div className="flex h-screen bg-section overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar title="CareQueue" subtitle="Doctor Portal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-white" : "text-navy hover:bg-white"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-status-danger hover:bg-white w-full transition-colors"
            >
              <LogOut size={24} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden">
        <BottomTabBar>
          {navItems.map((item) => (
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
