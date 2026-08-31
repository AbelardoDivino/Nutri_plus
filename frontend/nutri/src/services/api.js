import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, async err => {
  const original = err.config;
  if (err.response?.status === 401 && !original._retry && localStorage.getItem('refresh')) {
    original._retry = true;
    try {
      const { data } = await axios.post('http://localhost:3000/api/auth/refresh', { refresh: localStorage.getItem('refresh') });
      localStorage.setItem('access', data.access);
      if (data.refresh) localStorage.setItem('refresh', data.refresh);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch { localStorage.clear(); window.location.href = '/login'; }
  }
  return Promise.reject(err);
});
export default api;
