// src/components/Wallet/WithdrawForm.jsx
import React, { useState, useEffect } from 'react';
import {
  listWhitelist,
  addWhitelist,
  deleteWhitelist,
  requestWithdrawal
} from '../../services/WalletService';
import './Wallet.css';

const WithdrawForm = ({ currency }) => {
  const [whitelist, setWhitelist] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        setLoading(true);
        setError(null);
        const addresses = await listWhitelist(currency);
        setWhitelist(addresses);
        if (addresses.length > 0) {
          setSelectedAddress(addresses[0].address);
        }
      } catch (error) {
        console.error('화이트리스트 조회 실패', error);
        if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
          setError('화이트리스트를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWhitelist();
  }, [currency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(false);
      
      if (!selectedAddress || !amount) {
        setError('모든 필드를 입력해주세요.');
        return;
      }

      const response = await requestWithdrawal({
        currency,
        address: selectedAddress,
        amount: parseFloat(amount)
      });

      if (response.success) {
        setSuccess(true);
        setAmount('');
      } else {
        setError(response.message || '출금 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('출금 요청 실패', error);
      if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
        setError('출금 요청에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  return (
    <div className="withdraw-form">
      <h3>{currency} 출금</h3>
      {error && <div className="wallet-error">{error}</div>}
      {success && (
        <div className="wallet-success">
          출금 요청이 성공적으로 제출되었습니다.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>출금 주소</label>
          <input
            type="text"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            placeholder="출금 주소를 입력하세요"
            required
          />
          {whitelist.length > 0 && (
            <select
              className="whitelist-select"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
            >
              <option value="">주소를 선택하세요</option>
              {whitelist.map((addr) => (
                <option key={addr.id} value={addr.address}>
                  {addr.label} ({addr.address})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="form-group">
          <label>출금 수량</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="출금할 수량을 입력하세요"
            step="any"
            min="0"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          출금 요청
        </button>
      </form>
      <div className="withdraw-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>출금은 화이트리스트에 등록된 주소로만 가능합니다.</li>
          <li>출금 수수료는 네트워크 상황에 따라 변동될 수 있습니다.</li>
          <li>출금 요청 후 처리까지 최대 30분이 소요될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default WithdrawForm;
