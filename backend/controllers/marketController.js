const externalApiService = require('../services/ExternalApiService');

/**
 * @swagger
 * /api/markets:
 *   get:
 *     summary: Get default market tickers from Binance and Upbit
 *     responses:
 *       200:
 *         description: Market data
 */
exports.getMarkets = async (req, res) => {
  try {
    const data = await externalApiService.getDefaultMarkets();
    res.json(data);
  } catch (err) {
    console.error('getMarkets error:', err);
    res.status(500).json({ message: 'Failed to fetch markets' });
  }
};

/**
 * @swagger
 * /api/markets/{exchange}/{symbol}:
 *   get:
 *     summary: Get ticker data from a specific exchange
 *     parameters:
 *       - in: path
 *         name: exchange
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Ticker information
 */
exports.getTicker = async (req, res) => {
  const { exchange, symbol } = req.params;
  try {
    let data;
    if (exchange === 'binance') {
      data = await externalApiService.fetchBinanceTicker(symbol);
    } else if (exchange === 'upbit') {
      data = await externalApiService.fetchUpbitTicker(symbol);
    } else {
      return res.status(400).json({ message: 'Unsupported exchange' });
    }
    res.json(data);
  } catch (err) {
    console.error('getTicker error:', err);
    res.status(500).json({ message: 'Failed to fetch ticker' });
  }
};

exports.getOrderBook = async (req, res) => {
  const { exchange, symbol } = req.params;
  try {
    let data;
    if (exchange === 'binance') {
      data = await externalApiService.fetchBinanceOrderBook(symbol);
    } else if (exchange === 'upbit') {
      data = await externalApiService.fetchUpbitOrderBook(symbol);
    } else {
      return res.status(400).json({ message: 'Unsupported exchange' });
    }
    res.json(data);
  } catch (err) {
    console.error('getOrderBook error:', err);
    res.status(500).json({ message: 'Failed to fetch orderbook' });
  }
};

exports.getTrades = async (req, res) => {
  const { exchange, symbol } = req.params;
  try {
    let data;
    if (exchange === 'binance') {
      data = await externalApiService.fetchBinanceTrades(symbol);
    } else if (exchange === 'upbit') {
      data = await externalApiService.fetchUpbitTrades(symbol);
    } else {
      return res.status(400).json({ message: 'Unsupported exchange' });
    }
    res.json(data);
  } catch (err) {
    console.error('getTrades error:', err);
    res.status(500).json({ message: 'Failed to fetch trades' });
  }
};
