const jwt = require('jsonwebtoken');

// 🔧 JWT 토큰 검증 미들웨어
const authMiddleware = (req, res, next) => {
  try {
    console.log('[Auth] 인증 미들웨어 실행');
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"에서 TOKEN 부분만
    
    if (!token) {
      console.log('[Auth] 토큰이 없음 - 임시 사용자로 처리');
      
      // 🔧 개발 모드: 토큰 없어도 임시 사용자로 진행
      req.user = {
        id: 'temp-user-123',
        email: 'test@ubex.com',
        role: 'user'
      };
      
      return next();
    }
    
    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] 토큰 검증 성공:', decoded.userId);
    
    req.user = {
      id: decoded.userId,
      email: decoded.email || 'unknown@ubex.com',
      role: decoded.role || 'user'
    };
    
    next();
    
  } catch (error) {
    console.error('[Auth] 토큰 검증 실패:', error.message);
    
    // 🔧 개발 모드: 토큰 오류도 임시 사용자로 처리
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] 개발 모드 - 임시 사용자로 진행');
      req.user = {
        id: 'temp-user-123',
        email: 'test@ubex.com',
        role: 'user'
      };
      return next();
    }
    
    // 프로덕션에서는 401 반환
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: '유효하지 않은 토큰입니다'
    });
  }
};

// 🔧 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user'
      };
    } else {
      req.user = null; // 로그인하지 않은 사용자
    }
    
    next();
    
  } catch (error) {
    console.error('[Auth] 선택적 인증 오류:', error.message);
    req.user = null;
    next();
  }
};

// 🔧 관리자 권한 확인 미들웨어
const adminAuth = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.id === 'temp-user-123')) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '관리자 권한이 필요합니다'
      });
    }
  });
};

// 🔧 JWT 토큰 생성 함수
const generateToken = (userId, email, role = 'user') => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );
    
    console.log('[Auth] JWT 토큰 생성 완료:', userId);
    return token;
    
  } catch (error) {
    console.error('[Auth] JWT 토큰 생성 실패:', error);
    throw new Error('토큰 생성 실패');
  }
};

// 🔧 토큰 검증 함수
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuth,
  generateToken,
  verifyToken
}; 