const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');

// 최근 체결 내역 조회
router.get('/', tradeController.getTradeHistory);

module.exports = router;
