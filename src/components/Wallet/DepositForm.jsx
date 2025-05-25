// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './Wallet.css';

const DEPOSIT_COIN = 'ETH';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

const DepositForm = () => {
  const coin = DEPOSIT_COIN;
  
  // 🎯 상태 관리
  const [depositAddress, setDepositAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState([]);
  
  // 🎯 UI 상태
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // 🎯 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchDepositAddress();
    fetchDepositHistory();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchDepositHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🎯 입금 주소 조회
  const fetchDepositAddress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 입금 주소 조회 시작:', coin);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposit-address/${coin}`);
      const result = await response.json();
      
      console.log('📋 조회된 입금 주소:', result);
      
      if (result.success && result.data && result.data.address) {
        setSavedAddress(result.data.address);
        setMessage('');
      } else {
        setSavedAddress('');
        setMessage(result.message || '입금 주소가 설정되지 않았습니다');
        setMessageType('info');
      }
    } catch (error) {
      console.error('❌ 입금 주소 조회 실패', error);
      setError('입금 주소를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [coin]);

  // 🎯 입금 내역 조회
  const fetchDepositHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposits?coin=ETH&limit=3`);
      const result = await response.json();
      
      if (result.success) {
        setDeposits(result.data || []);
      }
    } catch (error) {
      console.error('입금 내역 조회 오류:', error);
    }
  }, []);

  // 🎯 주소 저장
  const handleSaveAddress = async () => {
    if (!depositAddress.trim()) {
      showMessage('주소를 입력해주세요', 'warning');
      return;
    }

    if (!isValidEthAddress(depositAddress)) {
      showMessage('유효하지 않은 ETH 주소입니다', 'warning');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposit-address/${coin}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ address: depositAddress })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ 저장 성공:', data);
        setSavedAddress(depositAddress);
        setDepositAddress('');
        setShowAddressForm(false);
        showMessage('입금 주소가 성공적으로 저장되었습니다!', 'success');
      } else {
        console.log('❌ 저장 실패:', data);
        showMessage(data.error || data.message || '저장에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('💥 API 호출 오류:', error);
      showMessage('네트워크 오류가 발생했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 🎯 주소 복사
  const handleCopyAddress = async () => {
    if (!savedAddress) return;

    try {
      await navigator.clipboard.writeText(savedAddress);
      setCopied(true);
      showMessage('주소가 클립보드에 복사되었습니다!', 'success');
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error('❌ 복사 실패', error);
      showMessage('복사에 실패했습니다', 'error');
    }
  };

  // 🎯 메시지 표시
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  // 🎯 전체 새로고침
  const refreshAll = () => {
    fetchDepositAddress();
    fetchDepositHistory();
    showMessage('데이터를 새로고침했습니다.', 'success');
  };

  // 🎯 Etherscan 열기
  const openEtherscan = (txHash) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  // 🎯 주소 유효성 검사
  const isValidEthAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // 🎯 로딩 화면
  if (loading) {
    return (
      <div className="deposit-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>입금 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="deposit-container">
      {/* 🎯 헤더 */}
      <div className="section-title">
        <span>💰 ETH 입금</span>
        <button className="refresh-btn" onClick={refreshAll}>
          🔄 새로고침
        </button>
      </div>

      {/* 🎯 상태 메시지 */}
      {message && (
        <div className={`status-message status-${messageType}`}>
          <span>
            {messageType === 'success' ? '✅' : 
             messageType === 'error' ? '❌' : 
             messageType === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{message}</span>
        </div>
      )}

      {/* 🎯 입금 주소 섹션 */}
      <div className="deposit-address-section">
        <div className="section-label">입금 주소</div>
        
        {savedAddress ? (
          <div className="address-display has-address">
            <div className="address-content">
              <div className="address-label">현재 등록된 ETH 입금 주소</div>
              <div className="address-value">{savedAddress}</div>
            </div>
            <div className="address-actions">
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyAddress}
              >
                {copied ? '✓ 복사됨!' : '📋 주소 복사'}
              </button>
              <button 
                className="change-btn" 
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                ✏️ 주소 변경
              </button>
              <button 
                className="qr-toggle" 
                onClick={() => setShowQR(!showQR)}
              >
                📱 QR 코드
              </button>
            </div>
          </div>
        ) : (
          <div className="address-display">
            <div className="address-content">
              <div className="address-label">입금 주소가 설정되지 않았습니다</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                ETH 입금을 받기 위해 주소를 등록해주세요
              </div>
            </div>
            <div className="address-actions">
              <button 
                className="change-btn" 
                onClick={() => setShowAddressForm(true)}
              >
                📝 주소 등록
              </button>
            </div>
          </div>
        )}

        {/* QR 코드 섹션 */}
        {showQR && savedAddress && (
          <div className="qr-section show">
            <div className="qr-placeholder">QR 코드</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              모바일에서 스캔하여 주소를 확인하세요
            </div>
          </div>
        )}

        {/* 주소 설정 폼 */}
        {showAddressForm && (
          <div className="address-setup-form show">
            <div className="form-group">
              <label className="form-label">
                {savedAddress ? '새 입금 주소' : 'ETH 입금 주소'}
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="0x로 시작하는 ETH 주소를 입력하세요"
                value={depositAddress}
                onChange={(e) => setDepositAddress(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button 
                className="save-btn" 
                onClick={handleSaveAddress}
                disabled={saving || !depositAddress.trim()}
              >
                {saving ? '💾 저장 중...' : '💾 저장'}
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowAddressForm(false);
                  setDepositAddress('');
                }}
              >
                ✖️ 취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 최근 입금 내역 (컴팩트) */}
      <div className="deposit-history-compact">
        <div className="history-header">
          <div className="history-title">📊 최근 입금 내역</div>
          <a 
            href="#" 
            className="view-all-link" 
            onClick={(e) => {
              e.preventDefault();
              console.log('📋 전체 입금 내역 보기');
            }}
          >
            전체 보기
          </a>
        </div>
        
        <div className="history-list">
          {deposits.length > 0 ? (
            deposits.map((deposit) => (
              <div key={deposit.id} className="history-item">
                <div className="history-left">
                  <div className="history-amount">+{deposit.amount} {deposit.coin_symbol}</div>
                  <div className="history-time">
                    {new Date(deposit.created_at).toLocaleString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="history-right">
                  <span className={`history-status status-${deposit.status}`}>
                    {deposit.status === 'confirmed' ? '확인됨' : 
                     deposit.status === 'pending' ? '대기중' : deposit.status}
                  </span>
                  <span 
                    className="history-tx" 
                    onClick={() => openEtherscan(deposit.tx_hash)}
                  >
                    {deposit.tx_hash.slice(0,6)}...{deposit.tx_hash.slice(-4)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-history">
              <div className="empty-icon">📭</div>
              <div>입금 내역이 없습니다</div>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 주의사항 */}
      <div className="notice-section">
        <div className="notice-title">
          <span>⚠️</span>
          주의사항
        </div>
        <ul className="notice-list">
          <li>입금 주소는 ETH 전용 주소입니다</li>
          <li>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다</li>
          <li>입금 후 확인까지 최대 30분이 소요될 수 있습니다</li>
          <li>최소 입금 금액은 0.01 ETH입니다</li>
          <li>현재 Sepolia 테스트넷을 사용 중입니다</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositForm;
