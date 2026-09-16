import React from 'react';

export const ProgressBar = ({ progress = 0, colorClass = "bg-blue-600", className }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className || ''}`}>
      <div 
        className={`h-full ${colorClass} transition-all duration-300`} 
        style={{ width: `${safeProgress}%` }} 
      />
    </div>
  );
};
