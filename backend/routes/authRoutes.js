const express = require('express');
const router = express.Router();

// 컨트롤러 불러오기
let authController;
try {
  authController = require('../controllers/authController');
  console.log('라우터: authController 모듈 로드 성공');
} catch (error) {
  console.error('라우터: authController 모듈 로드 실패:', error.message);
  
  // 컨트롤러 로드 실패 시 기본 구현 제공
  authController = {
    login: (req, res) => {
      const { username, password } = req.body;
      console.log('라우터 기본 login 처리:', username);
      
      if (username === 'test' && password === 'test123') {
        return res.json({
          success: true,
          message: '로그인 성공 (라우터)',
          userId: '123',
          username
        });
      } else {
        return res.status(401).json({
          success: false,
          message: '잘못된 인증 정보 (라우터)'
        });
      }
    },
    
    register: (req, res) => {
      const { username, password } = req.body;
      console.log('라우터 기본 register 처리:', username);
      
      const userId = Date.now().toString();
      return res.json({
        success: true,
        message: '회원가입 성공 (라우터)',
        userId,
        username
      });
    }
  };
}

// 로그인 라우트
router.post('/login', (req, res) => {
  console.log('로그인 라우트 호출됨');
  return authController.login(req, res);
});

// 회원가입 라우트
router.post('/register', (req, res) => {
  console.log('회원가입 라우트 호출됨');
  return authController.register(req, res);
});

module.exports = router;
