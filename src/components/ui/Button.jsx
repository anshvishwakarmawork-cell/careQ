import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, children, type = "button", variant = "primary", icon, ...props }, ref) => {
  const baseStyles = "px-4 py-2 font-medium transition-colors focus:outline-none rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:hover:bg-transparent",
  };

  return (
    <button ref={ref} type={type} className={cn(baseStyles, variants[variant], className)} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
});
Button.displayName = "Button";
