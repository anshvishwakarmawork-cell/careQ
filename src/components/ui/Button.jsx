
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, children, type = "button", ...props }, ref) => {
  return (
    <button ref={ref} type={type} className={cn("px-4 py-2 font-medium transition-colors focus:outline-none", className)} {...props}>
      {children || 'Button'}
    </button>
  );
});
Button.displayName = "Button";
