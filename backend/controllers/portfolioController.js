const { getCurrentPrices } = require('../services/marketDataService');

// 포트폴리오 요약 정보 조회
const getPortfolioSummary = async (req, res) => {
  try {
    // 임시 데이터
    const summary = {
      totalValue: 10000,
      dailyChange: 500,
      dailyChangePercent: 5.0,
      assets: [
        { symbol: 'BTC', value: 5000, change: 250 },
        { symbol: 'ETH', value: 3000, change: 150 },
        { symbol: 'USDT', value: 2000, change: 100 }
      ]
    };
    res.json(summary);
  } catch (error) {
    console.error('포트폴리오 요약 조회 실패:', error);
    res.status(500).json({ message: '포트폴리오 요약 조회 중 오류가 발생했습니다.' });
  }
};

// 포트폴리오 자산 목록 조회
const getPortfolioAssets = async (req, res) => {
  try {
    // 임시 데이터
    const assets = [
      {
        symbol: 'BTC',
        amount: 0.5,
        value: 5000,
        change: 250,
        changePercent: 5.0
      },
      {
        symbol: 'ETH',
        amount: 10,
        value: 3000,
        change: 150,
        changePercent: 5.0
      },
      {
        symbol: 'USDT',
        amount: 2000,
        value: 2000,
        change: 100,
        changePercent: 5.0
      }
    ];
    res.json(assets);
  } catch (error) {
    console.error('자산 목록 조회 실패:', error);
    res.status(500).json({ message: '자산 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 포트폴리오 전체 정보 조회
const getPortfolio = async (req, res) => {
  try {
    const summary = await getPortfolioSummary(req, res);
    const assets = await getPortfolioAssets(req, res);
    res.json({ summary, assets });
  } catch (error) {
    console.error('포트폴리오 전체 정보 조회 실패:', error);
    res.status(500).json({ message: '포트폴리오 전체 정보 조회 중 오류가 발생했습니다.' });
  }
};

// 포트폴리오 히스토리 조회
const getPortfolioHistory = async (req, res) => {
  try {
    // 임시 데이터
    const history = [
      {
        date: '2024-03-20',
        totalValue: 10000,
        change: 500,
        changePercent: 5.0
      },
      {
        date: '2024-03-19',
        totalValue: 9500,
        change: -200,
        changePercent: -2.0
      }
    ];
    res.json(history);
  } catch (error) {
    console.error('포트폴리오 히스토리 조회 실패:', error);
    res.status(500).json({ message: '포트폴리오 히스토리 조회 중 오류가 발생했습니다.' });
  }
};

module.exports = {
  getPortfolioSummary,
  getPortfolioAssets,
  getPortfolio,
  getPortfolioHistory
}; 