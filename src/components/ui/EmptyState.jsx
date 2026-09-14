
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const EmptyState = ({ className, children, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children || 'EmptyState'}
    </div>
  );
};
