import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="main-nav">
      <NavLink end to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        거래소
      </NavLink>
      <NavLink to="/wallet" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        입출금
      </NavLink>
      <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        투자내역
      </NavLink>
      {authState?.isAuthenticated ? (
        <>
          <span className="nav-item user-info">
            {authState.user?.username || authState.user?.email}님
          </span>
          <button onClick={handleLogout} className="nav-item logout-button">
            로그아웃
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            로그인
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            회원가입
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default Navigation;
