const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

const authMiddleware = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('[authMiddleware] Authorization 헤더 없음');
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    // Bearer 토큰 형식 확인
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('[authMiddleware] 토큰 형식이 잘못됨');
      return res.status(401).json({ message: '잘못된 토큰 형식입니다.' });
    }

    // JWT 검증
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (!decoded || (!decoded.userId && !decoded.id)) {
      console.log('[authMiddleware] 토큰 디코딩 실패');
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 사용자 ID를 요청 객체에 추가
    req.user = { id: decoded.userId || decoded.id };
    console.log('[authMiddleware] 인증 성공:', { id: req.user.id });
    next();
  } catch (error) {
    console.error('[authMiddleware] 인증 실패:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = authMiddleware; 