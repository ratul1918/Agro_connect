import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileRoleNavigation from './ui/MobileRoleNavigation';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
    children, 
    allowedRoles = [] 
}) => {
    const { isAuthenticated, user, token } = useAuth();
    const location = useLocation();
    
    // Check localStorage as fallback for authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const hasStoredAuth = storedToken && storedUser;
    
    // Loading state while checking authentication
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
        // Simulate authentication check
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated && !hasStoredAuth) {
        // Store the attempted location for redirect after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    // Parse stored user if not available in context
    let userData = user;
    if (!userData && storedUser) {
        try {
            userData = JSON.parse(storedUser);
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return <Navigate to="/auth" replace />;
        }
    }
    
    // Role-based access control
    if (allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role)) {
        // Redirect to appropriate dashboard based on user role
        const getDashboardPath = (role: string) => {
            switch (role) {
                case 'ROLE_ADMIN': return '/admin';
                case 'ROLE_FARMER': return '/farmer';
                case 'ROLE_AGRONOMIST': return '/agronomist';
                case 'ROLE_GENERAL_CUSTOMER':
                case 'ROLE_CUSTOMER': return '/customer';
                case 'ROLE_BUYER': return '/buyer';
                default: return '/';
            }
        };
        
        return <Navigate to={getDashboardPath(userData.role)} replace />;
    }
    
    return (
        <>
            {children}
            {/* Show mobile navigation only on dashboard routes */}
            {userData && location.pathname.includes('/dashboard') && (
                <MobileRoleNavigation currentPath={location.pathname} />
            )}
        </>
    );
};

export default PrivateRoute;