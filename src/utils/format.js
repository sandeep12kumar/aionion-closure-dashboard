const IST = 'Asia/Kolkata';

export const formatDateTime = (value) => (value
  ? new Date(value).toLocaleString('en-IN', { timeZone: IST, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
  : '-');

export const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString('en-IN', { timeZone: IST, day: '2-digit', month: 'short', year: 'numeric' })
  : '-');

export const formatTime = (value) => (value
  ? new Date(value).toLocaleTimeString('en-IN', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: true })
  : '');

/** 1,284 / 12.9K - compact only past 10,000 (dataviz figure rule). */
export const formatNumber = (n) => {
  const value = Number(n) || 0;
  if (Math.abs(value) >= 10_000) return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  return value.toLocaleString('en-IN');
};

export const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} day${days > 1 ? 's' : ''} ago` : formatDate(value);
};

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';
