import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from '../api';

const ProtectedRoute = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Check if we have an active session via cookie
                await axios.get('/auth/me');
                setIsAuthenticated(true);
            } catch (error) {
                console.warn('Session verification failed:', error);
                setIsAuthenticated(false);
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

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
