import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = () => {
    const { user } = useAuth();

    return String(user?.role || '').toLowerCase() === 'admin'
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
