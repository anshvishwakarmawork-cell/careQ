export const getEstimatedWaitMin = (patientsAhead, doctor) => {
  if (!doctor) return 0;
  return (patientsAhead * doctor.avgConsultationMin) + (doctor.delayMinutes || 0);
};

export const smartEstimate = (patientsAhead, doctor, entry) => {
  if (!doctor) return 0;
  
  let estimate = (patientsAhead * doctor.avgConsultationMin);
  
  if (doctor.status === "DELAYED") {
    estimate += (doctor.delayMinutes || 0);
  } else if (doctor.status === "ON_BREAK" || doctor.queuePaused) {
    estimate += 15;
  }
  
  if (entry && entry.priority === "EMERGENCY") {
    estimate = 0;
  } else if (entry && entry.priority === "URGENT") {
    estimate = estimate * 0.5; // Roughly half wait time
  }
  
  return estimate > 0 ? estimate : 0;
};

export const formatWaitTime = (minutes) => {
  if (minutes <= 0) return "Next in line";
  return `~${Math.round(minutes)} min`;
};
