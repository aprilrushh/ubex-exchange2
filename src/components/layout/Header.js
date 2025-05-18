import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { authState, logout } = useAuth();
  console.log('[Header.js] 현재 authState:', authState);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">UBEX</Link>
        <nav>
          <Link to="/trade">거래</Link>
          <Link to="/portfolio">자산</Link>
          <Link to="/deposit-withdraw">입출금</Link>
        </nav>
      </div>
      <div className="header-right">
        {authState.isAuthenticated && (
          <>
            <span className="user-email">{authState.user?.email}</span>
            <button onClick={logout} className="logout-button">로그아웃</button>
          </>
        )}
        <Link to="/login" className="login-button">로그인</Link>
        <Link to="/register" className="register-button">회원가입</Link>
      </div>
    </header>
  );
};

export default Header; 