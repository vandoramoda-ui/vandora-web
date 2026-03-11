import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireStaff?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireStaff = false
}) => {
    const { user, profile, loading, isStaff } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-vandora-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vandora-emerald"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save current location
        return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
    }

    if (requireStaff && !isStaff) {
        console.warn('ProtectedRoute: Access denied (Staff required). Current role:', profile?.role || 'none');
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && profile) {
        const normalizedRole = profile.role.toLowerCase().trim();
        if (!allowedRoles.map(r => r.toLowerCase().trim()).includes(normalizedRole)) {
            console.warn('ProtectedRoute: Access denied (Role not allowed). Current role:', profile.role);
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
