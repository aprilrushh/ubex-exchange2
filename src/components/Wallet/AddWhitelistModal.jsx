import React, { useState } from 'react';
import { addWhitelistAddress } from '../../services/WalletService';
import './Wallet.css';

// 기본 코인 옵션(Phase 1 하드코딩)
const coinOptions = [
  { symbol: 'ETH', label: 'Ethereum (ETH)' },
  { symbol: 'BTC', label: 'Bitcoin (BTC)' },
  { symbol: 'USDT', label: 'Tether (USDT)' },
  { symbol: 'USDC', label: 'USD Coin (USDC)' }
];

const AddWhitelistModal = ({ coin, onClose, onSuccess }) => {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('화이트리스트 주소 추가 시도:', { coin, address, label });
      const response = await addWhitelistAddress({ coin, address, label });
      console.log('화이트리스트 주소 추가 응답:', response);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || '주소 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('화이트리스트 주소 추가 실패:', error);
      setError('주소 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>화이트리스트 주소 추가</h3>
        {error && <div className="wallet-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>코인</label>
            <input type="text" value={coin} disabled />
          </div>
          <div className="form-group">
            <label>라벨</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="주소에 대한 설명을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="지갑 주소를 입력하세요"
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWhitelistModal;
