import React, { useEffect, useState, useRef } from 'react';
import { fetchTickerList, connectWebSocket } from '../services/MarketService';
import './MarketSidebar.css';

const MarketSidebar = () => {
  const [tickers, setTickers] = useState([]);
  const [search, setSearch] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchTickerList().then(data => {
      if (mounted) setTickers(data);
      // 실시간 구독
      const symbols = data.map(t => t.symbol);
      wsRef.current = connectWebSocket(symbols, (msg) => {
        if (msg.type === 'ticker') {
          setTickers(prev => prev.map(t => t.symbol === msg.symbol ? { ...t, ...msg } : t));
        }
      });
    });
    return () => {
      mounted = false;
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const filtered = tickers.filter(t =>
    t.name.includes(search) || t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="market-sidebar">
      <div className="sidebar-header">
        <input
          className="search-input"
          placeholder="코인/심볼 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="sidebar-table-wrap">
        <table className="sidebar-table">
          <thead>
            <tr>
              <th>한글명</th>
              <th>현재가</th>
              <th>전일대비</th>
              <th>거래대금</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ticker => (
              <tr key={ticker.symbol}>
                <td className="coin-name">
                  <span className="symbol">{ticker.symbol}</span> {ticker.name}
                </td>
                <td className="price">{ticker.price?.toLocaleString() || '-'}</td>
                <td className={ticker.change >= 0 ? 'up' : 'down'}>
                  {ticker.change >= 0 ? '+' : ''}{ticker.change?.toFixed(2) || '0.00'}%
                </td>
                <td>{ticker.volume?.toLocaleString() || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
};

export default MarketSidebar; 