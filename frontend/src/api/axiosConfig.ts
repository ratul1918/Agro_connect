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

export { BASE_URL, API_URL };
export default api;
