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

        // Handle 401 Unauthorized - temporarily disable auto-redirect to debug issue
        if (status === 401) {
            console.warn('401 error received, but auto-redirect is disabled for debugging:', {
                url: error.config?.url,
                message: data?.message || data?.error,
                pathname: window.location.pathname
            });
            
            // Only clear tokens for explicit auth failures
            // Exclude /auth/me and /auth/profile from triggering logout to avoid loops if profile fetch fails
            const isExplicitAuthFailure = (error.config?.url?.includes('/auth/') && 
                                          !error.config?.url?.includes('/me') && 
                                          !error.config?.url?.includes('/profile')) || 
                                         error.config?.url?.includes('/login') ||
                                         data?.message?.toLowerCase().includes('invalid') ||
                                         data?.message?.toLowerCase().includes('expired');

            if (isExplicitAuthFailure) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Don't redirect if already on auth page
                if (!window.location.pathname.includes('/auth')) {
                    // Use setTimeout to avoid redirect loops during component initialization
                    setTimeout(() => {
                        if (!window.location.pathname.includes('/auth')) {
                            window.location.href = '/auth';
                        }
                    }, 100);
                }
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
