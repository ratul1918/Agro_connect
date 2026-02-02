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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const response = await getCurrentUser();
                const userData = response.data;
                console.log('Refreshed user data:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error: any) {
                console.error('Failed to refresh user:', error);
                // Clear token if it's invalid/expired (401)
                if (error.status === 401 || (error.response && error.response.status === 401)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                await refreshUser();
            } else {
                // Try to load from cache if network fails or on first rapid load
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Failed to parse cached user', e);
                    }
                }
            }
        };

        initAuth();
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

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
        console.log(`Loggin in as ${userData.role}, redirecting to: ${targetPath}`);

        navigate(targetPath);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/'); // Redirect to home page
    };

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
