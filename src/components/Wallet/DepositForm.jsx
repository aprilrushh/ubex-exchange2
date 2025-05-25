// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';
import './Wallet.css';

const DEPOSIT_COIN = 'ETH';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

const DepositForm = () => {
  const coin = DEPOSIT_COIN;
  const [depositAddress, setDepositAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState([]);

  useEffect(() => {
    fetchDepositAddress();
    fetchDepositHistory();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchDepositHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDepositAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 입금 주소 조회 시작:', coin);
      const response = await getDepositAddress(coin);
      console.log('📋 조회된 입금 주소:', response);
      
      if (typeof response === 'string') {
        setSavedAddress(response);
      } else if (response && response.success) {
        setSavedAddress(response.data.address);
      } else if (response && response.address) {
        setSavedAddress(response.address);
      } else {
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

  const fetchDepositHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposits?coin=ETH&limit=5`);
      const result = await response.json();
      
      if (result.success) {
        setDeposits(result.data);
      }
    } catch (error) {
      console.error('입금 내역 조회 오류:', error);
    }
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 사용 중인 토큰:', token ? '존재함' : '없음');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }

      if (!isValidEthAddress(depositAddress)) {
        alert('유효하지 않은 ETH 주소입니다.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposit-address/ETH`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: depositAddress })
      });
      
      console.log('📡 API 응답 상태:', response.status);
      
      if (response.status === 401) {
        console.log('❌ 인증 실패 - 토큰 갱신 시도');
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
              }
            });
            
            if (refreshResponse.ok) {
              const { token: newToken } = await refreshResponse.json();
              localStorage.setItem('token', newToken);
              console.log('✅ 토큰 갱신 성공');
              return handleSaveAddress();
            }
          } catch (refreshError) {
            console.error('💥 토큰 갱신 실패:', refreshError);
          }
        }
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ 저장 성공:', data);
        setSavedAddress(depositAddress);
        setDepositAddress('');
        alert('ETH 입금 주소가 등록되었습니다!');
      } else {
        console.log('❌ 저장 실패:', data);
        alert('저장에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('💥 API 호출 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(savedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEtherscan = (txHash) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '대기중',
      'confirmed': '확인됨',
      'completed': '완료됨'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="wallet-loading">
        <div className="loading-spinner"></div>
        <p>입금 주소를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>💰 ETH 입금</h1>
      
      {savedAddress && (
        <div className="success-alert">
          ✅ 주소가 저장되었습니다.
          <br />
          <strong>{savedAddress}</strong>
          <button 
            className={`btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyAddress}
            style={{ marginLeft: '15px', padding: '5px 10px', fontSize: '12px' }}
          >
            {copied ? '✓ 복사됨' : '📋 복사'}
          </button>
        </div>
      )}
      
      <div className="form-section">
        <h3>📍 입금 주소 설정</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="ETH 주소를 입력하세요"
            value={depositAddress}
            onChange={(e) => setDepositAddress(e.target.value)}
          />
        </div>
        <button 
          className="btn"
          onClick={handleSaveAddress}
          disabled={saving || !depositAddress}
        >
          {saving ? '저장 중...' : '💾 저장'}
        </button>
      </div>
      
      <div className="deposit-history">
        <div className="history-header">
          <h3>📊 최근 입금 내역</h3>
          <button className="refresh-btn" onClick={fetchDepositHistory}>
            🔄 새로고침
          </button>
        </div>
        
        <table className="history-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>금액</th>
              <th>상태</th>
              <th>TxHash</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">📭 입금 내역이 없습니다</td>
              </tr>
            ) : (
              deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>{new Date(deposit.created_at).toLocaleString('ko-KR')}</td>
                  <td className="amount">+{deposit.amount} {deposit.coin_symbol}</td>
                  <td>
                    <span className={`status-badge status-${deposit.status}`}>
                      {getStatusText(deposit.status)}
                    </span>
                  </td>
                  <td 
                    className="tx-hash" 
                    onClick={() => openEtherscan(deposit.tx_hash)}
                  >
                    {deposit.tx_hash.slice(0,6)}...{deposit.tx_hash.slice(-4)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <button 
          className="view-all-btn"
          onClick={() => window.location.href = '/wallet/deposit-history'}
        >
          📋 전체 입금 내역 보기
        </button>
      </div>
      
      <div className="notice">
        <h4>⚠️ 주의사항:</h4>
        <ul>
          <li>입금 주소는 ETH 전용 주소입니다.</li>
          <li>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 확인까지 최대 30분이 소요될 수 있습니다.</li>
          <li>최소 입금 금액은 0.01 ETH입니다.</li>
        </ul>
      </div>
    </div>
  );
};

const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default DepositForm;
