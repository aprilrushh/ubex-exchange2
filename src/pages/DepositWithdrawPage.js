import React, { useState } from 'react';
import DepositForm from '../components/Wallet/DepositForm';
import WithdrawForm from '../components/Wallet/WithdrawForm';

const ASSETS = [
  { symbol: 'BTC', name: '비트코인' },
  { symbol: 'ETH', name: '이더리움' },
  { symbol: 'USDT', name: '테더' },
];

const DepositWithdrawPage = () => {
  const [tab, setTab] = useState('deposit');
  const [asset, setAsset] = useState('BTC');

  return (
    <div className="deposit-withdraw-page" style={{maxWidth:480, margin:'0 auto', padding:'32px 0'}}>
      <div style={{display:'flex', gap:8, marginBottom:24}}>
        <button className={tab==='deposit' ? 'active' : ''} onClick={()=>setTab('deposit')}>입금</button>
        <button className={tab==='withdraw' ? 'active' : ''} onClick={()=>setTab('withdraw')}>출금</button>
        <select value={asset} onChange={e=>setAsset(e.target.value)} style={{marginLeft:'auto'}}>
          {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.name}({a.symbol})</option>)}
        </select>
      </div>
      <section style={{background:'#fff', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:24}}>
        {tab === 'deposit' ? <DepositForm asset={asset} /> : <WithdrawForm asset={asset} />}
      </section>
    </div>
  );
};

export default DepositWithdrawPage; 