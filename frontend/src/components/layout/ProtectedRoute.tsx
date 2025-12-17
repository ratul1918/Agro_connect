import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard or unauthorized page
        if (user.role === 'FARMER') return <Navigate to="/farmer" replace />;
        if (user.role === 'BUYER') return <Navigate to="/buyer" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />; // Fallback
    }

    return <>{children}</>;
};

export default ProtectedRoute;
