// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // 방금 만든 컨트롤러 불러오기

// POST /api/auth/register 경로로 오는 요청을 authController.register 함수로 전달
router.post('/register', authController.register);

module.exports = router; // 다른 파일에서 이 라우터를 사용할 수 있도록 내보내기
