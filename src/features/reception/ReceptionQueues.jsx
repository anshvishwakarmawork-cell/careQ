import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { Card, CardContent } from "../../components/ui/Card";
import { QueueTable } from "../../components/queue/QueueTable";

export const ReceptionQueues = () => {
  const { doctorId } = useParams();
  const { state } = useQueue();
  const [activeTab, setActiveTab] = useState(doctorId || "ALL");

  useEffect(() => {
    if (doctorId) {
      setActiveTab(doctorId);
    }
  }, [doctorId]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hospitalId = state.currentUser?.hospitalId;
  const hospitalQueue = state.queueEntries.filter(q => q.hospitalId === hospitalId);
  
  const todayQueue = hospitalQueue.filter(q => q.joinedAt && q.joinedAt.startsWith(todayStr) && q.status === "WAITING");
  const filteredQueue = activeTab === "ALL" ? todayQueue : todayQueue.filter(q => q.doctorId === activeTab);
  
  const hospitalDoctors = state.doctors.filter(d => d.hospitalId === hospitalId);
  const activeDoctors = hospitalDoctors.filter(d => d.status !== "UNAVAILABLE");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">All Hospital Queues</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === "ALL" ? "bg-navy text-white" : "bg-white text-navy border border-[#E2E8F0]"}`}
        >
          All Doctors
        </button>
        {activeDoctors.map(doctor => (
          <button
            key={doctor.id}
            onClick={() => setActiveTab(doctor.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === doctor.id ? "bg-primary text-white" : "bg-white text-navy border border-[#E2E8F0]"}`}
          >
            {doctor.name}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredQueue.length === 0 ? (
             <div className="text-center py-8 text-muted">No patients waiting.</div>
          ) : (
            <QueueTable entries={filteredQueue} showActions={true} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
