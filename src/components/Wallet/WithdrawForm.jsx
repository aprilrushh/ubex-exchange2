// src/components/Wallet/WithdrawForm.jsx
import React, { useState, useEffect } from 'react';
import {
  listWhitelist,
  requestWithdrawal
} from '../../services/WalletService';
import AddWhitelistModal from './AddWhitelistModal.jsx';
import './Wallet.css';

const WithdrawForm = ({ coin }) => {
  const [whitelist, setWhitelist] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('화이트리스트 조회 시작:', coin);
      const response = await listWhitelist(coin);
      console.log('조회된 화이트리스트:', response);
      if (response.success && Array.isArray(response.data)) {
        setWhitelist(response.data);
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0].address);
        } else {
          setSelectedAddress('');
        }
      } else {
        setWhitelist([]);
        setSelectedAddress('');
      }
    } catch (error) {
      console.error('화이트리스트 조회 실패', error);
      if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
        setError('화이트리스트를 불러오는데 실패했습니다.');
      }
      setWhitelist([]);
      setSelectedAddress('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhitelist();
  }, [coin]);

  const handleAddWhitelistSuccess = async () => {
    console.log('화이트리스트 주소 추가 성공, 목록 갱신 시작');
    await fetchWhitelist();
    setShowModal(false);
  };

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
        currency: coin,
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

  const handleSelect = (e) => {
    const value = e.target.value;
    if (value === 'add-new') {
      setShowModal(true);
    } else {
      setSelectedAddress(value);
    }
  };

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  return (
    <div className="withdraw-form">
      <h3>{coin} 출금</h3>
      {error && <div className="wallet-error">{error}</div>}
      {success && (
        <div className="wallet-success">
          출금 요청이 성공적으로 제출되었습니다.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>출금 주소</label>
          <select
            className="whitelist-select"
            value={selectedAddress}
            onChange={handleSelect}
          >
            <option value="">주소를 선택하세요</option>
            {whitelist.map((addr) => (
              <option key={addr.id} value={addr.address}>
                {addr.label} ({addr.address})
              </option>
            ))}
            <option value="add-new">+ 새 주소 등록</option>
          </select>
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

      <div className="registered-addresses">
        <h4>등록된 주소</h4>
        {whitelist.length > 0 ? (
          <ul className="address-list">
            {whitelist.map((addr) => (
              <li key={addr.id} className="address-item">
                <span className="address-label">{addr.label}</span>
                <span className="address-value">{addr.address}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-addresses">등록된 주소가 없습니다.</p>
        )}
      </div>

      <div className="withdraw-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>출금은 화이트리스트에 등록된 주소로만 가능합니다.</li>
          <li>출금 수수료는 네트워크 상황에 따라 변동될 수 있습니다.</li>
          <li>출금 요청 후 처리까지 최대 30분이 소요될 수 있습니다.</li>
        </ul>
      </div>
      {showModal && (
        <AddWhitelistModal
          coin={coin}
          onClose={() => setShowModal(false)}
          onSuccess={handleAddWhitelistSuccess}
        />
      )}
    </div>
  );
};

export default WithdrawForm;
