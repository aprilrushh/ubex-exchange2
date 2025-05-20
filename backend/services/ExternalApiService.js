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

  async getDefaultMarkets() {
    const binance = await this.fetchBinanceTicker('BTCUSDT');
    const upbit = await this.fetchUpbitTicker('KRW-BTC');
    return { binance, upbit };
  }
}

module.exports = new ExternalApiService();
