import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WithdrawForm from '../Wallet/WithdrawForm.jsx';
import DepositForm from '../Wallet/DepositForm.jsx';
import Tabs from '../common/Tabs';
import Button from '../common/Button';
import './DepositWithdrawPage.css';

const DepositWithdrawPage = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState(null);
  const { authState } = useAuth();

  const availableCoins = [
    { symbol: 'BTC', name: '비트코인' },
    { symbol: 'ETH', name: '이더리움' },
    { symbol: 'USDT', name: '테더' },
  ];

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setSelectedCoinSymbol(null);
    }
  }, [authState.isAuthenticated]);

  const handleCoinSelection = (coinSymbol) => {
    setSelectedCoinSymbol(coinSymbol);
  };

  if (!authState.isAuthenticated) {
    return <p className="login-required">입출금 기능을 사용하려면 로그인이 필요합니다.</p>;
  }

  const tabItems = [
    { key: 'deposit', label: '입금' },
    { key: 'withdraw', label: '출금' },
  ];

  return (
    <div className="deposit-withdraw-page">
      <h2>입출금</h2>
      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(key) => { setActiveTab(key); setSelectedCoinSymbol(null); }}
      />

      <div className="coin-selection">
        <h4>코인 선택:</h4>
        {availableCoins.map(coin => (
          <Button
            key={coin.symbol}
            className={`coin-button ${selectedCoinSymbol === coin.symbol ? 'active' : ''}`}
            onClick={() => handleCoinSelection(coin.symbol)}
          >
            {coin.name} ({coin.symbol})
          </Button>
        ))}
      </div>

      {selectedCoinSymbol ? (
        <div className="form-area">
          {activeTab === 'deposit' && <DepositForm currency={selectedCoinSymbol} />}
          {activeTab === 'withdraw' && <WithdrawForm currency={selectedCoinSymbol} />}
        </div>
      ) : (
        <p className="select-coin-msg">위에서 코인을 선택해주세요.</p>
      )}
    </div>
  );
};

export default DepositWithdrawPage;
