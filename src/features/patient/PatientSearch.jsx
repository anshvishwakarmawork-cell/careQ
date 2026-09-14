import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useQueue } from "../../store/QueueStore";
import { Card } from "../../components/ui/Card";

export const PatientSearch = () => {
  const { state } = useQueue();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredHospitals = state.doctors
    .map(d => {
      const h = state.hospitals.find(hosp => hosp.id === d.hospitalId);
      return h ? { ...h, doctorName: d.name, deptId: d.departmentId } : null;
    })
    .filter(Boolean)
    .filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.doctorName.toLowerCase().includes(query.toLowerCase())
    );

  // Group by hospital for unique results
  const uniqueHospitals = Array.from(new Set(filteredHospitals.map(h => h.id)))
    .map(id => state.hospitals.find(h => h.id === id));

  return (
    <div className="p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Search doctors, hospitals, specialties..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-navy">Hospitals</h2>
        {uniqueHospitals.map(h => (
          <Card key={h.id} className="p-4 bg-white" onClick={() => navigate(`/patient/hospital/${h.id}`)}>
            <h3 className="font-semibold text-navy">{h.name}</h3>
            <p className="text-sm text-muted">{h.city}</p>
          </Card>
        ))}
        {uniqueHospitals.length === 0 && <p className="text-muted">No results found.</p>}
      </div>
    </div>
  );
};
