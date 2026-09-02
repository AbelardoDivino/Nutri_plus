import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3000/api', timeout: 8000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // otimiza: evita cache Google
  if (config.url?.includes('/auth/google')) config.timeout = 6000;
  return config;
});
// Rate limit + retry com backoff
api.interceptors.response.use(res => res, async err => {
  const original = err.config;
  const status = err.response?.status;
  // 429 rate limit: espera Retry-After e tenta 1x
  if (status === 429 && !original._retry429) {
    original._retry429 = true;
    const wait = Number(err.response.headers['retry-after'] || 1) * 1000;
    await new Promise(r => setTimeout(r, Math.min(wait, 2000)));
    return api(original);
  }
  // 401 refresh
  if (status === 401 && !original._retry && localStorage.getItem('refresh')) {
    original._retry = true;
    try {
      const { data } = await axios.post('http://localhost:3000/api/auth/refresh', { refresh: localStorage.getItem('refresh') });
      localStorage.setItem('access', data.access);
      if (data.refresh) localStorage.setItem('refresh', data.refresh);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch { localStorage.clear(); window.location.href = '/login'; }
  }
  // mensagem amigável para limites
  if (status === 429) err.message = 'Muitas requisições — aguarde 1s e tente novamente';
  if (!err.response && err.code === 'ECONNABORTED') err.message = 'Tempo esgotado — verifique sua conexão';
  return Promise.reject(err);
});
export default api;
