import axios from 'axios';

const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: BASE_URL,
});

// Add a request interceptor to attach the JWT token
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject({ message: 'Network error. Please check your connection.' });
        }

        const { status, data } = error.response;

        // Handle 401 Unauthorized - clear token and redirect to login
        if (status === 401) {
            localStorage.removeItem('token');
            // Don't redirect if already on auth page
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth';
            }
        }

        // Extract error message from response
        const message = data?.message || data?.error || 'An error occurred';

        return Promise.reject({
            status,
            message,
            data
        });
    }
);

export { BASE_URL };
export default api;
