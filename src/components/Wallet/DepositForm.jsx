// src/components/Wallet/DepositForm.jsx
import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';
import './Wallet.css';

const DEPOSIT_COIN = 'ETH'; // 하드코딩 상수

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
        
        // 응답이 문자열인 경우 직접 사용
        if (typeof response === 'string') {
          setSavedAddress(response);
        }
        // 응답이 객체이고 success가 true인 경우
        else if (response && response.success) {
          setSavedAddress(response.data.address);
        }
        // 응답이 객체이고 address가 직접 있는 경우
        else if (response && response.address) {
          setSavedAddress(response.address);
        }
        else {
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
      // 로그인 상태 확인
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }

      // ETH 주소 형식 검증
      if (!isValidEthAddress(depositAddress)) {
        alert('유효하지 않은 ETH 주소입니다.');
        return;
      }
      
      // 서버에 저장
      const response = await fetch('http://localhost:3035/api/v1/wallet/deposit-address/ETH', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: depositAddress })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSavedAddress(depositAddress);
        setDepositAddress(''); // 입력창 초기화
        alert('ETH 입금 주소가 등록되었습니다!');
      } else {
        if (response.status === 401) {
          if (data.message === '토큰이 만료되었습니다.') {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          } else {
            alert('인증에 실패했습니다. 다시 로그인해주세요.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else {
          alert(data.message || '저장에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('주소 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
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
    return <div className="wallet-loading">Loading...</div>;
  }

  return (
    <div className="deposit-form">
      <h3>{coin} 입금</h3>
      {error && <div className="wallet-error">{error}</div>}
      
      {/* 등록된 주소가 있으면 표시 */}
      {savedAddress && (
        <div className="saved-address-section">
          <div className="success-message">
            주소가 저장되었습니다.
          </div>
          <div className="address-display">
            <code className="deposit-address">{savedAddress}</code>
            <button
              className="copy-button"
              onClick={handleCopyAddress}
              title="주소 복사"
            >
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
        </div>
      )}
      
      {/* 주소 입력 섹션 */}
      <div className="address-input-section">
        <h3>입금 주소 설정</h3>
        <input
          type="text"
          placeholder="ETH 주소를 입력하세요"
          value={depositAddress}
          onChange={(e) => setDepositAddress(e.target.value)}
        />
        <button 
          onClick={handleSaveAddress}
          disabled={saving || !depositAddress}
          className="save-button"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      <div className="deposit-info">
        <p>※ 주의사항:</p>
        <ul>
          <li>입금 주소는 {coin} 전용 주소입니다.</li>
          <li>다른 코인을 이 주소로 보내면 자산이 손실될 수 있습니다.</li>
          <li>입금 후 확인까지 최대 30분이 소요될 수 있습니다.</li>
          <li>최소 입금 금액은 0.01 {coin}입니다.</li>
        </ul>
      </div>
    </div>
  );
};

// ETH 주소 검증 함수
const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default DepositForm;
