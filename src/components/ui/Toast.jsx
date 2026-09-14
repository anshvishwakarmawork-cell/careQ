
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Toast = ({ className, children, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children || 'Toast'}
    </div>
  );
};
