import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { getActiveEntryForPatient } from "../../store/selectors";

export const CheckIn = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = state;
  const [status, setStatus] = useState("loading");
  const [activeEntry, setActiveEntry] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "PATIENT") {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        const currentUrl = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${currentUrl}`);
      }
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const qrHospitalId = searchParams.get('hospitalId');
    const qrDepartmentId = searchParams.get('departmentId');

    const entry = getActiveEntryForPatient(state, currentUser.patientId);
    
    if (!entry) {
      setStatus("no_appointment");
      return;
    }

    const doctor = state.doctors.find(d => d.id === entry.doctorId);
    const hospital = state.hospitals.find(h => h.id === doctor?.hospitalId);
    const department = state.departments.find(d => d.id === doctor?.departmentId);
    
    if (qrHospitalId && doctor && doctor.hospitalId !== qrHospitalId) {
      const scannedHospital = state.hospitals.find(h => h.id === qrHospitalId);
      const scannedDept = state.departments.find(d => d.id === qrDepartmentId) || department;

      setStatus("invalid_hospital");
      setErrorDetails({
        expectedHospital: hospital?.name,
        expectedDepartment: department?.name || doctor?.specialization,
        scannedHospital: scannedHospital?.name || qrHospitalId,
        scannedDepartment: scannedDept?.name || doctor?.specialization
      });
      return;
    }
    
    if (qrDepartmentId && doctor && doctor.departmentId !== qrDepartmentId) {
      const scannedDept = state.departments.find(d => d.id === qrDepartmentId);

      setStatus("invalid_department");
      setErrorDetails({
        expectedHospital: hospital?.name,
        expectedDepartment: department?.name || doctor?.specialization,
        scannedHospital: hospital?.name,
        scannedDepartment: scannedDept?.name || qrDepartmentId
      });
      return;
    }

    if (entry.checkedIn) {
      setStatus("already_checked_in");
      setTimeout(() => navigate(`/patient/token/${entry.id}`), 3000);
      return;
    }

    // Passed validation
    setActiveEntry(entry);
    setDoctorInfo(doctor);
    setHospitalInfo(hospital);
    setDepartmentInfo(department);
    setStatus("confirm");

  }, [currentUser, navigate, state]);

  const handleConfirmCheckIn = () => {
    setStatus("processing");
    setTimeout(() => {
      dispatch({ type: ACTIONS.CHECK_IN, payload: { entryId: activeEntry.id } });
      setStatus("success");
      setTimeout(() => {
        navigate(`/patient/token/${activeEntry.id}`);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-section flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-4 shadow-lg border-t-4 border-t-primary">
        
        {status === "loading" && (
          <div className="py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-navy">Validating Check-In...</h2>
          </div>
        )}
        
        {status === "processing" && (
          <div className="py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-navy">Checking In...</h2>
          </div>
        )}

        {status === "confirm" && activeEntry && (
          <div className="py-4">
            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Confirm Check-In</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
              <p className="text-sm text-muted mb-1">Hospital</p>
              <p className="font-semibold text-navy mb-3">{hospitalInfo?.name}</p>
              
              <p className="text-sm text-muted mb-1">Department</p>
              <p className="font-semibold text-navy mb-3">{departmentInfo?.name || doctorInfo?.specialization}</p>
              
              <p className="text-sm text-muted mb-1">Doctor</p>
              <p className="font-semibold text-navy">{doctorInfo?.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/patient/dashboard')}>Cancel</Button>
              <Button className="flex-1" onClick={handleConfirmCheckIn}>Check In Now</Button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Checked In Successfully!</h2>
            <p className="text-muted">Redirecting to your live token...</p>
          </div>
        )}

        {status === "already_checked_in" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Already Checked In</h2>
            <p className="text-muted">You are already checked in. Redirecting to your token...</p>
          </div>
        )}

        {status === "no_appointment" && (
          <div className="py-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-3">NO ACTIVE APPOINTMENT OR VERIFIED TOKEN FOUND</h2>
            <p className="text-muted mb-6">We couldn't find a valid appointment or verified queue token for this department. Please visit the hospital reception desk to book an appointment or get assistance.</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/patient/dashboard')}>Go Back</Button>
          </div>
        )}

        {(status === "invalid_hospital" || status === "invalid_department") && errorDetails && (
          <div className="py-6 text-left">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-6 text-center">
              {status === "invalid_hospital" ? "Wrong Hospital Check-In Point" : "Wrong Department Check-In Point"}
            </h2>
            
            <p className="text-navy font-semibold mb-1">Your active appointment is for:</p>
            <div className="bg-gray-50 rounded p-3 mb-4 text-sm border border-gray-200">
              <p>{errorDetails.expectedHospital}</p>
              <p>{errorDetails.expectedDepartment}</p>
            </div>

            <p className="text-navy font-semibold mb-1">You scanned:</p>
            <div className="bg-red-50 rounded p-3 mb-6 text-sm border border-red-100 text-red-900">
              <p>{errorDetails.scannedHospital}</p>
              <p>{errorDetails.scannedDepartment}</p>
            </div>

            <p className="text-muted mb-6 text-center text-sm">
              Please check in at {errorDetails.expectedHospital} or visit Reception for assistance.
            </p>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/patient/dashboard')}>Go Back</Button>
              <Button variant="outline" className="flex-1 bg-white" onClick={() => navigate('/patient/visits')}>View Appointment</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
