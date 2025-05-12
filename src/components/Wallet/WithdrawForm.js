import React, { useState } from 'react';
import { requestWithdraw } from '../../services/WalletService';

const WithdrawForm = ({ asset }) => {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!toAddress || !amount || isNaN(amount) || Number(amount) <= 0) {
      setError('출금 주소와 금액을 올바르게 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      await requestWithdraw({ asset, amount, toAddress, otp });
      setSuccess('출금 요청이 완료되었습니다.');
      setToAddress(''); setAmount(''); setOtp('');
    } catch {
      setError('출금 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="withdraw-form" onSubmit={handleSubmit}>
      <h3>{asset} 출금</h3>
      <div className="form-row">
        <label>출금 주소</label>
        <input type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>출금 금액</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="any" required />
      </div>
      <div className="form-row">
        <label>OTP 코드</label>
        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6자리" maxLength={6} />
      </div>
      <button type="submit" disabled={loading}>{loading ? '처리 중...' : '출금 요청'}</button>
      {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
      {success && <div style={{color:'green', marginTop:8}}>{success}</div>}
      <div className="notice" style={{color:'#888', fontSize:'14px', marginTop:12}}>
        - 출금 전 주소와 금액을 반드시 확인하세요.<br/>
        - OTP 미입력 시 출금이 제한될 수 있습니다.
      </div>
    </form>
  );
};

export default WithdrawForm; 