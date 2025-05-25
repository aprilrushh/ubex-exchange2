// backend/routes/authRoutes.js - 간단한 버전 (500 오류 해결)

const express = require('express');
const router = express.Router();

// 임시 사용자 저장소 (메모리)
if (!global.users) {
  global.users = [
    { id: 1, email: 'test@test.com', password: '123456', name: '테스트 사용자' }
  ];
}

// 🔐 회원가입 API - 간단한 버전
router.post('/register', async (req, res) => {
  try {
    console.log('📝 회원가입 요청 받음:', req.body);
    
    const { email, password, name } = req.body;
    
    // 입력 검증
    if (!email || !password) {
      console.log('❌ 입력 검증 실패: 이메일 또는 비밀번호 누락');
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호가 필요합니다'
      });
    }
    
    // 중복 이메일 확인
    const existingUser = global.users.find(user => user.email === email);
    if (existingUser) {
      console.log('❌ 중복 이메일:', email);
      return res.status(400).json({
        success: false,
        error: '이미 등록된 이메일입니다'
      });
    }
    
    // 새 사용자 생성
    const newUser = {
      id: global.users.length + 1,
      email,
      password, // 개발 환경에서는 평문 저장
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    global.users.push(newUser);
    console.log('✅ 사용자 생성 완료:', newUser.email);
    
    // 간단한 토큰 생성 (JWT 대신 임시)
    const simpleToken = `token_${newUser.id}_${Date.now()}`;
    
    console.log('✅ 회원가입 성공:', {
      email: newUser.email,
      token: simpleToken
    });
    
    res.json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        },
        token: simpleToken
      }
    });
    
  } catch (error) {
    console.error('❌ 회원가입 오류 상세:', error);
    console.error('❌ 오류 스택:', error.stack);
    
    res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다',
      details: error.message
    });
  }
});

// 🔐 로그인 API - 간단한 버전
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 로그인 요청 받음:', req.body?.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호가 필요합니다'
      });
    }
    
    // 사용자 찾기
    const user = global.users.find(u => u.email === email && u.password === password);
    if (!user) {
      console.log('❌ 로그인 실패: 사용자 찾을 수 없음', email);
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 잘못되었습니다'
      });
    }
    
    // 간단한 토큰 생성
    const simpleToken = `token_${user.id}_${Date.now()}`;
    
    console.log('✅ 로그인 성공:', user.email);
    
    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: simpleToken
      }
    });
    
  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다'
    });
  }
});

// 🔍 사용자 정보 조회 API - 간단한 버전
router.get('/me', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '토큰이 필요합니다'
    });
  }
  
  // 간단한 토큰 검증 (token_1_timestamp 형태)
  const tokenParts = token.split('_');
  if (tokenParts.length === 3 && tokenParts[0] === 'token') {
    const userId = parseInt(tokenParts[1]);
    const user = global.users.find(u => u.id === userId);
    
    if (user) {
      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    }
  }
  
  res.status(401).json({
    success: false,
    error: '유효하지 않은 토큰입니다'
  });
});

// 🚪 로그아웃 API
router.post('/logout', (req, res) => {
  console.log('🚪 로그아웃 요청');
  res.json({
    success: true,
    message: '로그아웃되었습니다'
  });
});

// 📊 디버깅용 - 전체 사용자 목록
router.get('/debug/users', (req, res) => {
  res.json({
    success: true,
    data: global.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }))
  });
});

module.exports = router;