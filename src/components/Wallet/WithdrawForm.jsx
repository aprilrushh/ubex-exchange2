// src/components/Wallet/WithdrawForm.jsx
import React, { useState, useEffect } from 'react';
import {
  listWhitelist,
  addWhitelist,
  deleteWhitelist,
  requestWithdrawal
} from '../../services/WalletService';

export default function WithdrawForm({ coin }) {
  const [whitelist, setWhitelist] = useState([]);
  const [toAddress, setToAddress] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  // 1) 화이트리스트 로딩
  useEffect(() => {
    (async () => {
      const list = await listWhitelist(coin);
      setWhitelist(list);
    })();
  }, [coin]);

  // 2) 화이트리스트 추가
  const handleAdd = async () => {
    if (!toAddress) return alert('주소를 입력하세요');
    await addWhitelist(coin, toAddress, label);
    const list = await listWhitelist(coin);
    setWhitelist(list);
    setToAddress(''); setLabel('');
  };

  // 3) 출금 요청
  const handleWithdraw = async () => {
    if (!toAddress || !amount) return alert('주소와 수량을 입력하세요');
    await requestWithdrawal(coin, toAddress, amount);
    alert('출금 요청이 완료되었습니다');
  };

  return (
    <div className="withdraw-form">
      <h2>{coin} 출금</h2>

      <div className="whitelist-list">
        <h3>화이트리스트</h3>
        <ul>
          {whitelist.map(item => (
            <li key={item.id}>
              {item.label || item.address}
              <button onClick={() => setToAddress(item.address)}>선택</button>
              <button onClick={async () => {
                await deleteWhitelist(coin, item.id);
                setWhitelist(whitelist.filter(x => x.id !== item.id));
              }}>삭제</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="whitelist-add">
        <input
          type="text"
          placeholder="새 주소"
          value={toAddress}
          onChange={e => setToAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="레이블 (선택)"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <button onClick={handleAdd}>화이트리스트 추가</button>
      </div>

      <div className="withdraw-action" style={{ marginTop: 16 }}>
        <input
          type="number"
          placeholder="수량"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button onClick={handleWithdraw}>출금 요청</button>
      </div>
    </div>
  );
}
