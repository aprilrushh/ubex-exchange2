const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: '인증 토큰이 필요합니다.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    res.status(401).json({ 
      success: false, 
      error: '유효하지 않은 토큰입니다.' 
    });
  }
};

module.exports = { authMiddleware }; 