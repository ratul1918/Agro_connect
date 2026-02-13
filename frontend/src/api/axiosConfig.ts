import axios from 'axios';

// Prioritize VITE_ env var but fallback for compatibility if needed
const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const BASE_URL = API_URL.replace('/api', '');

// Only log in development mode
const isDev = (import.meta as any).env.DEV;
const log = {
    info: (msg: string, ...data: any[]) => isDev && console.log(msg, ...data),
    warn: (msg: string, ...data: any[]) => isDev && console.warn(msg, ...data),
    error: (msg: string, ...data: any[]) => isDev && console.error(msg, ...data),
};

const api = axios.create({
    baseURL: API_URL,
    headers: {},
    withCredentials: false, // JWT tokens in Authorization header, not cookies
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        log.info('🔍 [AXIOS INTERCEPTOR] Token check:', token ? `Found: ${token.substring(0, 20)}...` : 'NOT FOUND');
        log.info('🔍 [AXIOS INTERCEPTOR] Request:', config.method?.toUpperCase(), config.url);
        
        // Don't set Content-Type header if sending FormData - let axios handle it
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        if (token && token.trim()) {
            const bearerToken = `Bearer ${token}`;
            // Set authorization header directly on config.headers
            config.headers.Authorization = bearerToken;
            log.info('✅ [AXIOS INTERCEPTOR] Authorization header set');
        } else {
            log.warn('⚠️ [AXIOS INTERCEPTOR] No valid token found in localStorage');
            // Delete any existing Authorization header if no token
            delete config.headers.Authorization;
        }
        
        return config;
    },
    (error) => {
        log.error('❌ [AXIOS INTERCEPTOR ERROR]:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors gracefully
api.interceptors.response.use(
    (response) => {
        log.info('✅ [AXIOS RESPONSE] Success:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.message || error.message;
            
            log.error('❌ [AXIOS RESPONSE] Error:', {
                status,
                method: error.config.method?.toUpperCase(),
                url: error.config.url,
                hasAuthHeader: !!error.config.headers.Authorization,
                errorMessage,
            });
            
            // Handle specific status codes
            if (status === 401) {
                log.warn('⚠️ [AXIOS RESPONSE] 401 Unauthorized - Token invalid or expired');
                // Only clear tokens if the request had an auth header (avoid clearing on public endpoint 401s)
                // The AuthContext will handle logout logic
            } else if (status === 404) {
                log.error('❌ [AXIOS RESPONSE] 404 Not Found - Resource does not exist');
                // Add custom error message for 404s
                error.response.data.friendlyMessage = 'The requested resource was not found.';
            } else if (status === 500) {
                log.error('❌ [AXIOS RESPONSE] 500 Server Error - Contact support');
                error.response.data.friendlyMessage = 'Server error occurred. Please try again later.';
            } else if (status >= 400 && status < 500) {
                log.error('❌ [AXIOS RESPONSE] Client Error:', status);
                error.response.data.friendlyMessage = errorMessage || `Request failed with status ${status}`;
            }
        } else if (error.request) {
            log.error('❌ [AXIOS RESPONSE] No response received:', error.message);
            log.error('❌ [AXIOS RESPONSE] Network error - Check backend connection');
        } else {
            log.error('❌ [AXIOS RESPONSE] Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export { BASE_URL, API_URL };
export default api;
