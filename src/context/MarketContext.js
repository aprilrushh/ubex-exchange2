import { createContext, useState, useEffect } from 'react';
import { fetchCoinList, fetchPrice } from '../services/api';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [priceData, setPriceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 코인 목록 로드
  useEffect(() => {
    const loadCoins = async () => {
      try {
        setIsLoading(true);
        // 실제 API 연동 전까지는 샘플 데이터 사용
        // const data = await fetchCoinList();
        const data = getSampleCoinData();
        setCoins(data);
        setIsLoading(false);
      } catch (err) {
        console.error('코인 목록 로딩 오류:', err);
        setError('코인 목록을 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };
    
    loadCoins();
    const interval = setInterval(loadCoins, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);
  
  // 선택된 코인 가격 데이터 로드
  useEffect(() => {
    if (!selectedCoin) return;
    
    const loadPrice = async () => {
      try {
        // 실제 API 연동 전까지는 샘플 데이터 사용
        // const data = await fetchPrice(selectedCoin.symbol);
        const data = getSamplePriceData(selectedCoin.symbol);
        setPriceData(prev => ({ ...prev, [selectedCoin.symbol]: data }));
      } catch (err) {
        console.error('가격 데이터 로딩 오류:', err);
      }
    };
    
    loadPrice();
    const interval = setInterval(loadPrice, 3000); // 3초마다 갱신
    return () => clearInterval(interval);
  }, [selectedCoin]);
  
  // 샘플 코인 데이터 생성 함수 (실제 API 연동 전까지)
  const getSampleCoinData = () => {
    return [
      {
        symbol: 'BTC',
        name: '비트코인',
        price: 136881000,
        change: -0.38,
        volume: 200979,
      },
      {
        symbol: 'ETH',
        name: '이더리움',
        price: 2577000,
        change: -0.15,
        volume: 69997,
      },
      {
        symbol: 'XRP',
        name: '리플',
        price: 3011,
        change: -1.50,
        volume: 205560,
      },
      {
        symbol: 'LAYER',
        name: '슬레이어',
        price: 2629,
        change: 5.62,
        volume: 532131,
      },
      {
        symbol: 'KAITO',
        name: '카이토',
        price: 1904,
        change: 38.67,
        volume: 204973,
      },
      {
        symbol: 'STPT',
        name: '에스티피',
        price: 111.6,
        change: 21.16,
        volume: 142637,
      },
      {
        symbol: 'MOVE',
        name: '무브먼트',
        price: 227.3,
        change: 0.26,
        volume: 103645,
      },
      {
        symbol: 'USDT',
        name: '테더',
        price: 1415.0,
        change: -0.32,
        volume: 79739,
      },
    ];
  };
  
  // 샘플 가격 데이터 생성 함수
  const getSamplePriceData = (symbol) => {
    const coin = coins.find(c => c.symbol === symbol);
    if (!coin) return {};
    
    // 약간의 변동성 추가
    const volatility = 0.002; // 0.2%
    const changePercent = (Math.random() * 2 - 1) * volatility;
    const newPrice = Math.round(coin.price * (1 + changePercent));
    
    return {
      current: newPrice,
      change: coin.change + changePercent * 100,
      high: Math.round(newPrice * 1.01),
      low: Math.round(newPrice * 0.99),
      volume: coin.volume,
      kraken: Math.round(newPrice * 0.995), // 해외거래소 가격 약간 다르게
    };
  };
  
  return (
    <MarketContext.Provider value={{ 
      coins, 
      selectedCoin, 
      setSelectedCoin, 
      priceData,
      isLoading,
      error 
    }}>
      {children}
    </MarketContext.Provider>
  );
};
