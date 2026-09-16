import React from 'react';

export const Table = ({ headers, children, className }) => {
  return (
    <div className={`overflow-x-auto w-full ${className || ''}`}>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-y border-slate-200">
          <tr>
            {headers && headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-medium text-slate-800">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
};
