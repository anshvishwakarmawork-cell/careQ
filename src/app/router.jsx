import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Login } from "../features/auth/Login";
import { RoleGuard } from "./RoleGuard";

import { PatientLayout } from "../features/patient/PatientLayout";
import { PatientDashboard } from "../features/patient/PatientDashboard";
import { PatientSearch } from "../features/patient/PatientSearch";
import { HospitalView } from "../features/patient/HospitalView";
import { DoctorView } from "../features/patient/DoctorView";
import { TokenScreen } from "../features/patient/TokenScreen";
import { PatientVisits } from "../features/patient/PatientVisits";
import { PatientNotifications } from "../features/patient/PatientNotifications";
import { PatientProfile } from "../features/patient/PatientProfile";
import { QueueRequestStatus } from "../features/patient/QueueRequestStatus";

import { DoctorLayout } from "../features/doctor/DoctorLayout";
import { DoctorDashboard } from "../features/doctor/DoctorDashboard";
import { DoctorQueue } from "../features/doctor/DoctorQueue";
import { DoctorPatients } from "../features/doctor/DoctorPatients";
import { DoctorProfile } from "../features/doctor/DoctorProfile";

import { ReceptionLayout } from "../features/reception/ReceptionLayout";
import { ReceptionDashboard } from "../features/reception/ReceptionDashboard";
import { ReceptionQueues } from "../features/reception/ReceptionQueues";
import { ReceptionDoctors } from "../features/reception/ReceptionDoctors";
import { ReceptionAppointments } from "../features/reception/ReceptionAppointments";
import { ReceptionNotifications } from "../features/reception/ReceptionNotifications";
import { ReceptionQR } from "../features/reception/ReceptionQR";

import { TokenVerification } from "../features/reception/TokenVerification";
import { DoctorVerifications } from "../features/reception/DoctorVerifications";

import { RoleSelection } from "../features/auth/RoleSelection";
import { PatientRegistration } from "../features/auth/PatientRegistration";
import { DoctorRegistration } from "../features/auth/DoctorRegistration";
import { VerifyOTP } from "../features/auth/VerifyOTP";
import { DoctorVerification } from "../features/auth/DoctorVerification";
import { CheckIn } from "../features/patient/CheckIn";
import CareQueueLanding from "../components/landing/CareQueueLanding";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <CareQueueLanding
      onGetStarted={() => navigate("/carequeue-app")}
      onLogin={() => navigate("/login")}
      onStaff={(role) => navigate(`/login?portal=${role}`)}
    />
  );
};

import CareQueueWelcome from "../components/welcome/CareQueueWelcome";

const WelcomePreview = () => {
  const navigate = useNavigate();

  return (
    <CareQueueWelcome
      onGetStarted={() => navigate("/register/patient")}
      onLogin={() => navigate("/login")}
      onStaff={() => navigate("/login")}
    />
  );
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      <Route
        path="/carequeue-app"
        element={<WelcomePreview />}
      />

      <Route
        path="/welcome-preview"
        element={<WelcomePreview />}
      />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<RoleSelection />} />

      <Route
        path="/register/patient"
        element={<PatientRegistration />}
      />

      <Route
        path="/register/doctor"
        element={<DoctorRegistration />}
      />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route
        path="/doctor/verification"
        element={<DoctorVerification />}
      />
      <Route path="/checkin" element={<CheckIn />} />
      <Route path="/patient/checkin" element={<CheckIn />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={<RoleGuard allowedRole="PATIENT" />}
      >
        <Route element={<PatientLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="search" element={<PatientSearch />} />
          <Route path="hospital/:id" element={<HospitalView />} />
          <Route path="doctor/:id" element={<DoctorView />} />
          <Route path="token/:entryId" element={<TokenScreen />} />
          <Route
            path="queue-request/:requestId"
            element={<QueueRequestStatus />}
          />
          <Route path="visits" element={<PatientVisits />} />
          <Route
            path="notifications"
            element={<PatientNotifications />}
          />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={<RoleGuard allowedRole="DOCTOR" />}
      >
        <Route element={<DoctorLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="queue" element={<DoctorQueue />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
      </Route>

      {/* Reception Routes */}
      <Route
        path="/reception"
        element={<RoleGuard allowedRole="RECEPTION" />}
      >
        <Route element={<ReceptionLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />
          <Route
            path="dashboard"
            element={<ReceptionDashboard />}
          />
          <Route path="queues" element={<ReceptionQueues />} />
          <Route
            path="queues/:doctorId"
            element={<ReceptionQueues />}
          />
          <Route
            path="verification"
            element={<TokenVerification />}
          />
          <Route
            path="verifications"
            element={<DoctorVerifications />}
          />
          <Route
            path="doctors"
            element={<ReceptionDoctors />}
          />
          <Route
            path="appointments"
            element={<ReceptionAppointments />}
          />
          <Route
            path="notifications"
            element={<ReceptionNotifications />}
          />
          <Route path="qr" element={<ReceptionQR />} />
          <Route
            path="analytics"
            element={
              <Navigate
                to="/reception/dashboard#analytics"
                replace
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};