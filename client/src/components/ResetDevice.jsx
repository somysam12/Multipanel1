import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { WrenchIcon, UserIcon, LockIcon, LockOpenIcon } from './Icons';

const API_URL = '/api';

function ResetDevice() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const loginResponse = await axios.post(`${API_URL}/login`, { username, password });
      const token = loginResponse.data.token;

      const resetResponse = await axios.post(
        `${API_URL}/user/reset-ip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Device reset successful! You can now login from a new device. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data?.nextResetAt) {
        const nextReset = new Date(err.response.data.nextResetAt).toLocaleString();
        setError(`${err.response.data.message || 'Cannot reset device yet'} - Next reset allowed at: ${nextReset}`);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LockOpenIcon size={48} />
          </div>
          <h1>Reset Device Lock</h1>
          <p>Enter your credentials to reset your device lock</p>
          <div className="auth-info">
            <p>⏰ You can reset your device once every 24 hours</p>
            <p>🔒 This will allow you to login from a new device</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <UserIcon size={20} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <LockIcon size={20} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Resetting Device Lock...' : 'Reset Device Lock'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>

      <style>{`
        .auth-info {
          margin-top: 15px;
          padding: 15px;
          background: #f0f7ff;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .auth-info p {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #28a745;
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lockopen-icon {
          color: #667eea;
        }
      `}</style>
    </div>
  );
}

export default ResetDevice;
