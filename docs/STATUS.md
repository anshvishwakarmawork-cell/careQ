# CareQueue Status

## Current Phase: Phase 5 (AWS Serverless Backend) - COMPLETED

## Phase 0: Project Setup - COMPLETED
- Initialize React/Vite project
- Configure Tailwind CSS
- Set up React Router
- Define global state management (React Context + useReducer)
- Create mock data

## Phase 1: Patient Portal (Core) - COMPLETED
- Login Screen (Role-based entry)
- Patient Dashboard
- Hospital & Doctor Search
- Hospital Detail View & Doctor Detail View
- Token Screen
- Visits History & Notifications
- User Profile

## Phase 2: Doctor & Reception Portals - COMPLETED
- Doctor Dashboard & Live Queue Table
- Patient Calling (Call Next, Start, Complete, Skip)
- Pause/Resume Queue
- Reception Dashboard
- Queue Reordering & Add Walk-in
- Doctor Status Management

## Phase 3: Auth & Registration - COMPLETED
- Role Selection
- Patient Registration (Form + OTP verification)
- Doctor Registration (Multi-step + Admin Verification pending)

## Phase 4: Hackathon Differentiators - COMPLETED
- Appointments (Patient Portal)
- QR Check-In
- Smart Wait Estimate
- Analytics Dashboard
- Transfer Patient
- PWA Basics (vite-plugin-pwa)

## Phase 5: AWS Serverless Backend (post-MVP) - COMPLETED
- AWS SAM Template (`backend/template.yaml`)
- DynamoDB Shared Logic & Engine (`backend/src/shared/queue-engine.js`)
- WebSocket Broadcasting (`backend/src/shared/websocket.js`)
- Backend Handlers (`backend/src/handlers/queue.js`, `websocket.js`)
- Frontend API Integration (`src/store/api.js`, `socket.js`)
- Async Dispatch Interception in `QueueStore.jsx`

### Known Gaps
- Full mapping of every action in the reducer to a dedicated Lambda function is stubbed.
- Cognito User Pool integration with frontend login is stubbed (mock tokens used).

### Recent Updates
- Fully implemented Reception Dashboard (`/reception/dashboard`) with dynamic data from the store, `StatCard` integration, and responsive layouts.
- Audited and implemented all stubbed components in `src/components` according to `docs/DESIGN.md`, ensuring styling consistency across the app.

### How to Test (Local Mock Mode)
1. Ensure `.env` has `VITE_USE_MOCK=true`.
2. Run `npm run dev`.
3. Application works in mock memory mode.

### How to Test (AWS Backend)
1. Deploy via `sam deploy --guided` in the `backend/` folder.
2. Set `VITE_USE_MOCK=false` and provide `VITE_API_URL` and `VITE_WS_URL`.
3. Run `npm run dev`.
