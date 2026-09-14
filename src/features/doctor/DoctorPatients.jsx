import React from "react";
import { useQueue } from "../../store/QueueStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const DoctorPatients = () => {
  const { state } = useQueue();
  const doctorId = state.currentUser?.doctorId;
  
  if (!doctorId) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const myQueue = state.queueEntries.filter(q => q.doctorId === doctorId && q.joinedAt && q.joinedAt.startsWith(todayStr));
  const completed = myQueue.filter(q => q.status === "COMPLETED");
  const skipped = myQueue.filter(q => q.status === "SKIPPED");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Today's Patients</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Completed Consultations ({completed.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-center py-8 text-muted">No completed consultations yet today.</div>
          ) : (
            <QueueTable entries={completed} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skipped Patients ({skipped.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {skipped.length === 0 ? (
            <div className="text-center py-8 text-muted">No patients were skipped today.</div>
          ) : (
            <QueueTable entries={skipped} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
