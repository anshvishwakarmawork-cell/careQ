import React from 'react';

export const Select = ({ label, options = [], error, className = "", children, ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-navy mb-1">{label}</label>}
      <select 
        className={`border rounded-lg px-3 py-2 text-navy bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-red-500' : 'border-[#E2E8F0]'}`}
        {...props}
      >
        {children ? children : (
          <>
            <option value="" disabled>Select {label}</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </>
        )}
      </select>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};
