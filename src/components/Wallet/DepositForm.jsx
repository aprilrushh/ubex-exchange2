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
  
  // 🎯 UI 상태 - 최소화
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
    <div className="deposit-form">
      <h3>💰 ETH 입금</h3>

      {/* 🎯 상태 메시지 */}
      {message && (
        <div className={`wallet-${messageType}`}>
          {messageType === 'success' ? '✅' : 
           messageType === 'error' ? '❌' : 
           messageType === 'warning' ? '⚠️' : 'ℹ️'} {message}
        </div>
      )}

      {/* 🎯 입금 주소 섹션 - 기존 스타일 활용 */}
      <div className="deposit-address">
        <h4>📍 입금 주소</h4>
        
        {savedAddress ? (
          <div className="address-container">
            <code>{savedAddress}</code>
            <button 
              onClick={handleCopyAddress}
              className={copied ? 'copied' : ''}
            >
              {copied ? '✓ 복사됨!' : '📋 복사'}
            </button>
            <button onClick={() => setShowAddressForm(!showAddressForm)}>
              ✏️ 변경
            </button>
          </div>
        ) : (
          <div className="wallet-info" style={{ textAlign: 'center', padding: '20px' }}>
            <p>입금 주소가 설정되지 않았습니다</p>
            <button 
              className="btn"
              onClick={() => setShowAddressForm(true)}
              style={{ marginTop: '12px' }}
            >
              📝 주소 등록
            </button>
          </div>
        )}

        {/* 주소 설정 폼 - 조건부 표시 */}
        {showAddressForm && (
          <div className="form-section" style={{ marginTop: '16px' }}>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="0x로 시작하는 ETH 주소를 입력하세요"
                value={depositAddress}
                onChange={(e) => setDepositAddress(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                  background: '#6c757d',
                  borderColor: '#6c757d'
                }}
              >
                ✖️ 취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 최근 입금 내역 - 기존 스타일 활용 */}
      <div className="deposit-history">
        <div className="history-header">
          <h3>📊 최근 입금 내역</h3>
          <button className="refresh-btn" onClick={refreshAll}>
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
            {deposits.length > 0 ? (
              deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>
                    {new Date(deposit.created_at).toLocaleString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="amount">+{deposit.amount} {deposit.coin_symbol}</td>
                  <td>
                    <span className={`status-badge status-${deposit.status}`}>
                      {deposit.status === 'confirmed' ? '확인됨' : 
                       deposit.status === 'pending' ? '대기중' : deposit.status}
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
            ) : (
              <tr>
                <td colSpan="4" className="no-data">📭 입금 내역이 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🎯 주의사항 - 기존 스타일 활용 */}
      <div className="notice">
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