import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const CareQueueBackground = ({ children, className }) => {
  return (
    <div className={twMerge('relative min-h-screen bg-[#F7F1E3] overflow-hidden', className)}>
      
      {/* BACKGROUND EFFECTS LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full border border-[#00D9FF] opacity-20" />
        <div className="absolute bottom-40 right-20 w-64 h-64 rounded-full border border-[#00D9FF] opacity-10" />
        <div className="absolute top-40 right-40 w-16 h-16 rounded-full bg-[#00D9FF] opacity-5 blur-xl" />
        <div className="absolute bottom-20 left-40 w-24 h-24 rounded-full bg-[#00D9FF] opacity-10 blur-2xl" />

        {/* Small glowing dots */}
        <div className="absolute top-32 left-32 w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]" />
        <div className="absolute top-64 right-64 w-3 h-3 rounded-full bg-[#00D9FF] shadow-[0_0_15px_#00D9FF] opacity-50" />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-[#00D9FF] opacity-70" />
        <div className="absolute bottom-64 right-1/4 w-1.5 h-1.5 rounded-full bg-[#00D9FF] opacity-60" />

        {/* Faint ECG lines in background */}
        <svg className="absolute top-1/4 -left-10 w-64 h-24 opacity-20" viewBox="0 0 200 100" fill="none">
          <path d="M0 50 L40 50 L50 30 L60 80 L80 10 L100 60 L110 50 L200 50" stroke="#00D9FF" strokeWidth="1" strokeLinejoin="round" />
        </svg>

        <svg className="absolute top-1/3 -right-10 w-96 h-32 opacity-15" viewBox="0 0 300 100" fill="none">
          <path d="M0 50 L100 50 L115 20 L135 90 L160 10 L185 70 L200 50 L300 50" stroke="#00D9FF" strokeWidth="1" strokeLinejoin="round" />
        </svg>

        {/* Arcs and connecting lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M-100 200 Q150 300 300 -50" stroke="#00D9FF" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
          <path d="M800 1200 Q700 800 1200 600" stroke="#00D9FF" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 h-full">
        {children}
      </div>

    </div>
  );
};
