import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketContext } from '../context/MarketContext';
import Header from '../components/common/Header';
import CoinItem from '../components/CoinList/CoinItem';
import './CoinListPage.css';

const CoinListPage = () => {
  const { coins, isLoading, error, setSelectedCoin } = useContext(MarketContext);
  const [activeMarket, setActiveMarket] = useState('KRW');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // 필터링된 코인 목록
  const filteredCoins = coins.filter(coin => {
    const matchesSearch = 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 현재는 모든 코인이 KRW 마켓에 있다고 가정
    const matchesMarket = activeMarket === 'KRW';
    
    return matchesSearch && matchesMarket;
  });
  
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    navigate(`/trade/${coin.symbol}`);
  };
  
  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }
  
  if (error) {
    return <div className="error">오류: {error}</div>;
  }
  
  return (
    <div className="coin-list-page">
      <Header />
      
      <div className="container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="코인명/심볼 검색" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="market-tabs">
          <div 
            className={`market-tab ${activeMarket === 'KRW' ? 'active' : ''}`}
            onClick={() => setActiveMarket('KRW')}
          >
            KRW
          </div>
          <div 
            className={`market-tab ${activeMarket === 'BTC' ? 'active' : ''}`}
            onClick={() => setActiveMarket('BTC')}
          >
            BTC
          </div>
          <div 
            className={`market-tab ${activeMarket === 'USDT' ? 'active' : ''}`}
            onClick={() => setActiveMarket('USDT')}
          >
            USDT
          </div>
        </div>
        
        <table className="coin-table">
          <thead>
            <tr>
              <th>한글명</th>
              <th>현재가</th>
              <th>전일대비</th>
              <th>거래대금</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoins.map(coin => (
              <CoinItem 
                key={coin.symbol} 
                coin={coin} 
                onClick={() => handleCoinSelect(coin)} 
              />
            ))}
            
            {filteredCoins.length === 0 && (
              <tr>
                <td colSpan="4" className="no-coins">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinListPage;
