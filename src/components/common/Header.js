// src/components/common/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  // console.log('[Header.js] 현재 authState:', authState); // 디버깅 필요시 주석 해제

  const isAuthenticated = authState && authState.isAuthenticated ? authState.isAuthenticated : false;
  const userEmail = authState && authState.user && authState.user.email ? authState.user.email : '';
  const userName = authState && authState.user && authState.user.username ? authState.user.username : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">UBEX</Link>
      </div>

      <nav className="nav-menu">
        <ul>
          <li><Link to="/">거래소</Link></li>
          <li><Link to="/wallet">입출금</Link></li>
          <li><Link to="/portfolio">투자내역</Link></li>
          {isAuthenticated ? (
            <>
              <li><span>{userName || userEmail}님</span></li>
              <li><button onClick={handleLogout} className="logout-button" style={{background:'none', border:'none', padding:'0', cursor:'pointer', color:'inherit', fontFamily:'inherit', fontSize:'inherit'}}>로그아웃</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">로그인</Link></li>
              <li><Link to="/register">회원가입</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
