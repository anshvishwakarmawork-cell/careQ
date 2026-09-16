import React from 'react';

export const EmptyState = ({ icon, title, description, action, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed ${className || ''}`}>
      {icon && <div className="text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
