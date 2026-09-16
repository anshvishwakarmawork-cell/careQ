import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { BottomTabBar, TabBarItem } from "../../components/ui/BottomTabBar";
import { Home, Search, Ticket, Calendar, Bell, User, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useQueue } from "../../store/QueueStore";
import { getActiveEntryForPatient } from "../../store/selectors";

export const PatientLayout = () => {
  const { state } = useQueue();
  const { currentUser, requests } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const [activeSheet, setActiveSheet] = useState(null);
  const [expandedSidebar, setExpandedSidebar] = useState(null);

  useEffect(() => {
    // Close mobile sheet on route change
    setActiveSheet(null);
  }, [location.pathname]);

  if (!currentUser) return null;

  const activeEntry = getActiveEntryForPatient(state, currentUser.patientId);
  const tokenLink = activeEntry ? `/patient/token/${activeEntry.id}` : '/patient/dashboard';
  const pendingRequests = state.queueEntries.filter(e => e.patientId === currentUser.patientId && e.verificationStatus === 'PENDING_VERIFICATION');

  const navCategories = [
    { label: 'Home', icon: Home, to: '/patient/dashboard' },
    { label: 'Search', icon: Search, subItems: [
      { label: 'Doctors', to: '/patient/search' },
      { label: 'Hospitals', to: '/patient/search?tab=hospitals' },
      { label: 'Departments', to: '/patient/search?tab=departments' }
    ]},
    { label: 'Token', icon: Ticket, subItems: [
      { label: 'Active Token', to: tokenLink, badge: activeEntry ? 1 : null, disabled: !activeEntry },
      ...(pendingRequests.length > 0 ? [{ label: 'Pending Verification', to: `/patient/queue-request/${pendingRequests[0].id}`, badge: pendingRequests.length }] : []),
      { label: 'QR Check-in', to: '/checkin' },
      { label: 'Queue History', to: '/patient/visits?tab=queue-history' }
    ]},
    { label: 'Visits', icon: Calendar, subItems: [
      { label: 'Upcoming Appointments', to: '/patient/visits' },
      { label: 'Past Visits', to: '/patient/visits?tab=past' },
      { label: 'Cancelled Appointments', to: '/patient/visits?tab=cancelled' },
      { label: 'Book Appointment', to: '/patient/search' }
    ]}
  ];

  const handleMobileNavClick = (category) => {
    if (category.subItems) {
      setActiveSheet(category.label);
    } else {
      navigate(category.to);
    }
  };

  const handleSidebarClick = (category) => {
    if (category.subItems) {
      setExpandedSidebar(expandedSidebar === category.label ? null : category.label);
    } else {
      navigate(category.to);
    }
  };

  // Close sheet when clicking outside
  const handleSheetBgClick = (e) => {
    if (e.target.id === 'sheet-bg') {
      setActiveSheet(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-section">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm z-20 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">CareQueue</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navCategories.map(cat => {
            const isActiveParent = location.pathname === cat.to || cat.subItems?.some(s => location.pathname === s.to || location.pathname.startsWith(s.to.split('?')[0]));
            const isExpanded = expandedSidebar === cat.label || (isActiveParent && expandedSidebar !== cat.label && expandedSidebar === null);
            
            return (
              <div key={cat.label}>
                <button 
                  onClick={() => handleSidebarClick(cat)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${isActiveParent ? 'bg-blue-50 text-primary' : 'text-navy hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={20} className={isActiveParent ? 'text-primary' : 'text-muted'} />
                    <span>{cat.label}</span>
                  </div>
                  {cat.subItems && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>
                {cat.subItems && isExpanded && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                    {cat.subItems.map(sub => (
                      <NavLink
                        key={sub.label}
                        to={sub.to}
                        onClick={(e) => sub.disabled && e.preventDefault()}
                        className={({ isActive }) => `flex items-center justify-between py-2 text-sm transition-colors ${sub.disabled ? 'opacity-50' : 'hover:text-primary'} ${isActive ? 'text-primary font-semibold' : 'text-muted'}`}
                      >
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">{sub.badge}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-gray-100">
            <NavLink to="/patient/notifications" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-50 text-primary' : 'text-navy hover:bg-gray-50'}`}>
              <Bell size={20} className={location.pathname === '/patient/notifications' ? 'text-primary' : 'text-muted'} />
              <span>Notifications</span>
            </NavLink>
            <NavLink to="/patient/profile" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-50 text-primary' : 'text-navy hover:bg-gray-50'}`}>
              <User size={20} className={location.pathname === '/patient/profile' ? 'text-primary' : 'text-muted'} />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full pb-20 md:pb-0 overflow-y-auto min-h-screen relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <div className="fixed bottom-0 w-full bg-white border-t border-[#E2E8F0] flex justify-around p-2 pb-safe z-40">
          {navCategories.map(item => (
            <button
              key={item.label}
              onClick={() => handleMobileNavClick(item)}
              className={`flex flex-col items-center p-2 rounded-lg text-xs transition-colors ${
                location.pathname === item.to || (item.subItems && item.subItems.some(s => location.pathname === s.to.split('?')[0])) 
                  ? 'text-primary font-semibold' 
                  : 'text-muted hover:text-navy'
              }`}
            >
              <item.icon size={24} className="mb-1" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {activeSheet && (
        <div id="sheet-bg" onClick={handleSheetBgClick} className="fixed inset-0 bg-black/40 z-50 md:hidden flex flex-col justify-end transition-opacity duration-300">
          <div className="bg-white rounded-t-3xl p-6 w-full transform transition-transform duration-300 translate-y-0" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">{activeSheet}</h3>
              <button onClick={() => setActiveSheet(null)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {navCategories.find(c => c.label === activeSheet)?.subItems.map(sub => (
                <button
                  key={sub.label}
                  disabled={sub.disabled}
                  onClick={() => {
                    if(!sub.disabled) {
                      navigate(sub.to);
                      setActiveSheet(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left border ${sub.disabled ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-50' : 'bg-white border-gray-200 text-navy hover:border-primary active:bg-blue-50'}`}
                >
                  <span className="font-medium text-lg">{sub.label}</span>
                  {sub.badge && (
                    <span className="bg-primary text-white text-sm px-3 py-1 rounded-full font-bold">{sub.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

