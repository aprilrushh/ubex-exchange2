// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';
import './Wallet.css';

const DEPOSIT_COIN = 'ETH'; // 하드코딩 상수

const DepositForm = () => {
  const coin = DEPOSIT_COIN;
  const [depositAddress, setDepositAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDepositAddress = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 입금 주소 조회 시작:', coin);
        const response = await getDepositAddress(coin);
        console.log('📋 조회된 입금 주소:', response);
        
        // 응답이 문자열인 경우 직접 사용
        if (typeof response === 'string') {
          setDepositAddress(response);
        }
        // 응답이 객체이고 success가 true인 경우
        else if (response && response.success) {
          setDepositAddress(response.data.address);
        }
        // 응답이 객체이고 address가 직접 있는 경우
        else if (response && response.address) {
          setDepositAddress(response.address);
        }
        else {
          setError('입금 주소를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('❌ 입금 주소 조회 실패', error);
        if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
          setError('입금 주소를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDepositAddress();
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  return (
    <div className="deposit-form">
      <h3>{coin} 입금</h3>
      {error && <div className="wallet-error">{error}</div>}
      <div className="deposit-address-container">
        <p className="deposit-address-label">입금 주소:</p>
        <div className="deposit-address-box">
          <code className="deposit-address">{depositAddress}</code>
          <button
            className="copy-button"
            onClick={handleCopyAddress}
            title="주소 복사"
          >
            {copied ? '✓ 복사됨' : '📋 복사'}
          </button>
        </div>
      </div>

      <div className="deposit-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>입금 주소는 {coin} 전용 주소입니다.</li>
          <li>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 확인까지 최대 30분이 소요될 수 있습니다.</li>
          <li>최소 입금 금액은 0.01 {coin}입니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositForm;
