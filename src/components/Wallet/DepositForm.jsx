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
      <div className="wallet-loading">
        <div className="loading-spinner"></div>
        <p>입금 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 🎯 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>💰 ETH 입금</h1>
        <button 
          className="refresh-btn"
          onClick={refreshAll}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* 🎯 상태 메시지 */}
      {message && (
        <div className={`wallet-${messageType} success-alert`} style={{ marginBottom: '20px' }}>
          {messageType === 'success' ? '✅' : 
           messageType === 'error' ? '❌' : 
           messageType === 'warning' ? '⚠️' : 'ℹ️'} {message}
        </div>
      )}

      {/* 🎯 입금 주소 섹션 */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px', color: '#495057' }}>입금 주소</h4>
        
        {savedAddress ? (
          <div className="success-alert" style={{ padding: '20px', borderRadius: '10px' }}>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#155724' }}>
              현재 등록된 ETH 입금 주소
            </div>
            <div style={{ 
              fontFamily: 'Monaco, Consolas, monospace', 
              fontSize: '13px', 
              wordBreak: 'break-all', 
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px'
            }}>
              {savedAddress}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="btn"
                onClick={handleCopyAddress}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '12px',
                  background: copied ? '#28a745' : '#007bff'
                }}
              >
                {copied ? '✓ 복사됨!' : '📋 주소 복사'}
              </button>
              <button 
                className="btn"
                onClick={() => setShowAddressForm(!showAddressForm)}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '12px',
                  background: '#6c757d'
                }}
              >
                {showAddressForm ? '🔻 숨기기' : '✏️ 주소 변경'}
              </button>
              <button 
                className="btn"
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '12px',
                  background: 'transparent',
                  color: '#007bff',
                  border: '1px solid #007bff'
                }}
              >
                📱 QR 코드
              </button>
            </div>
          </div>
        ) : (
          <div className="notice" style={{ textAlign: 'center', padding: '30px' }}>
            <p style={{ marginBottom: '15px' }}>입금 주소가 설정되지 않았습니다</p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              ETH 입금을 받기 위해 주소를 등록해주세요
            </p>
            <button 
              className="btn"
              onClick={() => setShowAddressForm(true)}
            >
              📝 주소 등록
            </button>
          </div>
        )}

        {/* 주소 설정 폼 */}
        {showAddressForm && (
          <div className="form-section" style={{ marginTop: '20px' }}>
            <h3>{savedAddress ? '새 입금 주소' : 'ETH 입금 주소'}</h3>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="0x로 시작하는 ETH 주소를 입력하세요"
                value={depositAddress}
                onChange={(e) => setDepositAddress(e.target.value)}
                style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn" 
                onClick={handleSaveAddress}
                disabled={saving || !depositAddress.trim()}
                style={{ flex: 1 }}
              >
                {saving ? '💾 저장 중...' : '💾 저장'}
              </button>
              <button 
                className="btn"
                onClick={() => {
                  setShowAddressForm(false);
                  setDepositAddress('');
                }}
                style={{ 
                  flex: 1, 
                  background: '#6c757d'
                }}
              >
                ✖️ 취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 최근 입금 내역 */}
      <div className="deposit-history">
        <div className="history-header">
          <h3>📊 최근 입금 내역</h3>
          <a 
            href="#" 
            style={{ 
              color: '#007bff', 
              textDecoration: 'none', 
              fontSize: '14px' 
            }}
            onClick={(e) => {
              e.preventDefault();
              console.log('📋 전체 입금 내역 보기');
            }}
          >
            전체 보기
          </a>
        </div>
        
        {/* 🎯 입금 내역 리스트 형태 (테이블 대신) */}
        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: '10px', 
          padding: '15px',
          border: '1px solid #dee2e6'
        }}>
          {deposits.length > 0 ? (
            deposits.map((deposit, index) => (
              <div 
                key={deposit.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < deposits.length - 1 ? '1px solid #e9ecef' : 'none'
                }}
              >
                <div>
                  <div className="amount" style={{ fontSize: '16px', marginBottom: '4px' }}>
                    +{deposit.amount} {deposit.coin_symbol}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {new Date(deposit.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span 
                      className={`status-badge status-${deposit.status}`}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      {deposit.status === 'confirmed' ? '확인됨' : 
                       deposit.status === 'pending' ? '대기중' : deposit.status}
                    </span>
                  </div>
                  <div 
                    className="tx-hash" 
                    onClick={() => openEtherscan(deposit.tx_hash)}
                    style={{ fontSize: '11px', cursor: 'pointer' }}
                  >
                    {deposit.tx_hash.slice(0,6)}...{deposit.tx_hash.slice(-4)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data" style={{ textAlign: 'center', padding: '30px' }}>
              📭 입금 내역이 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 🎯 주의사항 */}
      <div className="notice" style={{ marginTop: '30px' }}>
        <h4>⚠️ 주의사항</h4>
        <ul>
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