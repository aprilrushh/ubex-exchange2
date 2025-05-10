// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 테스트용 사용자 데이터 (실제로는 DB에서 가져옴)
const users = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 기본 테스트 사용자 추가
const testUserId = '123';
users.set(testUserId, {
  userId: testUserId,
  username: 'test',
  email: 'test@example.com',
  password: '$2b$10$zQv5rLQr6tdCF3CIO3MqYO3CFSdoBOWDy9Z3xVjO.9PFcspfkXUZ.', // 'test123'의 해시
});

console.log('authController 로드됨, 테스트 사용자 설정됨');

// 로그인 기능 추가
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`로그인 시도 (컨트롤러): ${username}`);
    
    // 필수 필드 확인
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자 이름과 비밀번호가 필요합니다'
      });
    }
    
    // 테스트 계정 빠른 경로
    if (username === 'test' && password === 'test123') {
      const user = Array.from(users.values()).find(u => u.username === 'test');
      if (user) {
        console.log('테스트 사용자 로그인 성공');
        
        // JWT 토큰 생성 (실제 환경에서 사용)
        const token = jwt.sign(
          { userId: user.userId, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        return res.json({
          success: true,
          message: '로그인 성공 (컨트롤러)',
          userId: user.userId,
          username: user.username,
          token
        });
      }
    }
    
    // 일반 로그인 로직 (사용자 찾기)
    const user = Array.from(users.values()).find(u => u.username === username);
    
    if (!user) {
      console.log('로그인 실패: 사용자 없음');
      return res.status(401).json({
        success: false,
        message: '잘못된 인증 정보'
      });
    }
    
    // 비밀번호 검증
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log('로그인 실패: 비밀번호 불일치');
        return res.status(401).json({
          success: false,
          message: '잘못된 인증 정보'
        });
      }
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.userId, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log('로그인 성공');
      return res.json({
        success: true,
        message: '로그인 성공',
        userId: user.userId,
        username: user.username,
        token
      });
    } catch (bcryptError) {
      console.error('비밀번호 비교 중 오류:', bcryptError);
      // 개발 환경에서는 비밀번호 검증 오류가 있어도 로그인 허용 (테스트 목적)
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          success: true,
          message: '개발 모드 로그인 성공 (비밀번호 검증 생략)',
          userId: user.userId,
          username: user.username
        });
      }
      throw bcryptError;
    }
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 중 오류 발생',
      error: error.message
    });
  }
};

// 기존 회원가입 함수
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 로그 출력으로 받은 데이터 확인
    console.log('Registration attempt:', { username, email, password: password ? '[FILTERED]' : 'missing' });

    // 필수 필드 검증 - 이메일은 선택적으로 처리
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // 이메일이 없는 경우 유저네임으로 생성
    const userEmail = email || `${username}@example.com`;

    // 이미 존재하는 사용자인지 확인
    if (Array.from(users.values()).some(user => 
        user.username === username || user.email === userEmail
    )) {
      return res.status(400).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const userId = Date.now().toString();
    const newUser = {
      userId,
      username,
      email: userEmail,
      password: hashedPassword
    };

    // 사용자 저장
    users.set(userId, newUser);
    console.log(`사용자 등록 성공: ${username}`);

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 비밀번호 제외하고 응답
    return res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 등록되었습니다',
      user: {
        userId,
        username,
        email: userEmail
      },
      token
    });
  } catch (error) {
    console.error('회원가입 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '회원가입 중 오류 발생',
      error: error.message
    });
  }
};
