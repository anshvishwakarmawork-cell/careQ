import React from 'react';

export const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search...", className }) => {
  return (
    <select 
      className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className || ''}`}
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};
