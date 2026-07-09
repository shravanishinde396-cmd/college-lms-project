import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ignore 401 for register/login requests
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        isRefreshing = false;
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please log in again.');
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
