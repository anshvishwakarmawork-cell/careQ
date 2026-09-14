import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const DoctorQueue = () => {
  const { state } = useQueue();
  const doctorId = state.currentUser?.doctorId;
  
  if (!doctorId) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const myQueue = state.queueEntries.filter(q => q.doctorId === doctorId && q.joinedAt && q.joinedAt.startsWith(todayStr));
  const waiting = myQueue.filter(q => q.status === "WAITING");
  const called = myQueue.filter(q => q.status === "CALLED" || q.status === "IN_CONSULTATION");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Live Queue</h1>
      
      {called.length > 0 && (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-primary">Currently Serving</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueTable entries={called} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waiting ({waiting.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {waiting.length === 0 ? (
            <div className="text-center py-8 text-muted">No patients waiting.</div>
          ) : (
            <QueueTable entries={waiting} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
