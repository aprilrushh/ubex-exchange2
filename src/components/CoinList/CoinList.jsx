import React, { useEffect, useState } from 'react';
import webSocketServiceInstance from '../../services/websocketService';
import CoinListItem from './CoinListItem';
import './CoinList.css';

const CoinList = ({ onSelect }) => {
  const [coinTickers, setCoinTickers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    webSocketServiceInstance.connect();

    const handleTickerUpdate = (tickersArray) => {
      if (Array.isArray(tickersArray)) {
        setCoinTickers(prev => {
          const copy = { ...prev };
          tickersArray.forEach(ticker => {
            if (ticker && ticker.symbol) {
              copy[ticker.symbol] = { ...(prev[ticker.symbol] || {}), ...ticker };
            }
          });
          return copy;
        });
        if (isLoading) setIsLoading(false);
        setError('');
      }
    };

    const unsubscribe = webSocketServiceInstance.subscribe('ticker', handleTickerUpdate);

    return () => {
      unsubscribe();
    };
  }, [isLoading]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(order => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  let coins = Object.values(coinTickers);
  if (search) {
    const lc = search.toLowerCase();
    coins = coins.filter(c =>
      c.symbol.toLowerCase().includes(lc) ||
      (c.name && c.name.toLowerCase().includes(lc))
    );
  }

  coins.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'symbol' || typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }
    aVal = Number(aVal);
    bVal = Number(bVal);
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  if (isLoading && coins.length === 0) {
    return <div className="coin-list-loading">Loading...</div>;
  }

  if (error) {
    return <div className="coin-list-error">{error}</div>;
  }

  return (
    <div className="coin-list">
      <div className="coin-list-header">
        <input
          className="search-input"
          placeholder="코인 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="coin-list-table-header">
        <div
          className={`sortable ${sortField === 'symbol' ? `sort-${sortOrder}` : ''}`}
          onClick={() => handleSort('symbol')}
        >
          코인
        </div>
        <div
          className={`sortable ${sortField === 'price' ? `sort-${sortOrder}` : ''}`}
          onClick={() => handleSort('price')}
        >
          가격
        </div>
        <div
          className={`sortable ${sortField === 'change' ? `sort-${sortOrder}` : ''}`}
          onClick={() => handleSort('change')}
        >
          변동률
        </div>
      </div>
      <div className="coin-list-body">
        {coins.map((coin) => (
          <CoinListItem key={coin.symbol} coin={coin} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default CoinList;
