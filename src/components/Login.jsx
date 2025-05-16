import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login({ setShowLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        setShowLogin(false);
        navigate('/admin');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setShowLogin(false);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="login-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-container" onClick={(e) => e.stopPropagation()}>
      <h2>{isRegistering ? 'Register Admin' : 'Admin Login'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        <p className="toggle-form" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : 'Need an admin account? Register'}
        </p>
      </form>
        </div>
    </div>
  );
}

export default Login;