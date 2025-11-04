import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WrenchIcon, UserIcon, LockIcon, GiftIcon } from './Icons';

const API_URL = '/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/register`, { 
        username, 
        password, 
        referralCode 
      });
      setSuccess(`Account created! Starting balance: ₹${response.data.balance}`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <p className="auth-subtitle-new">Create your account</p>
        </div>
        
        {error && <div className="error-message-new">{error}</div>}
        {success && <div className="success-message-new">{success}</div>}
        
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
              placeholder="Choose a username"
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
              placeholder="Choose a password"
              required
            />
          </div>
          <div className="form-section">
            <label className="form-label">
              <GiftIcon size={16} style={{display: 'inline', marginRight: '6px'}} />
              Referral Code (Required)
            </label>
            <input
              type="text"
              className="form-input"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              required
            />
            <small className="form-hint">You need a referral code to register</small>
          </div>
          <button type="submit" className="btn-primary-new" style={{marginTop: '8px'}}>
            Register
          </button>
        </form>
        
        <p className="auth-link-new">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
