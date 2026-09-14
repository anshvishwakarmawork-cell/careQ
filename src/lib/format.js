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

export const formatWaitTime = (minutes) => {
  if (minutes < 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
