import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to={user?.is_admin ? '/admin' : '/dashboard'} /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={token ? <Navigate to={user?.is_admin ? '/admin' : '/dashboard'} /> : <Register />} 
        />
        <Route 
          path="/admin/*" 
          element={token && user?.is_admin ? <AdminPanel user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={token && !user?.is_admin ? <UserDashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
