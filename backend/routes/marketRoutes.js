const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

/**
 * @swagger
 * /api/markets:
 *   get:
 *     summary: Retrieve default market tickers
 *   /api/markets/{exchange}/{symbol}:
 *     get:
 *       summary: Retrieve ticker from specific exchange
 */

router.get('/', marketController.getMarkets);
router.get('/:exchange/:symbol', marketController.getTicker);
router.get('/:exchange/:symbol/orderbook', marketController.getOrderBook);
router.get('/:exchange/:symbol/trades', marketController.getTrades);

module.exports = router;
