# MediQueue Hackathon Demo Script

## 1. Setup & Launch
- Start the app with `npm run dev`
- Open the application in two side-by-side browser windows (or use a phone for the patient view).

## 2. Reception & Check-in Flow
- **Window 1 (Reception):** Log in as **Reception**. Show the **Dashboard** and **Patient QR** screen.
- Explain: "This QR code is placed at the reception desk. Patients scan it to join the queue seamlessly."
- **Window 2 (Patient):** Navigate to the QR code deep link (e.g., `/checkin?hospitalId=h1`).
- Show the patient registering and checking in via the deep link.
- **Window 1:** Navigate to **Queues**. Show the patient has appeared as "Checked In".
- Demonstrate the **Transfer** functionality by clicking Transfer on a patient and assigning them to a different doctor.

## 3. Smart Waiting Room & Appointments
- **Window 2 (Patient):** Show the **Patient Dashboard**. Point out the active token and the **Est. Wait Time**.
- Explain: "The wait time dynamically updates based on the doctor's current status and how many patients are ahead."
- Click on the token to see the detailed **Token Screen**.
- Demonstrate the **Appointments** tab: Book an appointment for a future date, and show it under the "Upcoming" section.

## 4. Doctor Management & Analytics
- **Window 1 (Doctor):** Log in as **Doctor**. Show the queue.
- Click **Next Patient** to call the patient in.
- **Window 2 (Patient):** Show the real-time update in the patient app ("Now Serving").
- **Window 1 (Reception):** Log back into Reception and go to **Analytics**.
- Show the graphs for average wait times, peak hours, and patient throughput to demonstrate data-driven insights.

## 5. PWA (Mobile Experience)
- On the **Patient Dashboard**, demonstrate the **Install App** button.
- Explain: "MediQueue is a PWA. Patients can install it directly from the browser without going through an app store, saving space and providing a native-like experience."
