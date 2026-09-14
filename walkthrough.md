# MediQueue: Complete Implementation Walkthrough (Phase 0 – Phase 5)

Welcome to the complete MediQueue application! This document walks you through the entire hackathon project build from inception (Phase 0) to our scalable AWS Serverless architecture (Phase 5). 

---

## Phase 0: Project Foundation & UI Primitives
We began by laying down a solid frontend foundation to ensure rapid iteration and a consistent aesthetic.
- **Scaffolding**: Initialized a React application powered by Vite, configuring Tailwind CSS for styling.
- **Global State**: Implemented `QueueStore.jsx` and `queueReducer.js` with React Context to manage a unified global state.
- **Mock Data**: Created rich, realistic mock data for `users`, `hospitals`, `doctors`, `queueEntries`, and `appointments` to enable immediate UI development.
- **UI System**: Built a robust set of reusable, accessible UI primitives including `Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Sidebar`, and `BottomTabBar`.

## Phase 1: Patient Portal (Core Experience)
This phase focused on the core patient journey—from finding a doctor to tracking a live queue.
- **Authentication**: Built a unified Login Screen routing users based on their role (`PATIENT`, `DOCTOR`, `RECEPTION`).
- **Dashboard & Search**: Implemented a Patient Dashboard featuring upcoming visits and a comprehensive Search screen for discovering hospitals and doctors.
- **Queue Joining**: Allowed patients to join virtual queues directly from a Doctor's Detail View.
- **Live Token Screen**: Designed an engaging live queue tracking screen (`TokenScreen.jsx`) that displays the patient's current status (e.g., "You are next!"), wait time, and a progress bar.
- **History & Notifications**: Added a Visits history log and a real-time Notification center.

## Phase 2: Doctor & Reception Portals
We then empowered the clinic staff with powerful tools to manage the influx of patients.
- **Doctor Dashboard**: Created a live dashboard where doctors can view their current patient, statistics, and a full queue table.
- **Patient Calling**: Empowered doctors with actions to `CALL_NEXT`, `START_CONSULTATION`, `COMPLETE`, and `SKIP` patients, seamlessly advancing the queue.
- **Queue Control**: Added the ability for doctors to Pause and Resume their queues during emergencies or breaks.
- **Reception Dashboard**: Built a global view for receptionists to monitor all doctors' queues in the hospital.
- **Walk-ins & Reordering**: Enabled receptionists to seamlessly add Walk-in patients, adjust priorities, and reorder the queue instantly.

## Phase 3: Authentication & Registration 
To bring the application to life for new users, we built out the onboarding workflows.
- **Role Selection**: A clean, intuitive Role Selection screen to guide users based on their intent (Patient vs. Doctor).
- **Patient Registration**: A comprehensive registration form utilizing custom validators, followed by a simulated Mobile OTP verification step (`VerifyOTP.jsx`).
- **Doctor Registration**: A multi-step stepper form for doctors to submit their professional and hospital credentials, culminating in a "Verification Pending" screen for admin approval.

## Phase 4: Hackathon Differentiators
This phase introduced our core "wow" factors to distinguish MediQueue during the hackathon.
- **Appointments System**: Added a tabbed booking flow enabling patients to book specific time slots instead of just joining the live queue.
- **QR Code Check-in**: Integrated `qrcode.react` to generate hospital QR codes. Patients scan these deep-links (`/checkin?hospitalId=...`) to instantly check-in to their physical or virtual appointments upon arrival.
- **Smart Wait-Time Estimator**: Upgraded the standard estimate logic to dynamically factor in doctor delays, pauses, and the priority of patients ahead (Emergency vs Regular).
- **Transfer Patient Flow**: Enabled receptionists and doctors to seamlessly transfer a patient to another department or doctor without losing their priority standing.
- **Analytics Dashboard**: Integrated `recharts` for the Reception Portal, displaying gorgeous, real-time charts on patient throughput, average wait times, and departmental loads.
- **PWA Integration**: Configured `vite-plugin-pwa` to support installing MediQueue as a native-feeling app on mobile devices, complete with a custom install prompt.

## Phase 5: AWS Serverless Backend (Post-MVP Architecture)
For scale and production-readiness, we designed and laid the groundwork for an AWS-native backend.
- **Infrastructure as Code**: Wrote an AWS SAM `template.yaml` defining an API Gateway (HTTP + WebSocket), a single-table DynamoDB setup (`CareQueue`), and Cognito User Pools.
- **State Machine Engine**: Developed `queue-engine.js` with the custom logic to generate DynamoDB sort keys (`<priorityRank><checkedIn><joinedAtIso>#<entryId>`) allowing the database to inherently sort patients by priority without in-memory operations.
- **Lambda Handlers**: Scaffolded robust backend handlers for core queue operations and WebSocket subscriptions.
- **Frontend Decoupling**: Updated `QueueStore.jsx` to intercept dispatched actions. If `VITE_USE_MOCK=false`, actions route through a new `api.js` fetch wrapper (with JWT tokens) and `socket.js` for real-time WebSocket syncing, fully preserving the frontend UI logic!

---

> [!TIP]
> **Ready for Demo!**
> You can run `npm run dev` in the default mock mode (`VITE_USE_MOCK=true`) to demonstrate the **entire feature set from Phase 0 to 4** perfectly in the browser. 
> To test the Phase 5 architecture, deploy the AWS SAM stack in the `backend/` directory using `sam deploy --guided`.
