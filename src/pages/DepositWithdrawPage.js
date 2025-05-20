// src/pages/DepositWithdrawPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { getUserBalances } from '../services/PortfolioService';
import './DepositWithdrawPage.css';
import WithdrawForm from '../components/Wallet/WithdrawForm';
import DepositForm from '../components/Wallet/DepositForm'; // DepositForm import

const DepositWithdrawPage = () => {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' 또는 'withdraw'
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState(null); // 코인 심볼만 저장
  // const [balances, setBalances] = useState({}); // 전체 잔액 (필요시 사용)
  const { authState } = useAuth();

  // 사용 가능한 코인 목록 (실제로는 API에서 가져오거나 설정 파일에서 관리)
  const availableCoins = [
    { symbol: 'BTC', name: '비트코인' },
    { symbol: 'ETH', name: '이더리움' },
    { symbol: 'USDT', name: '테더' },
    // { symbol: 'KRW', name: '원화' }, // 원화 입출금은 다른 방식일 수 있음
  ];

  // 페이지 로드 시 또는 로그인 상태 변경 시 (필요하다면) 전체 잔액 불러오기
  useEffect(() => {
    if (authState.isAuthenticated) {
      const fetchInitialData = async () => {
        try {
          // const balanceData = await getUserBalances();
          // if (balanceData.success) {
          //   setBalances(balanceData.data);
          // }
          console.log('[DepositWithdrawPage] 로그인됨, 필요시 초기 데이터 로드');
        } catch (error) {
          console.error('[DepositWithdrawPage] 초기 데이터 로드 중 오류:', error);
        }
      };
      fetchInitialData();
    } else {
      // setBalances({});
      setSelectedCoinSymbol(null); // 로그아웃 시 선택된 코인 초기화
    }
  }, [authState.isAuthenticated]);


  const handleCoinSelection = (coinSymbol) => {
    setSelectedCoinSymbol(coinSymbol);
  };

  if (!authState.isAuthenticated) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>입출금 기능을 사용하려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="deposit-withdraw-page" style={{ padding: '20px', maxWidth: '700px', margin: '20px auto' }}>
      <h2>입출금</h2>
      <div className="tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', display: 'flex' }}>
        <button 
          onClick={() => { setActiveTab('deposit'); setSelectedCoinSymbol(null); }}
          style={{ padding: '10px 15px', cursor: 'pointer', border: '1px solid transparent', borderBottom: activeTab === 'deposit' ? '2px solid #007bff' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === 'deposit' ? '#007bff' : '#333', fontWeight: activeTab === 'deposit' ? 'bold' : 'normal' }}
        >
          입금
        </button>
        <button 
          onClick={() => { setActiveTab('withdraw'); setSelectedCoinSymbol(null); }}
          style={{ padding: '10px 15px', cursor: 'pointer', border: '1px solid transparent', borderBottom: activeTab === 'withdraw' ? '2px solid #007bff' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === 'withdraw' ? '#007bff' : '#333', fontWeight: activeTab === 'withdraw' ? 'bold' : 'normal', marginLeft:'10px' }}
        >
          출금
        </button>
      </div>

      <div className="coin-selection" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h4>코인 선택:</h4>
        {availableCoins.map(coin => (
          <button 
            key={coin.symbol} 
            onClick={() => handleCoinSelection(coin.symbol)}
            style={{ 
              padding: '8px 12px', 
              margin: '5px', 
              cursor: 'pointer',
              border: selectedCoinSymbol === coin.symbol ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: selectedCoinSymbol === coin.symbol ? '#e7f3ff' : 'white',
              borderRadius: '4px'
            }}
          >
            {coin.name} ({coin.symbol})
          </button>
        ))}
      </div>

      {selectedCoinSymbol ? (
        <div className="form-area">
          {activeTab === 'deposit' && <DepositForm selectedCoinSymbol={selectedCoinSymbol} />}
          {activeTab === 'withdraw' && <WithdrawForm selectedCoinSymbol={selectedCoinSymbol} />}
        </div>
      ) : <p style={{textAlign: 'center', color: '#777'}}>위에서 코인을 선택해주세요.</p>}
    </div>
  );
};

export default DepositWithdrawPage;
