import React, { useEffect, useState } from 'react';
import {
  getWhitelistAddresses,
  removeWhitelistAddress,
  resendWhitelistConfirmation,
} from '../services/WalletService';
import WhitelistAddressTable from '../components/Wallet/WhitelistAddressTable.jsx';
import AddWhitelistModal from '../components/Wallet/AddWhitelistModal.jsx';

export default function WhitelistAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWhitelistAddresses();
      setAddresses(data.data || data);
    } catch (err) {
      console.error(err);
      setError('화이트리스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await removeWhitelistAddress(id);
      loadAddresses();
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleResend = async (id) => {
    try {
      await resendWhitelistConfirmation(id);
      alert('확인 메일이 재전송되었습니다.');
    } catch (err) {
      alert('재전송에 실패했습니다.');
    }
  };

  return (
    <div className="whitelist-page">
      <h2>화이트리스트 주소 관리</h2>
      {error && <div className="wallet-error">{error}</div>}
      {loading ? (
        <div className="wallet-loading">Loading...</div>
      ) : (
        <WhitelistAddressTable
          addresses={addresses}
          onDelete={handleDelete}
          onResend={handleResend}
        />
      )}
      <button
        onClick={() => setShowModal(true)}
        className="submit-button"
        style={{ marginTop: '1rem' }}
      >
        새 주소 추가
      </button>
      {showModal && (
        <AddWhitelistModal
          onClose={() => setShowModal(false)}
          onSuccess={loadAddresses}
        />
      )}
    </div>
  );
}
