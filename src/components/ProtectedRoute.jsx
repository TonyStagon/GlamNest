import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin (email matches admin email)
  if (user.email !== "tutarthurs@gmail.com") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;