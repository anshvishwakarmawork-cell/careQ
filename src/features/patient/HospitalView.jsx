import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { Card } from "../../components/ui/Card";
import { getHospitalQueue } from "../../store/selectors";
import { formatWaitTime } from "../../lib/waitTime";

export const HospitalView = () => {
  const { id } = useParams();
  const { state } = useQueue();
  const navigate = useNavigate();
  
  const hospital = state.hospitals.find(h => h.id === id);
  const hospitalDoctors = state.doctors.filter(d => d.hospitalId === id);

  if (!hospital) return <div className="p-4">Hospital not found</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-primary text-white p-6 rounded-xl -mx-4 -mt-4 rounded-t-none">
        <h1 className="text-2xl font-bold">{hospital.name}</h1>
        <p className="text-blue-100">{hospital.address}</p>
      </div>

      <h2 className="font-bold text-navy text-lg">Our Doctors</h2>
      <div className="space-y-4">
        {hospitalDoctors.map(doc => {
          // Calculate waiting count for this doctor
          const waitingQueue = state.queueEntries.filter(e => e.doctorId === doc.id && (e.status === "WAITING" || e.status === "CALLED"));
          const waitingCount = waitingQueue.length;
          
          return (
            <Card key={doc.id} className="p-4 bg-white flex flex-col" onClick={() => navigate(`/patient/doctor/${doc.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-navy">{doc.name}</h3>
                  <p className="text-sm text-muted">{doc.specialization}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  doc.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                  doc.status === 'DELAYED' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status}
                </div>
              </div>
              <div className="flex space-x-4 text-sm mt-2">
                <div><span className="font-semibold">{waitingCount}</span> waiting</div>
                <div className="text-muted">•</div>
                <div>{formatWaitTime(waitingCount * doc.avgConsultationMin + doc.delayMinutes)}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
