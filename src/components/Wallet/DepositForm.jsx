// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';
import './Wallet.css';

const DEPOSIT_COIN = 'ETH'; // 하드코딩 상수
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

const DepositForm = () => {
  const coin = DEPOSIT_COIN;
  const [depositAddress, setDepositAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

    fetchDepositAddress();
  }, []);

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

  if (loading) {
    return (
      <div className="wallet-loading">
        <div className="loading-spinner"></div>
        <p>입금 주소를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="deposit-form">
      <div className="deposit-header">
        <h2>{coin} 입금</h2>
        <p className="deposit-subtitle">안전하고 빠른 입금 서비스를 이용하세요</p>
      </div>

      {error && (
        <div className="wallet-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {savedAddress ? (
        <div className="saved-address-section">
          <div className="address-card">
            <div className="address-header">
              <h3>등록된 입금 주소</h3>
              <span className="status-badge">활성</span>
            </div>
            <div className="address-display">
              <code className="deposit-address">{savedAddress}</code>
              <button
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={handleCopyAddress}
                title="주소 복사"
              >
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
            </div>
            <div className="qr-code-placeholder">
              <div className="qr-code">
                {/* QR 코드 이미지가 들어갈 자리 */}
                <div className="qr-placeholder">QR Code</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="address-input-section">
          <div className="input-card">
            <h3>입금 주소 설정</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="ETH 주소를 입력하세요"
                value={depositAddress}
                onChange={(e) => setDepositAddress(e.target.value)}
                className="address-input"
              />
              <button 
                onClick={handleSaveAddress}
                disabled={saving || !depositAddress}
                className={`save-button ${saving ? 'saving' : ''}`}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="deposit-info">
        <div className="info-card">
          <h3>입금 안내</h3>
          <ul className="info-list">
            <li>
              <i className="fas fa-check-circle"></i>
              <span>입금 주소는 {coin} 전용 주소입니다.</span>
            </li>
            <li>
              <i className="fas fa-exclamation-triangle"></i>
              <span>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다.</span>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>입금 후 확인까지 최대 30분이 소요될 수 있습니다.</span>
            </li>
            <li>
              <i className="fas fa-coins"></i>
              <span>최소 입금 금액은 0.01 {coin}입니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default DepositForm;
