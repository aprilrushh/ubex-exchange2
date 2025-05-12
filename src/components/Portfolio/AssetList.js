import React from 'react';
import './AssetList.css';

const AssetList = ({ assets }) => {
  return (
    <div className="asset-list">
      <table>
        <thead>
          <tr>
            <th>자산명</th>
            <th>보유수량</th>
            <th>평가금액</th>
            <th>평가손익</th>
            <th>수익률</th>
          </tr>
        </thead>
        <tbody>
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
              <tr key={asset.symbol}>
                <td>{asset.name} <span className="symbol">({asset.symbol})</span></td>
                <td>{asset.amount?.toLocaleString() || '0'}</td>
                <td>{asset.value?.toLocaleString() || '0'} KRW</td>
                <td className={asset.profit >= 0 ? 'positive' : 'negative'}>
                  {asset.profit?.toLocaleString() || '0'} KRW
                </td>
                <td className={asset.profitRate >= 0 ? 'positive' : 'negative'}>
                  {asset.profitRate?.toFixed(2) || '0.00'}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>보유 중인 자산이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetList; 