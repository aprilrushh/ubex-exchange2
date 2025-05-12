import React, { useEffect, useState } from 'react';
import PortfolioTabs from '../components/Portfolio/PortfolioTabs';
import AssetSummary from '../components/Portfolio/AssetSummary';
import AssetList from '../components/Portfolio/AssetList';
import { getAssetSummary, getAssetList } from '../services/PortfolioService';

const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = 1; // 샘플 사용자 ID

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, assetList] = await Promise.all([
          getAssetSummary(userId),
          getAssetList(userId),
        ]);
        setSummary(summaryData);
        setAssets(assetList);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'portfolio') fetchData();
  }, [activeTab]);

  return (
    <div className="portfolio-page">
      <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'portfolio' && (
        <>
          <section style={{ margin: '24px 0' }}>
            {loading ? <div>로딩 중...</div> : error ? <div style={{color:'red'}}>{error}</div> : <AssetSummary summary={summary} />}
          </section>
          <section>
            {loading ? null : <AssetList assets={assets} />}
          </section>
        </>
      )}
      {/* 다른 탭은 추후 구현 */}
    </div>
  );
};

export default PortfolioPage; 