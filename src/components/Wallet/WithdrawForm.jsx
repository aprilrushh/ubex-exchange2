// src/components/Wallet/WithdrawForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  listWhitelist,
  requestWithdrawal,
  addWhitelistAddress
} from '../../services/WalletService';
import './Wallet.css';

const WithdrawForm = ({ coin = 'ETH' }) => {
  const actualCoin = 'ETH'; // 임시로 ETH 고정
  console.log('WithdrawForm mounted with coin:', actualCoin);
  
  // 🎯 상태 관리
  const [whitelist, setWhitelist] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 🎯 UI 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  // 🎯 화이트리스트 조회
  const fetchWhitelist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 화이트리스트 조회 시작:', actualCoin);
      const response = await listWhitelist(actualCoin);
      console.log('📋 조회된 화이트리스트:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setWhitelist(response.data);
        // 첫 번째 주소를 기본 선택하지 않음 (사용자가 직접 선택하도록)
      } else {
        setWhitelist([]);
      }
    } catch (error) {
      console.error('❌ 화이트리스트 조회 실패', error);
      if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
        setError('화이트리스트를 불러오는데 실패했습니다.');
      }
      setWhitelist([]);
    } finally {
      setLoading(false);
    }
  }, [actualCoin]);

  useEffect(() => {
    console.log('🔄 WithdrawForm useEffect triggered with coin:', actualCoin);
    fetchWhitelist();
  }, [fetchWhitelist]);

  // 🎯 주소 선택 핸들러
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
    console.log('📍 주소 선택됨:', address);
  };

  // 🎯 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 🎯 새 주소 추가 모달 열기
  const openAddAddressModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  // 🎯 새 주소 추가 모달 닫기
  const closeAddAddressModal = () => {
    setIsModalOpen(false);
    setNewAddress({ label: '', address: '' });
  };

  // 🎯 새 주소 추가 핸들러
  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!newAddress.label || !newAddress.address) {
      setError('라벨과 주소를 모두 입력해주세요.');
      return;
    }

    // 주소 형식 검증
    if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress.address)) {
      setError('유효하지 않은 ETH 주소입니다.');
      return;
    }

    try {
      console.log('🆕 새 주소 추가 시도:', newAddress);
      const response = await addWhitelistAddress({
        coin: actualCoin,
        address: newAddress.address,
        label: newAddress.label
      });

      if (response.success) {
        console.log('✅ 새 주소 추가 성공');
        
        // 리스트 새로고침
        await fetchWhitelist();
        
        // 새로 추가된 주소를 자동 선택
        const newAddressObj = {
          id: response.data?.id || Date.now(),
          address: newAddress.address,
          label: newAddress.label,
          coin: actualCoin,
          status: 'CONFIRMED'
        };
        
        setSelectedAddress(newAddressObj);
        closeAddAddressModal();
        setError(null);
      } else {
        setError(response.message || '주소 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 새 주소 추가 실패:', error);
      setError('주소 등록 중 오류가 발생했습니다.');
    }
  };

  // 🎯 출금 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(false);
      
      if (!selectedAddress || !amount) {
        setError('출금 주소와 수량을 모두 입력해주세요.');
        return;
      }

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        setError('유효한 출금 수량을 입력해주세요.');
        return;
      }

      if (withdrawAmount > 5.0) {
        setError('출금 가능한 최대 수량은 5.0 ETH입니다.');
        return;
      }

      console.log('💸 출금 요청 시작:', { selectedAddress, amount: withdrawAmount });

      const response = await requestWithdrawal({
        currency: actualCoin,
        address: selectedAddress.address,
        amount: withdrawAmount
      });

      if (response.success) {
        setSuccess(true);
        setAmount('');
        console.log('✅ 출금 요청 성공');
      } else {
        setError(response.message || '출금 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 출금 요청 실패', error);
      if (process.env.REACT_APP_USE_DUMMY_DATA !== 'true') {
        setError('출금 요청에 실패했습니다.');
      }
    }
  };

  // 🎯 MAX 버튼 핸들러
  const setMaxAmount = () => {
    setAmount('5.0');
  };

  // 🎯 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.unified-address-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="wallet-loading">
        <div className="loading-spinner"></div>
        <p>화이트리스트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="withdraw-form-container">
      <div className="withdraw-form-header">
        <h3>💸 {actualCoin} 출금</h3>
      </div>

      {/* 🔔 메시지 */}
      {error && <div className="wallet-error">{error}</div>}
      {success && (
        <div className="wallet-success">
          출금 요청이 성공적으로 제출되었습니다.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 🎯 통합 주소 선택기 */}
        <div className="form-group">
          <label className="form-label">출금 주소</label>
          <div className="unified-address-selector">
            <div 
              className={`current-selection ${!selectedAddress ? 'empty' : ''} ${isDropdownOpen ? 'active' : ''}`}
              onClick={toggleDropdown}
            >
              <div className="selection-content">
                {selectedAddress ? (
                  <>
                    <div className="selection-label">{selectedAddress.label}</div>
                    <div className="selection-address">{selectedAddress.address}</div>
                  </>
                ) : (
                  <div className="selection-placeholder">주소를 선택하세요</div>
                )}
              </div>
              <div className={`dropdown-icon ${isDropdownOpen ? 'rotated' : ''}`}>▼</div>
            </div>
            
            {/* 🎯 통합 드롭다운 */}
            {isDropdownOpen && (
              <div className="unified-dropdown show">
                <div className="dropdown-header">
                  등록된 출금 주소 ({whitelist.length}개)
                </div>
                
                <div className="address-list">
                  {whitelist.length > 0 ? (
                    whitelist.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <div className="address-info">
                          <div className="address-label">{addr.label}</div>
                          <div className="address-value">{addr.address}</div>
                        </div>
                        <div className="address-status">
                          {selectedAddress?.id === addr.id ? (
                            <span className="check-icon">✓</span>
                          ) : (
                            <span className="status-badge status-active">활성</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <div className="empty-text">등록된 주소가 없습니다</div>
                    </div>
                  )}
                </div>
                
                <div className="add-address-section">
                  <button type="button" className="add-address-button" onClick={openAddAddressModal}>
                    <span>➕</span>
                    새 주소 등록
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 출금 수량 입력 */}
        <div className="form-group">
          <label className="form-label">출금 수량</label>
          <div className="amount-input-group">
            <input
              type="number"
              className="amount-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              max="5.0"
              required
            />
            <span className="amount-suffix">ETH</span>
          </div>
          <div className="balance-info">
            <span>보유 잔액: <strong>5.0 ETH</strong></span>
            <button type="button" className="max-button" onClick={setMaxAmount}>
              MAX
            </button>
          </div>
        </div>

        {/* 🎯 출금 버튼 */}
        <button 
          type="submit" 
          className="withdraw-button"
          disabled={!selectedAddress || !amount || parseFloat(amount) <= 0}
        >
          출금 요청
        </button>
      </form>

      {/* 🎯 주의사항 */}
      <div className="withdraw-info">
        <p>⚠️ 주의사항:</p>
        <ul>
          <li>출금은 화이트리스트에 등록된 주소로만 가능합니다.</li>
          <li>출금 수수료는 네트워크 상황에 따라 변동될 수 있습니다.</li>
          <li>출금 요청 후 처리까지 최대 30분이 소요될 수 있습니다.</li>
          <li>현재 Sepolia 테스트넷을 사용 중입니다.</li>
        </ul>
      </div>

      {/* 🎯 새 주소 등록 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeAddAddressModal()}>
          <div className="modal-content">
            <div className="modal-header">새 출금 주소 등록</div>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label className="form-label">주소 라벨</label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="예: My Personal Wallet"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">지갑 주소</label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="0x로 시작하는 주소를 입력하세요"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={closeAddAddressModal}>취소</button>
                <button type="submit">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawForm;
