import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Login component
 * @param {Object} props
 * @param {function(boolean): void} props.setShowLogin - Function to show/hide login popup
 */
function Login({ setShowLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        setShowLogin(false);
        navigate('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setShowLogin(false);
        
        // Check for admin credentials and redirect to admin dashboard
        if (email === import.meta.env.VITE_ADMIN_EMAIL && password === import.meta.env.VITE_ADMIN_PASSWORD) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        // Map Firebase error codes to user-friendly messages
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/user-not-found':
            setError('Email not found');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password');
            break;
          default:
            setError('Wrong credentials');
        }
      } else {
        setError('An error occurred');
      }
    }
  };

  return (
      <div className="login-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-container" onClick={(e) => e.stopPropagation()}>
      <div className="form-header">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <button className="close-button" onClick={() => {
          setShowLogin(false);
          navigate('/');
        }}>
          ×
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <div className="input-with-icon">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="input-with-icon">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        <p className="toggle-form" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : 'Need a user account? Register'}
        </p>
      </form>
        </div>
    </div>
  );
}

export default Login;