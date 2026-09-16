import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Building, User, Stethoscope } from "lucide-react";
import { useQueue } from "../../store/QueueStore";
import { Card } from "../../components/ui/Card";
import { formatDoctorName } from "../../lib/format";

export const PatientSearch = () => {
  const { state } = useQueue();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const filteredDoctors = (state.doctors || [])
    .map(d => {
      const h = state.hospitals?.find(hosp => hosp.id === d.hospitalId);
      const dept = state.departments?.find(dep => dep.id === d.departmentId);
      return { ...d, hospitalName: h?.name, hospitalCity: h?.city, deptName: dept?.name };
    })
    .filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      (item.hospitalName && item.hospitalName.toLowerCase().includes(query.toLowerCase())) ||
      (item.deptName && item.deptName.toLowerCase().includes(query.toLowerCase())) ||
      (item.specialization && item.specialization.toLowerCase().includes(query.toLowerCase()))
    );

  const filteredHospitals = (state.hospitals || [])
    .filter(h => 
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      (h.city && h.city.toLowerCase().includes(query.toLowerCase()))
    );

  const filteredDepartments = (state.departments || [])
    .filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase())
    );

  const tabParam = searchParams.get("tab") || "all";

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto pb-20">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-navy">Find Care</h1>
        <p className="text-muted text-sm mt-1">Search for doctors, hospitals, or specialties</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, hospital, specialty..." 
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-navy"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-8">
        {(query ? (filteredDoctors.length > 0 || filteredHospitals.length > 0 || filteredDepartments.length > 0) : true) ? (
          <>
            {/* Doctors Section */}
            {(tabParam === "all" || tabParam === "doctors") && (query ? filteredDoctors.length > 0 : true) && (
              <div>
                <h2 className="font-bold text-navy text-lg mt-6 mb-4">Doctors</h2>
                {filteredDoctors.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredDoctors.map(d => (
                      <Card key={d.id} className="p-5 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer rounded-2xl" onClick={() => navigate(`/patient/doctor/${d.id}`)}>
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                            <User size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy text-lg">{formatDoctorName(d.name)}</h3>
                            <p className="text-sm font-medium text-primary">{d.specialization || d.deptName}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted flex items-center gap-1.5">
                                <Building size={14} /> {d.hospitalName}
                              </p>
                              <p className="text-xs text-muted flex items-center gap-1.5">
                                <MapPin size={14} /> {d.hospitalCity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">No doctors found.</p>
                )}
              </div>
            )}

            {/* Hospitals Section */}
            {(tabParam === "all" || tabParam === "hospitals") && (query ? filteredHospitals.length > 0 : true) && (
              <div>
                <h2 className="font-bold text-navy text-lg mt-8 mb-4">Hospitals</h2>
                {filteredHospitals.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredHospitals.map(h => (
                      <Card 
                        key={h.id} 
                        className="p-5 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer rounded-2xl"
                        onClick={() => navigate(`/patient/hospital/${h.id}`)}
                      >
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                            <Building size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy text-lg">{h.name}</h3>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted flex items-center gap-1.5">
                                <MapPin size={14} /> {h.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">No hospitals found.</p>
                )}
              </div>
            )}

            {/* Departments Section */}
            {(tabParam === "all" || tabParam === "departments") && (query ? filteredDepartments.length > 0 : true) && (
              <div>
                <h2 className="font-bold text-navy text-lg mt-8 mb-4">Departments</h2>
                {filteredDepartments.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredDepartments.map(d => (
                      <Card 
                        key={d.id} 
                        className="p-5 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer rounded-2xl"
                        onClick={() => {
                          setSearchParams({ q: d.name });
                          setQuery(d.name);
                        }}
                      >
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                            <Stethoscope size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-navy text-lg">{d.name}</h3>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm italic">No departments found.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <NoResults />
        )}
      </div>
    </div>
  );
};

const NoResults = () => (
  <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
      <Search size={32} />
    </div>
    <p className="text-navy font-bold text-lg mb-1">No results found</p>
    <p className="text-muted text-sm max-w-xs mx-auto">Try adjusting your search terms or checking for typos.</p>
  </div>
);
