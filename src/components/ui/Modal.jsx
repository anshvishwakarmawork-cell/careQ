import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Modal = ({ isOpen, onClose, title, className, children, ...props }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
      <div className={cn("bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200", className)} {...props}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-navy">{title}</h3>}
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
