import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let getTokenFn: (() => Promise<string | null>) | null = null;

export function setGetToken(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
