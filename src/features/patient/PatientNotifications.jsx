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
            <p className={`text-navy ${n.read ? '' : 'font-semibold'}`}>{n.message}</p>
            <p className="text-xs text-muted mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
          </Card>
        ))
      )}
    </div>
  );
};
