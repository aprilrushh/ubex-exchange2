import React from 'react';
import './AssetSummary.css';

const AssetSummary = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className="asset-summary">
      <div className="summary-card">
        <div className="label">보유 KRW</div>
        <div className="value">{summary.krw?.toLocaleString() || '0'} KRW</div>
      </div>
      <div className="summary-card">
        <div className="label">총 평가</div>
        <div className="value">{summary.totalValue?.toLocaleString() || '0'} KRW</div>
      </div>
      <div className="summary-card">
        <div className="label">주문 가능</div>
        <div className="value">{summary.available?.toLocaleString() || '0'} KRW</div>
      </div>
      <div className="summary-card">
        <div className="label">총 평가손익</div>
        <div className="value {summary.profit >= 0 ? 'positive' : 'negative'}">
          {summary.profit?.toLocaleString() || '0'} KRW
        </div>
      </div>
      <div className="summary-card">
        <div className="label">총 수익률</div>
        <div className={`value ${summary.profitRate >= 0 ? 'positive' : 'negative'}`}>{summary.profitRate?.toFixed(2) || '0.00'}%</div>
      </div>
    </div>
  );
};

export default AssetSummary; 