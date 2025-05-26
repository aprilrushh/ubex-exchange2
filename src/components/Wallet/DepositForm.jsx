// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress, setDepositAddress, getBalance } from '../../services/WalletService';
import './Wallet.css';

const DepositForm = ({ coin, currency }) => {
  const coinSymbol = coin || currency;
  const [address, setAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchDepositAddress = async () => {
      try {
        setLoading(true);
        setError(null);
        const depositAddress = await getDepositAddress(coinSymbol);
        setAddress(depositAddress);
        const currentBalance = await getBalance(coinSymbol);
        setBalance(currentBalance);
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
  }, [coinSymbol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(false);
      await setDepositAddress(coinSymbol, { address: inputAddress });
      setAddress(inputAddress);
      setInputAddress('');
      setSuccess(true);
    } catch (error) {
      console.error('입금주소 설정 실패', error);
      if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
        setError('입금 주소 설정에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  if (error) {
    return <div className="wallet-error">{error}</div>;
  }

  return (
    <div className="deposit-form">
      <h3>{coinSymbol} 입금</h3>
      {success && <div className="wallet-success">주소가 저장되었습니다.</div>}
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
      {balance !== null && (
        <div className="deposit-balance">현재 잔액: {balance} {coinSymbol}</div>
      )}
      <form onSubmit={handleSubmit} className="form-group">
        <label>입금 주소 설정</label>
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="입금 주소를 입력하세요"
          required
        />
        <button type="submit" className="submit-button">
          저장
        </button>
      </form>
      <div className="deposit-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>입금 주소는 {coinSymbol} 전용 주소입니다.</li>
          <li>다른 코인을 입금하면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 네트워크 확인에 따라 최대 30분까지 소요될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositForm;
