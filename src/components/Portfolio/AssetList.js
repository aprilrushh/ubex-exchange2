import React from 'react';
import Table from '../common/Table';
import './AssetList.css';

const AssetList = ({ assets, tableClassName = 'asset-table' }) => {
  return (
    <div className="asset-list">
      <div className="asset-header">
        <div>자산명</div>
        <div>보유수량</div>
        <div>평가금액</div>
        <div>평가손익</div>
        <div>수익률</div>
      </div>
      <Table className={tableClassName}>
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
      </Table>
    </div>
  );
};

export default AssetList; 