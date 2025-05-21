import React, { useEffect, useState } from 'react';
import PortfolioTabs from '../components/Portfolio/PortfolioTabs';
import AssetSummary from '../components/Portfolio/AssetSummary';
import AssetList from '../components/Portfolio/AssetList';
import { getAssetSummary, getAssetList } from '../services/PortfolioService';
import './InvestmentPage.css';

const InvestmentPage = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, assetList] = await Promise.all([
          getAssetSummary(),
          getAssetList()
        ]);
        setSummary(summaryData);
        setAssets(assetList);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'portfolio') {
      fetchData();
    }
  }, [activeTab]);

  return (
    <div className="investment-page">
      <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'portfolio' && (
        <>
          <section className="profit-summary">
            {loading ? (
              <div className="loading">로딩 중...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <AssetSummary summary={summary} />
            )}
          </section>
          <section className="chart-section">
            <div className="chart">
              {/* TODO: 투자 손익 차트 */}
            </div>
            <AssetList assets={assets} tableClassName="detail-table" />
          </section>
        </>
      )}
    </div>
  );
};

export default InvestmentPage;
