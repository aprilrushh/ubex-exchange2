   // backend/routes/authRoutes.js
   const express = require('express');
   const router = express.Router();
   const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const { User } = require('../models');
   const authController = require('../controllers/authController');
   const jwtConfig = require('../config/jwtConfig');
   const authMiddleware = require('../middleware/authMiddleware');

   // 회원가입
   router.post('/register', authController.register);

   // 로그인
   router.post('/login', authController.login);

   // 토큰 갱신
   router.post('/refresh-token', authMiddleware, authController.refreshToken);

   module.exports = router;
      
   
   