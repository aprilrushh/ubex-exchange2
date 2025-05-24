const tradeEngine = require('../../services/tradeEngineService');

exports.listOrders = (req, res) => {
  const orders = [];
  Object.values(tradeEngine.engine.orderBooks).forEach(book => {
    orders.push(...book.bids, ...book.asks);
  });
  res.json(orders);
};

exports.listTrades = (req, res) => {
  const result = [];
  Object.keys(tradeEngine.engine.tradeHistory).forEach(sym => {
    result.push(...tradeEngine.engine.tradeHistory[sym]);
  });
  res.json(result);
};
