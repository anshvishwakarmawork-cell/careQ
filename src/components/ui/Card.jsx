
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("px-6 py-4 border-b border-[#E2E8F0]", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-lg font-bold text-navy", className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);
