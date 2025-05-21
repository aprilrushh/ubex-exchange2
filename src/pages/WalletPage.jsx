import React from 'react';
import { useParams } from 'react-router-dom';
import DepositForm from '../components/Wallet/DepositForm.jsx';
import WithdrawForm from '../components/Wallet/WithdrawForm.jsx';

export default function WalletPage() {
  // URL에 /wallet/:coin 형태로 coin 파라미터 사용
  const { coin } = useParams();

  return (
    <div className="wallet-layout">
      <div className="wallet-sidebar">
        <DepositForm coin={coin.toUpperCase()} />
      </div>
      <div className="wallet-detail">
        <WithdrawForm coin={coin.toUpperCase()} />
      </div>
    </div>
  );
}
