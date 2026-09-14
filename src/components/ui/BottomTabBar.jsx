import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomTabBar = ({ children }) => {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-[#E2E8F0] flex justify-around p-2 pb-safe z-50">
      {children}
    </div>
  );
};

export const TabBarItem = ({ to, icon: Icon, label, disabled }) => {
  // If icon is passed as element (e.g. <Home />), render it. If it's a component (e.g. Home), instantiate it.
  const isElement = React.isValidElement(Icon);
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex flex-col items-center p-2 rounded-lg text-xs transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${isActive && !disabled ? 'text-primary font-semibold' : 'text-muted hover:text-navy'}`
      }
    >
      {isElement ? Icon : <Icon size={24} className="mb-1" />}
      <span>{label}</span>
    </NavLink>
  );
};
