import React from 'react';

export const Navbar = ({ title, children, className }) => {
  return (
    <nav className={`bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40 ${className || ''}`}>
      {title && <div className="font-bold text-lg text-navy">{title}</div>}
      <div className="flex items-center gap-4">
        {children}
      </div>
    </nav>
  );
};
