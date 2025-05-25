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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [showAddressInput, setShowAddressInput] = useState(false);

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
      
      // 🔧 새로운 API 엔드포인트 사용
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposit-address/${coin}`);
      const result = await response.json();
      
      console.log('📋 조회된 입금 주소:', result);
      
      if (result.success && result.data && result.data.address) {
        setSavedAddress(result.data.address);
        setMessage('');
        setShowAddressInput(false); // 주소가 있으면 입력창 숨김
      } else {
        setSavedAddress('');
        setMessage(result.message || '입금 주소가 설정되지 않았습니다');
        setMessageType('info');
      }
    } catch (error) {
      console.error('❌ 입금 주소 조회 실패', error);
      setError('입금 주소를 불러오는데 실패했습니다.');
      setMessage('입금 주소 조회 중 오류가 발생했습니다');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposits?coin=ETH&limit=5`);
      const result = await response.json();
      
      if (result.success) {
        setDeposits(result.data || []);
      }
    } catch (error) {
      console.error('입금 내역 조회 오류:', error);
    }
  };

  const handleSaveAddress = async () => {
    if (!depositAddress.trim()) {
      setMessage('주소를 입력해주세요');
      setMessageType('error');
      return;
    }

    if (!isValidEthAddress(depositAddress)) {
      setMessage('유효하지 않은 ETH 주소입니다');
      setMessageType('error');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 사용 중인 토큰:', token ? '존재함' : '없음');
      
      // 🔧 토큰이 없어도 임시 사용자로 진행 (개발 모드)
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wallet/deposit-address/${coin}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ address: depositAddress })
      });
      
      console.log('📡 API 응답 상태:', response.status);
      
      // 🔧 토큰 갱신 로직 (기존 유지)
      if (response.status === 401 && token) {
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
              return handleSaveAddress(); // 재귀 호출
            }
          } catch (refreshError) {
            console.error('💥 토큰 갱신 실패:', refreshError);
          }
        }
        setMessage('인증이 만료되었습니다. 다시 로그인해주세요.');
        setMessageType('error');
        return;
      }
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ 저장 성공:', data);
        setSavedAddress(depositAddress);
        setDepositAddress('');
        setShowAddressInput(false);
        setMessage('입금 주소가 성공적으로 저장되었습니다!');
        setMessageType('success');
        
        // 5초 후 메시지 자동 삭제
        setTimeout(() => {
          setMessage('');
        }, 5000);
      } else {
        console.log('❌ 저장 실패:', data);
        setMessage(data.error || data.message || '저장에 실패했습니다');
        setMessageType('error');
      }
    } catch (error) {
      console.error('💥 API 호출 오류:', error);
      setMessage('네트워크 오류가 발생했습니다');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  // 🔧 개선된 복사 기능
  const handleCopyAddress = async () => {
    if (!savedAddress) return;

    try {
      await navigator.clipboard.writeText(savedAddress);
      setCopied(true);
      setMessage('주소가 클립보드에 복사되었습니다!');
      setMessageType('success');
      
      setTimeout(() => {
        setCopied(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ 복사 실패', error);
      setMessage('복사에 실패했습니다');
      setMessageType('error');
    }
  };

  // 🔧 기존 헬퍼 함수들 유지
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

  const isValidEthAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // 🔧 로딩 화면 (기존 스타일 유지)
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
      {/* 🎨 헤더 개선 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '0 5px'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>💰 ETH 입금</h1>
        <button 
          className="refresh-btn"
          onClick={() => {
            fetchDepositAddress();
            fetchDepositHistory();
          }}
          style={{ 
            padding: '10px 16px',
            fontSize: '14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔄 새로고침
        </button>
      </div>

      {/* 🔔 메시지 표시 (개선됨) */}
      {message && (
        <div 
          className={`message-alert ${messageType}`} 
          style={{
            padding: '15px 20px',
            marginBottom: '25px',
            borderRadius: '10px',
            border: '1px solid',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: messageType === 'success' ? '#d4edda' : 
                            messageType === 'error' ? '#f8d7da' : '#d1ecf1',
            borderColor: messageType === 'success' ? '#c3e6cb' : 
                        messageType === 'error' ? '#f5c6cb' : '#bee5eb',
            color: messageType === 'success' ? '#155724' : 
                  messageType === 'error' ? '#721c24' : '#0c5460'
          }}
        >
          <span style={{ marginRight: '10px', fontSize: '16px' }}>
            {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : 'ℹ️'}
          </span>
          {message}
        </div>
      )}
      
      {/* 🏠 저장된 주소 표시 (개선됨) */}
      {savedAddress ? (
        <div className="success-alert" style={{ 
          padding: '20px',
          marginBottom: '25px',
          borderRadius: '12px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#155724' }}>
            📍 현재 등록된 입금 주소
          </div>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              fontFamily: 'Monaco, Consolas, "Courier New", monospace', 
              fontSize: '13px', 
              wordBreak: 'break-all',
              color: '#495057',
              lineHeight: '1.4'
            }}>
              {savedAddress}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyAddress}
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px',
                backgroundColor: copied ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
            >
              {copied ? '✓ 복사 완료!' : '📋 주소 복사'}
            </button>
            <button 
              className="btn"
              onClick={() => setShowAddressInput(!showAddressInput)}
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px', 
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
            >
              {showAddressInput ? '🔻 입력창 숨기기' : '✏️ 주소 변경'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffeaa7',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <div style={{ 
            color: '#856404', 
            marginBottom: '12px', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            ⚠️ 입금 주소가 설정되지 않았습니다
          </div>
          <p style={{ 
            color: '#856404', 
            fontSize: '14px', 
            marginBottom: '15px',
            lineHeight: '1.5'
          }}>
            ETH 입금을 받기 위해 지갑 주소를 등록해주세요. 등록된 주소로 ETH를 전송하면 자동으로 입금 처리됩니다.
          </p>
          <button
            className="btn"
            onClick={() => setShowAddressInput(true)}
            style={{ 
              backgroundColor: '#ffc107', 
              color: '#212529',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📝 주소 등록하기
          </button>
        </div>
      )}
      
      {/* 🔧 주소 입력 섹션 (조건부 표시) */}
      {showAddressInput && (
        <div className="form-section" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#495057' }}>
            📍 {savedAddress ? '주소 변경' : '새 입금 주소 등록'}
          </h3>
          <div className="input-group" style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="0x로 시작하는 42자리 ETH 주소를 입력하세요"
              value={depositAddress}
              onChange={(e) => {
                setDepositAddress(e.target.value);
                setMessage(''); // 입력 시 메시지 초기화
              }}
              style={{ 
                fontFamily: 'Monaco, Consolas, "Courier New", monospace', 
                fontSize: '13px',
                padding: '12px 15px',
                width: '100%',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn"
              onClick={handleSaveAddress}
              disabled={saving || !depositAddress.trim()}
              style={{ 
                flex: 1,
                padding: '12px 20px',
                backgroundColor: saving ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: (!depositAddress.trim()) ? 0.6 : 1
              }}
            >
              {saving ? '💾 저장 중...' : '💾 주소 저장'}
            </button>
            <button
              className="btn"
              onClick={() => {
                setShowAddressInput(false);
                setDepositAddress('');
                setMessage('');
              }}
              style={{ 
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ✖️ 취소
            </button>
          </div>
        </div>
      )}
      
      {/* 📊 입금 내역 (기존 스타일 유지 + 소폭 개선) */}
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
                    style={{ cursor: 'pointer' }}
                    title="클릭하면 Etherscan에서 확인할 수 있습니다"
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
      
      {/* ⚠️ 주의사항 (기존 유지) */}
      <div className="notice">
        <h4>⚠️ 주의사항:</h4>
        <ul>
          <li>입금 주소는 ETH 전용 주소입니다.</li>
          <li>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 확인까지 최대 30분이 소요될 수 있습니다.</li>
          <li>최소 입금 금액은 0.01 ETH입니다.</li>
          <li>현재 Sepolia 테스트넷을 사용 중입니다. 실제 ETH를 보내지 마세요.</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositForm;
