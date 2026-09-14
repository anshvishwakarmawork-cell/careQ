
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Sidebar = ({ title, subtitle, className, children, ...props }) => {
  return (
    <div className={cn("h-full flex flex-col p-4", className)} {...props}>
      {(title || subtitle) && (
        <div className="mb-8 px-4">
          {title && <h2 className="text-2xl font-bold text-navy">{title}</h2>}
          {subtitle && <p className="text-sm text-muted font-medium">{subtitle}</p>}
        </div>
      )}
      <nav className="flex-1 flex flex-col gap-2">
        {children}
      </nav>
    </div>
  );
};

export const SidebarItem = ({ children }) => {
  // Mock generic item if needed, though layouts are using NavLink directly inside Sidebar
  return <div>{children}</div>;
};
