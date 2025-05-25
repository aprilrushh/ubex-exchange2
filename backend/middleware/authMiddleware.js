// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (실제 운영 환경에서는 환경 변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || '57afddace4b22b4f8ef0cd5c34253c649d0dbf1bc55fad9fca68cd447b7ff520984b8e923d559e3176e5c3dfa05297db57b8c4b819a10dbfa16a1c861f7c6f6f';

// 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 토큰 검증 함수
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 필수 인증 미들웨어
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '인증 토큰이 필요합니다.' 
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: '유효하지 않은 토큰입니다.' 
    });
  }
};

// 선택적 인증 미들웨어 (인증이 없어도 진행)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  generateToken,
  verifyToken
};