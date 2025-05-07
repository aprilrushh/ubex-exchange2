import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MarketContext } from '../../context/MarketContext';
import './Header.css';

const Header = () => {
  const { selectedCoin } = useContext(MarketContext);
  const navigate = useNavigate();
  
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">UBEX</Link>
      </div>
      
      <nav className="nav-menu">
        <ul>
          <li><Link to="/">거래소</Link></li>
          <li><Link to="/balance">입출금</Link></li>
          <li><Link to="/portfolio">투자내역</Link></li>
          <li><Link to="/info">코인정보</Link></li>
          <li><Link to="/support">고객센터</Link></li>
        </ul>
      </nav>
      
      {selectedCoin && (
        <div className="coin-quick-info">
          <div className="coin-icon"></div>
          <span className="coin-name">{selectedCoin.name}</span>
          <span className="coin-symbol">({selectedCoin.symbol}/KRW)</span>
        </div>
      )}
    </header>
  );
};

export default Header;
