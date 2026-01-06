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
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();
    
    // Show loading spinner while AuthContext is validating the token
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
    
    // After loading is complete, check authentication
    if (!isAuthenticated) {
        // Store the attempted location for redirect after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    
    // Role-based access control
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
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
        
        return <Navigate to={getDashboardPath(user.role)} replace />;
    }
    
    return (
        <>
            {children}
            {/* Show mobile navigation only on dashboard routes */}
            {user && location.pathname.includes('/dashboard') && (
                <MobileRoleNavigation currentPath={location.pathname} />
            )}
        </>
    );
};

export default PrivateRoute;