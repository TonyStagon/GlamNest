import { useState } from 'react';
import './Login.css';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form>
        {isRegistering && (
          <div className="form-group">
            <label>Name</label>
            <input type="text" required />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required />
        </div>
        {isRegistering && (
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required />
          </div>
        )}
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <p className="toggle-text">
        {isRegistering ? 'Already have an account?' : 'Need an account?'}
        <button 
          className="toggle-button" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}

export default Login;