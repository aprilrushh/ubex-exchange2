const axios = require('axios');

class ExternalApiService {
  constructor() {
    this.cache = {};
    this.ttl = 10000; // 10 seconds
  }

  // Generic get with caching
  async _cachedRequest(key, url) {
    const now = Date.now();
    if (this.cache[key] && now - this.cache[key].timestamp < this.ttl) {
      return this.cache[key].data;
    }
    const response = await axios.get(url);
    this.cache[key] = { data: response.data, timestamp: now };
    return response.data;
  }

  async fetchBinanceTicker(symbol) {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
    return this._cachedRequest(`binance_${symbol}`, url);
  }

  async fetchUpbitTicker(symbol) {
    const url = `https://api.upbit.com/v1/ticker?markets=${symbol}`;
    const data = await this._cachedRequest(`upbit_${symbol}`, url);
    return Array.isArray(data) ? data[0] : data;
  }

  async fetchBinanceOrderBook(symbol, limit = 50) {
    const url = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`;
    return this._cachedRequest(`binance_ob_${symbol}_${limit}`, url);
  }

  async fetchUpbitOrderBook(symbol) {
    const url = `https://api.upbit.com/v1/orderbook?markets=${symbol}`;
    const data = await this._cachedRequest(`upbit_ob_${symbol}`, url);
    return Array.isArray(data) ? data[0] : data;
  }

  async fetchBinanceTrades(symbol, limit = 50) {
    const url = `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${limit}`;
    return this._cachedRequest(`binance_trades_${symbol}_${limit}`, url);
  }

  async fetchUpbitTrades(symbol) {
    const url = `https://api.upbit.com/v1/trades/ticks?market=${symbol}&count=50`;
    return this._cachedRequest(`upbit_trades_${symbol}`, url);
  }

  async getDefaultMarkets() {
    const binance = await this.fetchBinanceTicker('BTCUSDT');
    const upbit = await this.fetchUpbitTicker('KRW-BTC');
    return { binance, upbit };
  }
}

module.exports = new ExternalApiService();
