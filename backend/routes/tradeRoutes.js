// backend/routes/tradeRoutes.js
const express = require('express');
const router = express.Router(); // Express 라우터 인스턴스 생성
const tradeController = require('../controllers/tradeController'); // 주문 관련 로직을 처리할 컨트롤러
const authMiddleware = require('../middlewares/authMiddleware'); // 사용자 인증을 위한 미들웨어

/**
 * @route   POST /api/orders
 * @desc    새로운 주문 생성
 * @access  Private (인증된 사용자만 접근 가능)
 */
router.post(
  '/', // 기본 경로 ('/api/orders'의 하위 경로이므로 '/'는 '/api/orders'를 의미)
  authMiddleware, // 이 라우트에 접근하기 전에 인증 미들웨어를 통과해야 함
  tradeController.createOrder // 인증 성공 시 tradeController의 createOrder 함수 실행
);

/**
 * @route   GET /api/orders
 * @desc    현재 로그인된 사용자의 주문 목록 조회
 * @access  Private (인증된 사용자만 접근 가능)
 */
router.get(
  '/', // 기본 경로 ('/api/orders'의 하위 경로이므로 '/'는 '/api/orders'를 의미)
  authMiddleware, // 이 라우트에 접근하기 전에 인증 미들웨어를 통과해야 함
  tradeController.getUserOrders // 인증 성공 시 tradeController의 getUserOrders 함수 실행
);

// 생성한 라우터를 모듈로 내보내서 server.js에서 사용할 수 있도록 함
module.exports = router;
