// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';
import './Wallet.css';

const DepositForm = ({ currency }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepositAddress = async () => {
      try {
        setLoading(true);
        setError(null);
        const depositAddress = await getDepositAddress(currency);
        setAddress(depositAddress);
      } catch (error) {
        console.error('입금주소 조회 실패', error);
        if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
          setError('입금 주소를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDepositAddress();
  }, [currency]);

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  if (error) {
    return <div className="wallet-error">{error}</div>;
  }

  return (
    <div className="deposit-form">
      <h3>{currency} 입금</h3>
      <div className="deposit-address">
        <p>입금 주소:</p>
        <div className="address-container">
          <code>{address}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(address);
              alert('주소가 클립보드에 복사되었습니다.');
            }}
          >
            복사
          </button>
        </div>
      </div>
      <div className="deposit-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>입금 주소는 {currency} 전용 주소입니다.</li>
          <li>다른 코인을 입금하면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 네트워크 확인에 따라 최대 30분까지 소요될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositForm;
