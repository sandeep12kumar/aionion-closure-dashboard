/** Maker & Checker tabs (server: config/constants.js TABS). */
export const TABS = [
  { key: 'bucket', label: 'Bucket', dot: 'bg-status-warning' },
  { key: 'complete', label: 'Complete', dot: 'bg-status-good' },
  { key: 'no_need', label: 'No Need', dot: 'bg-status-neutral' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-status-critical' },
];

export const ACCOUNT_TYPE_LABEL = { TRADING: 'Trading', DEMAT: 'Demat', BOTH: 'Trading & Demat' };

/** Badge style per acnt_closure stage label. */
export const STAGE_STYLE = {
  'OTP Sent': 'bg-slate-100 text-slate-600 ring-slate-200',
  'In Progress': 'bg-sky-50 text-sky-700 ring-sky-200',
  'Documents Uploaded': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  eSigned: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  Expired: 'bg-slate-100 text-slate-500 ring-slate-200',
};

export const REVIEW_STYLE = {
  COMPLETE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  NO_NEED: 'bg-violet-50 text-violet-700 ring-violet-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
};

/** admin_logs.action -> readable text. */
export const ACTION_LABEL = {
  LOGIN: 'Logged in',
  LOGIN_FAILED: 'Failed login',
  LOGIN_LOCKED: 'Login locked',
  LOGOUT: 'Logged out',
  PASSWORD_CHANGED: 'Changed password',
  VIEW_REQUEST: 'Viewed request',
  VIEW_SIGNATURE: 'Viewed signature',
  VIEW_CMR: 'Viewed CMR',
  VIEW_CMR_PASSWORD: 'Viewed CMR password',
  VIEW_SIGNED_PDF: 'Viewed eSigned PDF',
  VIEW_UNSIGNED_PDF: 'Viewed closure form',
  MARK_COMPLETE: 'Marked Complete',
  MARK_NO_NEED: 'Marked No Need',
  REJECT: 'Rejected',
  MOVE_TO_BUCKET: 'Moved to Bucket',
  EXPORT_REQUESTS: 'Exported requests',
  EXPORT_LOGS: 'Exported logs',
};

export const ACTION_TONE = {
  MARK_COMPLETE: 'text-emerald-600 bg-emerald-50',
  MARK_NO_NEED: 'text-violet-600 bg-violet-50',
  REJECT: 'text-red-600 bg-red-50',
  LOGIN_FAILED: 'text-red-600 bg-red-50',
  LOGIN_LOCKED: 'text-red-600 bg-red-50',
  MOVE_TO_BUCKET: 'text-amber-600 bg-amber-50',
};
