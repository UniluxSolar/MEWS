import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from '../api';

const ProtectedRoute = ({ allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Check if we have an active session via cookie
                const { data } = await axios.get('/auth/me');
                setIsAuthenticated(true);
                setUserRole(data.role);
            } catch (error) {
                console.warn('Session verification failed:', error);
                setIsAuthenticated(false);
                setUserRole(null);
                // Clear any leftover local storage
                localStorage.removeItem('adminInfo');
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to appropriate login based on attempted path?
        // For now default to standard login, user can navigate from there.
        // Or if path contains /admin, go to /admin/login
        let loginPath = '/login';
        if (location.pathname.startsWith('/admin')) loginPath = '/admin/login';
        if (location.pathname.startsWith('/institution')) loginPath = '/institution/login';

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // RBAC Check
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // User is logged in but doesn't have permission
        // Redirect to their appropriate dashboard or home
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/dashboard/profile" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
