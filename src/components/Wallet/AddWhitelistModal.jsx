import React, { useState } from 'react';
import { addWhitelistAddress } from '../../services/WalletService';
import './Wallet.css';

export default function AddWhitelistModal({ coin, coins = [], onClose, onSuccess }) {
  const [formCoin, setFormCoin] = useState(coin || (coins[0]?.symbol || ''));
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
                {coins.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol}
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
