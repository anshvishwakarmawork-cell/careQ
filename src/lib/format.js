export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return new Date(dateStr).toLocaleTimeString(undefined, options);
};

export const formatHumanReadableDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const formattedDate = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formattedDate} • ${formattedTime}`;
};

export const formatQueueStatus = (status) => {
  if (!status) return '';
  const words = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return words.join(' ');
};

export const formatDoctorName = (name) => {
  if (!name) return '';
  let cleanName = name.trim();
  while (cleanName.toLowerCase().startsWith('dr. ') || cleanName.toLowerCase().startsWith('dr ')) {
    cleanName = cleanName.substring(cleanName.indexOf(' ') + 1).trim();
  }
  return `Dr. ${cleanName}`;
};

export const formatWaitTime = (minutes) => {
  if (minutes < 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
