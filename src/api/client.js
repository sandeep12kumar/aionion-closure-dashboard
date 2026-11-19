import axios from 'axios';

export const UNAUTHORIZED_EVENT = 'dash:unauthorized';

const http = axios.create({ baseURL: '/api', withCredentials: true, timeout: 60_000 });

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error?.response) return 'Unable to reach the server. Please check your connection.';
  return error.response.data?.message || fallback;
};

const data = (promise) => promise.then((res) => res.data);

export const api = {
  // auth
  login: (payload) => data(http.post('/auth/login', payload)),
  logout: () => data(http.post('/auth/logout')),
  me: () => data(http.get('/auth/me')),
  changePassword: (payload) => data(http.post('/auth/change-password', payload)),

  // dashboard
  summary: (months) => data(http.get('/dashboard/summary', { params: { months } })),

  // maker & checker
  requests: (params) => data(http.get('/requests', { params })),
  request: (id) => data(http.get(`/requests/${id}`)),
  // { url, contentType, fileName } - url is a short-lived S3 link shown directly in <img> / <iframe>
  fileLink: (id, kind) => data(http.get(`/requests/${id}/files/${kind}`)).then((res) => res.data),
  fileUrl: (id, kind, download = false) => `/api/requests/${id}/files/${kind}${download ? '?download=1' : ''}`,
  cmrPassword: (id) => data(http.get(`/requests/${id}/cmr-password`)),
  decide: (id, payload) => data(http.post(`/requests/${id}/decision`, payload)),
  moveToBucket: (id) => data(http.post(`/requests/${id}/move-to-bucket`)),
  exportUrl: (params) => `/api/requests/export?${new URLSearchParams(params)}`,

  // admin logs
  logs: (params) => data(http.get('/logs', { params })),
  logsExportUrl: (params) => `/api/logs/export?${new URLSearchParams(params)}`,
};
