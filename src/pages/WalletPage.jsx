import React from 'react';
import { useParams } from 'react-router-dom';
import DepositForm from '../components/Wallet/DepositForm';
import WithdrawForm from '../components/Wallet/WithdrawForm';

export default function WalletPage() {
  // URL에 /wallet/:coin 형태로 coin 파라미터 사용
  const { coin } = useParams();

  return (
    <div className="wallet-page">
      <DepositForm coin={coin.toUpperCase()} />
      <WithdrawForm coin={coin.toUpperCase()} />
    </div>
  );
} 