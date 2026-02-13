import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/endpoints';

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    profileImageUrl?: string;
    phone?: string;
    division?: string;
    district?: string;
    upazila?: string;
    thana?: string;
    postCode?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development logging utility
const isDev = import.meta.env.DEV;
const log = {
    info: (msg: string, data?: any) => isDev && console.log(msg, data),
    warn: (msg: string, data?: any) => isDev && console.warn(msg, data),
    error: (msg: string, data?: any) => isDev && console.error(msg, data),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        log.info('🔄 REFRESH USER - Token in storage:', !!storedToken ? `${storedToken.substring(0, 20)}...` : 'NONE');
        if (storedToken) {
            try {
                log.info('🔄 Calling getCurrentUser() with token...');
                const response = await getCurrentUser();
                const userData = response.data;
                log.info('✅ Refreshed user data:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error: any) {
                log.error('❌ Failed to refresh user:', error);
                log.error('❌ Error details:', {
                    status: error.response?.status,
                    message: error.message,
                    headers: error.config?.headers
                });

                // Don't auto-logout - keep cached data
                log.warn('Using cached user data due to refresh failure');
            } finally {
                setIsLoading(false);
            }
        } else {
            log.warn('⚠️ No token in storage, skipping refresh');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            // Load cached user immediately to prevent flash of unauthenticated state
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    log.error('Failed to parse cached user', e);
                }
            }

            // Then refresh from server if we have a token
            if (storedToken) {
                // Ensure lastActivity is set if token exists but lastActivity doesn't
                // This prevents false timeout on first load after login
                if (!localStorage.getItem('lastActivity')) {
                    localStorage.setItem('lastActivity', Date.now().toString());
                }
                await refreshUser();
            } else {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (newToken: string, userData: User) => {
        log.info('🔐 LOGIN - Storing token:', newToken.substring(0, 20) + '...');
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        // Set login time for timeout calculation
        localStorage.setItem('lastActivity', Date.now().toString());
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        log.info('✅ Token stored successfully:', !!storedToken);
        log.info('🔍 Token in state before set:', token);
        
        setToken(newToken);
        setUser(userData);
        
        log.info('🔍 Token in state after set:', newToken);

        // Enhanced redirect based on role with mobile considerations
        const getRoleBasedPath = (role: string) => {
            switch (role) {
                case 'ROLE_ADMIN': return '/admin/overview';
                case 'ROLE_FARMER': return '/farmer/overview';
                case 'ROLE_AGRONOMIST': return '/agronomist/overview';
                case 'ROLE_BUYER': return '/buyer/overview';
                case 'ROLE_GENERAL_CUSTOMER':
                case 'ROLE_CUSTOMER': return '/marketplace/retail';
                default: return '/marketplace/retail';
            }
        };

        const targetPath = getRoleBasedPath(userData.role);
        log.info(`Loggin in as ${userData.role}, redirecting to: ${targetPath}`);

        navigate(targetPath);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        setToken(null);
        setUser(null);
        navigate('/'); // Redirect to home page
    };

    // Session Timeout Logic (24 hours to match backend JWT expiry)
    useEffect(() => {
        const TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
        const isAuthenticated = !!token;

        const checkActivity = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity && isAuthenticated) {
                const now = Date.now();
                if (now - parseInt(lastActivity) > TIMEOUT_MS) {
                    console.warn('Session expired due to inactivity');
                    logout();
                }
            }
        };

        const updateActivity = () => {
            if (isAuthenticated) {
                localStorage.setItem('lastActivity', Date.now().toString());
            }
        };

        // Check on mount (refresh)
        checkActivity();

        // Check continuously
        const interval = setInterval(checkActivity, 60000); // Check every minute

        // Listen for user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, updateActivity));

        return () => {
            clearInterval(interval);
            events.forEach(event => window.removeEventListener(event, updateActivity));
        };
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
