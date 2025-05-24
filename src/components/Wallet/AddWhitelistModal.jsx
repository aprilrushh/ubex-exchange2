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

export default function AddWhitelistModal({ coin, coins = [], onClose, onSuccess }) {
  const availableCoins = coins.length > 0 ? coins : coinOptions;
  const [formCoin, setFormCoin] = useState(coin || (availableCoins[0]?.symbol || 'ETH'));
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await addWhitelistAddress({ coin: formCoin, label, address });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('주소 등록에 실패했습니다.');
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
          {!coin && (
            <div className="form-group">
              <label>코인</label>
              <select value={formCoin} onChange={(e) => setFormCoin(e.target.value)}>
                {availableCoins.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.label || c.symbol}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>라벨</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>주소</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-button" disabled={loading}>추가</button>
            <button type="button" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}
