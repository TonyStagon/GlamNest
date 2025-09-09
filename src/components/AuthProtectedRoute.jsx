import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * AuthProtectedRoute component - only allows access to authenticated users
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
const AuthProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(/** @type {import('firebase/auth').User | null} */ (null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Debug logging - helps identify auth state issues
      if (typeof window !== 'undefined') {
        console.log('🔐 AuthProtectedRoute - Authentication State:', {
          hasUser: !!user,
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
          currentPath: window.location.pathname,
          isPaymentPage: window.location.pathname.includes('payment')
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // During initial loading, show a simple loading state
  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Checking authentication status...</div>
      </div>
    );
  }

  // If no user, redirect to login but maintain the intended destination
  if (!user) {
    console.log('🔐 Auth redirect - No authenticated user found, redirecting to login');
    
    // Store intended destination for post-login redirect
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('postLoginRedirect', window.location.pathname);
    }
    
    return <Navigate to="/login" replace />;
  }

  // If we have a user but email verification or other checks are needed, add them here
  return children;
};

export default AuthProtectedRoute;