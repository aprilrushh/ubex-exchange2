const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const portfolioController = require('../controllers/portfolioController');

// 포트폴리오 요약 정보 조회
router.get('/summary', authMiddleware, portfolioController.getPortfolioSummary);

// 포트폴리오 자산 목록 조회
router.get('/assets', authMiddleware, portfolioController.getPortfolioAssets);

// 포트폴리오 전체 정보 조회
router.get('/', authMiddleware, portfolioController.getPortfolio);

// 포트폴리오 히스토리 조회
router.get('/history', authMiddleware, portfolioController.getPortfolioHistory);

module.exports = router; 