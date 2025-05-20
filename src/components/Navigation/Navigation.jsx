import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
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
      <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        로그인
      </NavLink>
    </nav>
  );
};

export default Navigation;
