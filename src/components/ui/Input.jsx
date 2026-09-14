import React from 'react';

export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-navy mb-1">{label}</label>}
      <input 
        className={`border rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-red-500' : 'border-[#E2E8F0]'}`}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};
