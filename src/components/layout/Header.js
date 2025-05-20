import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`header ${theme}`}>
      <div className="header-left">
        <Link to="/" className="logo">
          UBEX Exchange
        </Link>
      </div>
      <div className="header-right">
        {authState.isAuthenticated ? (
          <>
            <span className="user-info">
              Welcome, {authState.user?.username}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="register-button">
              Register
            </Link>
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header; 