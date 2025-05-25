// backend/controllers/coinController.js
// 🔧 임시 해결: 데이터베이스 없이 더미 데이터로 작동

const coinController = {
  // 코인 목록 조회
  async listCoins(req, res) {
    try {
      console.log('[coinController] listCoins 시작 (더미 데이터 모드)');
      
      // 🔧 DB 대신 더미 데이터 사용
      const dummyCoins = [
        {
          id: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          current_price: 67500.00,
          price_change_24h: 1250.50,
          price_change_percentage_24h: 1.89,
          market_cap: 1320000000000,
          volume_24h: 45000000000,
          high_24h: 68200.00,
          low_24h: 66800.00,
          ath: 73000.00,
          image: '/images/coins/btc.png',
          last_updated: new Date().toISOString()
        },
        {
          id: 2,
          symbol: 'ETH',
          name: 'Ethereum',
          current_price: 3420.75,
          price_change_24h: -85.30,
          price_change_percentage_24h: -2.43,
          market_cap: 411000000000,
          volume_24h: 18000000000,
          high_24h: 3510.00,
          low_24h: 3380.00,
          ath: 4800.00,
          image: '/images/coins/eth.png',
          last_updated: new Date().toISOString()
        },
        {
          id: 3,
          symbol: 'USDT',
          name: 'Tether',
          current_price: 1.00,
          price_change_24h: 0.00,
          price_change_percentage_24h: 0.02,
          market_cap: 95000000000,
          volume_24h: 52000000000,
          high_24h: 1.001,
          low_24h: 0.999,
          ath: 1.32,
          image: '/images/coins/usdt.png',
          last_updated: new Date().toISOString()
        },
        {
          id: 4,
          symbol: 'BNB',
          name: 'BNB',
          current_price: 590.25,
          price_change_24h: 12.40,
          price_change_percentage_24h: 2.15,
          market_cap: 88000000000,
          volume_24h: 2100000000,
          high_24h: 595.00,
          low_24h: 580.00,
          ath: 720.00,
          image: '/images/coins/bnb.png',
          last_updated: new Date().toISOString()
        },
        {
          id: 5,
          symbol: 'SOL',
          name: 'Solana',
          current_price: 158.90,
          price_change_24h: 5.75,
          price_change_percentage_24h: 3.75,
          market_cap: 71000000000,
          volume_24h: 4200000000,
          high_24h: 162.00,
          low_24h: 152.00,
          ath: 260.00,
          image: '/images/coins/sol.png',
          last_updated: new Date().toISOString()
        }
      ];

      // 약간의 가격 변동 시뮬레이션
      const updatedCoins = dummyCoins.map(coin => ({
        ...coin,
        current_price: coin.current_price * (1 + (Math.random() - 0.5) * 0.02), // ±1% 변동
        price_change_24h: coin.price_change_24h * (1 + (Math.random() - 0.5) * 0.3)
      }));

      console.log('[coinController] 더미 코인 데이터 반환:', updatedCoins.length, '개');

      res.json({
        success: true,
        data: updatedCoins,
        total: updatedCoins.length,
        message: '더미 데이터 모드 (DB 연결 없음)',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[coinController] listCoins error:', error);
      res.status(500).json({
        success: false,
        error: '코인 목록 조회 실패',
        message: error.message
      });
    }
  },

  // 개별 코인 조회
  async getCoin(req, res) {
    try {
      const { symbol } = req.params;
      console.log('[coinController] getCoin:', symbol);

      // 더미 데이터에서 찾기
      const coinData = {
        symbol: symbol.toUpperCase(),
        name: this.getCoinName(symbol),
        current_price: this.getCoinPrice(symbol),
        price_change_24h: (Math.random() - 0.5) * 1000,
        price_change_percentage_24h: (Math.random() - 0.5) * 10,
        last_updated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: coinData
      });

    } catch (error) {
      console.error('[coinController] getCoin error:', error);
      res.status(500).json({
        success: false,
        error: '코인 정보 조회 실패'
      });
    }
  },

  // 헬퍼 함수들
  getCoinName(symbol) {
    const names = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'USDT': 'Tether',
      'BNB': 'BNB',
      'SOL': 'Solana'
    };
    return names[symbol.toUpperCase()] || 'Unknown';
  },

  getCoinPrice(symbol) {
    const prices = {
      'BTC': 67500,
      'ETH': 3420,
      'USDT': 1,
      'BNB': 590,
      'SOL': 158
    };
    return prices[symbol.toUpperCase()] || 1;
  }
};

module.exports = coinController;