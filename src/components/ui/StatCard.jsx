import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StatCard = ({ className, label, value, icon, tone = "default", ...props }) => {
  const tones = {
    default: "bg-blue-50 text-blue-600",
    warning: "bg-amber-50 text-amber-500",
    danger: "bg-red-50 text-red-600"
  };

  const iconWrapperClass = cn(
    "flex items-center justify-center w-12 h-12 rounded-full",
    tones[tone]
  );

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4", className)} {...props}>
      {icon && (
        <div className={iconWrapperClass}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-navy">{value}</p>
      </div>
    </div>
  );
};
