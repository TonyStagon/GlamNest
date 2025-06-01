import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

/**
 * ProtectedRoute component - only allows access to admin users
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin (email matches admin email)
  if (!user.email || user.email.toLowerCase() !== import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;