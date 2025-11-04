import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WrenchIcon, UserIcon, LockIcon } from './Icons';

const API_URL = '/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      onLogin(response.data.token, response.data.user);
      navigate(response.data.user.is_admin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container-new">
      <div className="auth-card-new">
        <div className="auth-header-new">
          <div className="auth-icon-new">
            <WrenchIcon size={48} />
          </div>
          <h1 className="auth-title-new">MULTIHACK PANEL</h1>
          <p className="auth-subtitle-new">Sign in to your account</p>
        </div>
        
        {error && <div className="error-message-new">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form-new">
          <div className="form-section">
            <label className="form-label">
              <UserIcon size={16} style={{display: 'inline', marginRight: '6px'}} />
              Username
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-section">
            <label className="form-label">
              <LockIcon size={16} style={{display: 'inline', marginRight: '6px'}} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-primary-new" style={{marginTop: '8px'}}>
            Login
          </button>
        </form>
        
        <p className="auth-link-new">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-link-new" style={{marginTop: '10px', fontSize: '14px'}}>
          Device locked? <Link to="/reset-device" style={{color: '#e74c3c'}}>Reset Device</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
