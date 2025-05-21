// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const currentPort = req.app ? (req.app.get('port') || process.env.PORT || 3035) : (process.env.PORT || 3035);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[Port:${currentPort}] JWT 검증: 실패 - 토큰 없음 또는 형식 오류`);
    return res.status(401).json({ message: '인증 토큰이 없거나 형식이 올바르지 않습니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 토큰 검증 시 jwtConfig.secret 사용
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = { id: decoded.userId || decoded.id };
    console.log(`[Port:${currentPort}] JWT 검증: 성공 - 사용자 ID: ${req.user.id}`);
    next();
  } catch (error) {
    console.error(`[Port:${currentPort}] JWT 검증 실패: ${error.name} - ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다 (서명 또는 형식 오류).' });
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
