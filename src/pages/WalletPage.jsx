import React from 'react';
import { useParams } from 'react-router-dom';
import DepositForm from '../components/Wallet/DepositForm.jsx';
import WithdrawForm from '../components/Wallet/WithdrawForm.jsx';

export default function WalletPage() {
  // URL에 /wallet/:coin 형태로 coin 파라미터 사용
  const { coin } = useParams();
  const defaultCoin = 'BTC'; // 기본 코인 설정

  return (
    <div className="wallet-layout">
      <div className="wallet-sidebar">
        <DepositForm coin={coin ? coin.toUpperCase() : defaultCoin} />
      </div>
      <div className="wallet-detail">
        <WithdrawForm coin={coin ? coin.toUpperCase() : defaultCoin} />
      </div>
    </div>
  );
}
