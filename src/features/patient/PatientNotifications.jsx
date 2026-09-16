import React from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";

export const PatientNotifications = () => {
  const { state, dispatch } = useQueue();
  const { currentUser, notifications } = state;

  if (!currentUser) return null;

  const myNotifications = notifications.filter(n => n.userId === currentUser.patientId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-navy mb-6">Notifications</h1>
      
      {myNotifications.length === 0 ? (
        <p className="text-muted text-center mt-10">No notifications.</p>
      ) : (
        myNotifications.map(n => (
          <Card 
            key={n.id} 
            className={`p-4 ${n.read ? 'bg-white opacity-75' : 'bg-blue-50 border border-blue-100'}`}
            onClick={() => {
              if (!n.read) dispatch({ type: ACTIONS.MARK_NOTIFICATION_READ, payload: { id: n.id } });
            }}
          >
            <div className="flex justify-between items-start">
              <p className={`text-navy ${n.read ? '' : 'font-semibold'}`}>{n.message}</p>
            </div>
            
            {(n.oldDate || n.newDate || n.oldTime || n.newTime) && (
              <div className="bg-white/50 p-3 rounded-md text-sm mt-3 space-y-2 border border-blue-50">
                {(n.oldDate || n.oldTime) && (
                  <div className="flex items-start gap-2 text-gray-500 line-through">
                    <span>Previous: {n.oldDate} {n.oldTime && `• ${n.oldTime}`}</span>
                  </div>
                )}
                {(n.newDate || n.newTime) && (
                  <div className="flex items-start gap-2 text-primary font-medium">
                    <span>New: {n.newDate} {n.newTime && `• ${n.newTime}`}</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-muted mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
          </Card>
        ))
      )}
    </div>
  );
};
