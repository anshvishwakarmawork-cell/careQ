import React from 'react';

export const NotificationItem = ({ notification, className }) => {
  if (!notification) return null;
  
  return (
    <div className={`p-3 rounded-lg mb-2 text-sm ${notification.read ? 'bg-slate-50 text-slate-600' : 'bg-blue-50 text-navy font-medium border-l-4 border-blue-500'} ${className || ''}`}>
      {notification.message}
      <div className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</div>
    </div>
  );
};
