import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, hasAdminAccess, isAdmin } = useAuth();

  // If no user is logged in, redirect to admin login
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // If route requires admin and user is not admin, show 403
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/access-denied" replace />;
  }

  // If route requires admin or subadmin access and user doesn't have it, show 403
  if (!requireAdmin && !hasAdminAccess()) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
