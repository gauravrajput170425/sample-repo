import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { authState } = useAuth();
  
  // If still loading, show nothing (or loading indicator)
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 