import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Navigation from '../Navigation/Navigation';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`top-nav ${theme}`}>
      <div className="user-actions">
        <Link to="/" className="logo">
          <img src="/images/ubex-logo.svg" alt="UBEX" className="logo-image" />
        </Link>
        <Navigation />
      </div>
      <div className="language-selector">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Header;
