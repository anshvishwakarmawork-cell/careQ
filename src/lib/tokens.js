export const nextToken = (doctorId, doctorsList, queueEntriesList) => {
  const doctor = doctorsList.find(d => d.id === doctorId);
  if (!doctor) return "X-00";

  // In a real app, this would query entries for that doctor today.
  const todaysEntries = queueEntriesList.filter(e => e.doctorId === doctorId);
  const count = todaysEntries.length + 1;
  
  // E.g. A-26
  return `${doctor.photoInitials.charAt(0) || 'A'}-${String(count).padStart(2, '0')}`;
};
