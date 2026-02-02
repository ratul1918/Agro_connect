import axios from 'axios';

// Prioritize VITE_ env var but fallback for compatibility if needed
const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log authentication errors but avoid auto-redirect loop for now
        if (error.response && error.response.status === 401) {
            console.error('Authentication error (401):', error.config.url);
            // We are temporarily disabling auto-logout to debug a potential race condition
            // where valid logins are being invalidated immediately.

            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // if (!window.location.pathname.includes('/auth')) {
            //     window.location.href = '/auth?tab=login';
            // }
        }
        return Promise.reject(error);
    }
);

export { BASE_URL, API_URL };
export default api;
