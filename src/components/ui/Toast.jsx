import React from 'react';

export const Toast = ({ message, type = 'info', onClose, className }) => {
  const bg = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-slate-800';
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 ${className || ''}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-white/80 hover:text-white focus:outline-none text-xl leading-none">
          &times;
        </button>
      )}
    </div>
  );
};
