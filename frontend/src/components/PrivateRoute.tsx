import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, token } = useAuth();
    
    // Check localStorage as fallback for authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const hasStoredAuth = storedToken && storedUser;
    
    // Debug logging
    console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
    console.log('PrivateRoute - user:', user);
    console.log('PrivateRoute - token:', !!token);
    console.log('PrivateRoute - storedToken:', !!storedToken);
    console.log('PrivateRoute - storedUser:', !!storedUser);
    console.log('PrivateRoute - current path:', window.location.pathname);
    
    if (!isAuthenticated && !hasStoredAuth) {
        console.log('PrivateRoute - Redirecting to /auth');
        return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
};

export default PrivateRoute;
