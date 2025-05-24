// backend/services/tradeEngineService.js
const TradeEngine = require('../engines/TradeEngine');

const engine = new TradeEngine();

const defaultMarkets = ['BTC/KRW', 'ETH/KRW'];
defaultMarkets.forEach(sym => engine.initializeMarket(sym, 0));

function placeOrder(order) {
  const id = engine.placeOrder(order);
  return getOrderById(id);
}

function getOrderById(id) {
  for (const book of Object.values(engine.orderBooks)) {
    const found = book.bids.concat(book.asks).find(o => o.id === id);
    if (found) return found;
  }
  return null;
}

function getOrdersByUser(userId) {
  const result = [];
  Object.values(engine.orderBooks).forEach(book => {
    result.push(...book.bids.filter(o => o.userId === userId));
    result.push(...book.asks.filter(o => o.userId === userId));
  });
  return result;
}

module.exports = {
  engine,
  placeOrder,
  getOrdersByUser,
  getOrderBook: symbol => engine.getOrderBook(symbol),
  getTradeHistory: symbol => engine.getTradeHistory(symbol),
  cancelOrder: (userId, id) => engine.cancelOrder(id, userId)
};
