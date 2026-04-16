import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Route guard - ensures users can only access pages for their role
export function ProtectedRoute({ 
  children,
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: string;
}) {
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to correct dashboard if accessing wrong role's page
  if (user?.role !== allowedRole) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'scheduler') return <Navigate to="/scheduler" replace />;
    if (user?.role === 'bank') return <Navigate to="/bank" replace />;
    if (user?.role === 'engineer') return <Navigate to="/engineer" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}