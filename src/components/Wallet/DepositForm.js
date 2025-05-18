// 폴더: src/components/Wallet/DepositForm.js

import React, { useState, useEffect } from 'react';
import { getDepositAddress } from '../../services/WalletService';

export default function DepositForm({ coin }) {
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { address: addr } = await getDepositAddress(coin);
        setAddress(addr);
      } catch (e) {
        console.error('입금주소 조회 실패', e);
      }
    })();
  }, [coin]);

  return (
    <div className="deposit-form">
      <h2>{coin} 입금</h2>
      <label>입금 주소</label>
      <input type="text" value={address} readOnly />
      {address && (
        <div style={{ marginTop: 16 }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${address}&size=200x200`}
            alt="QR 코드"
          />
        </div>
      )}
    </div>
  );
}

    