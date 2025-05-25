// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (실제 환경에서는 환경변수 사용)
const JWT_SECRET = process.env.JWT_SECRET || 57afddace4b22b4f8ef0cd5c34253c649d0dbf1bc55fad9fca68cd447b7ff520984b8e923d559e3176e5c3dfa05297db57b8c4b819a10dbfa16a1c861f7c6f6f;

// 🔐 필수 인증 미들웨어
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-access-token') ||
                  req.cookies?.token;
    
    console.log('🔑 인증 토큰 확인:', token ? '존재함' : '없음');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '액세스 토큰이 필요합니다'
      });
    }
    
    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ 인증 성공:', req.user?.id || 'unknown');
    next();
    
  } catch (error) {
    console.error('❌ 인증 실패:', error.message);
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다'
    });
  }
};

// 🔓 선택적 인증 미들웨어 (토큰이 없어도 통과)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-access-token') ||
                  req.cookies?.token;
    
    console.log('🔑 선택적 인증 토큰:', token ? '존재함' : '없음');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('✅ 선택적 인증 성공:', req.user?.id);
      } catch (error) {
        console.log('⚠️ 토큰 검증 실패 (무시하고 진행):', error.message);
        // 토큰이 잘못되어도 계속 진행
      }
    }
    
    // 토큰이 없거나 잘못되어도 req.user는 undefined로 설정하고 진행
    req.user = req.user || { id: 'anonymous-' + Date.now() };
    next();
    
  } catch (error) {
    console.error('❌ 선택적 인증 오류:', error.message);
    req.user = { id: 'anonymous-' + Date.now() };
    next();
  }
};

// 🔑 토큰 생성 헬퍼 함수
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// 🔍 토큰 검증 헬퍼 함수
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  generateToken,
  verifyToken
};