import React from 'react';
import Table from '../common/Table';
import './Wallet.css';

export default function WhitelistAddressTable({ addresses = [], onDelete, onResend }) {
  return (
    <Table className="whitelist-table">
      <thead>
        <tr>
          <th>라벨</th>
          <th>주소</th>
          <th>코인</th>
          <th>상태</th>
          <th>등록일</th>
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <tr key={addr.id}>
              <td>{addr.label}</td>
              <td className="mono">{addr.address}</td>
              <td>{addr.coin_symbol || addr.coin}</td>
              <td>{addr.status || 'CONFIRMED'}</td>
              <td>{addr.created_at ? new Date(addr.created_at).toLocaleDateString() : ''}</td>
              <td>
                <button onClick={() => onDelete && onDelete(addr.id)}>삭제</button>{' '}
                <button onClick={() => onResend && onResend(addr.id)}>재전송</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center' }}>등록된 주소가 없습니다.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
