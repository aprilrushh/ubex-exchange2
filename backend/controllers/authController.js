   // backend/controllers/authController.js
   const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const jwtConfig = require('../config/jwtConfig');

   // 임시 사용자 데이터 저장소
   let users = [
     {
       id: 1,
       username: 'test',
       email: 'test@example.com',
       password: bcrypt.hashSync('test123', 10)
     }
   ];
   let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

   console.log('[authController] 모듈 로드됨. 초기 사용자 수:', users.length, '다음 사용자 ID:', nextUserId);
   if (jwtConfig.secret) {
     console.log('[authController] JWT_SECRET 로드 성공.');
   } else {
     console.error('[authController] !!! JWT_SECRET 로드 실패. ../config/jwtConfig.js 파일을 확인하세요. !!!');
   }

   // JWT 토큰 생성 함수
   const generateToken = (userId) => {
     try {
       if (!jwtConfig.secret) {
         throw new Error('JWT_SECRET is not configured');
       }
       const token = jwt.sign({ userId }, jwtConfig.secret, {
         expiresIn: '24h'
       });
       console.log('[authController] 토큰 생성 성공:', { userId });
       return token;
     } catch (error) {
       console.error('[authController] 토큰 생성 실패:', error);
       throw error;
     }
   };

   // 로그인 로직
   exports.login = async (req, res) => {
     try {
       const { email, password } = req.body;
       console.log('[authController] 로그인 시도:', { email });

       // 사용자 조회
       const user = users.find(u => u.email === email);
       if (!user) {
         console.log('[authController] 사용자를 찾을 수 없음:', email);
         return res.status(401).json({
           success: false,
           message: '이메일 또는 비밀번호가 올바르지 않습니다.'
         });
       }

       // 비밀번호 확인
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
         console.log('[authController] 비밀번호 불일치:', email);
         return res.status(401).json({
           success: false,
           message: '이메일 또는 비밀번호가 올바르지 않습니다.'
         });
       }

       // 토큰 생성
       const token = generateToken(user.id);
       console.log('[authController] 로그인 성공:', { userId: user.id, email: user.email });

       // 비밀번호 제외하고 사용자 정보 반환
       const { password: _, ...userWithoutPassword } = user;

       res.json({
         success: true,
         token,
         user: userWithoutPassword
       });
     } catch (error) {
       console.error('[authController] 로그인 실패:', error);
       res.status(500).json({
         success: false,
         message: '로그인 중 오류가 발생했습니다.'
       });
     }
   };

   // 회원가입 로직
   exports.register = async (req, res) => {
     try {
       const { username, email, password } = req.body;
       console.log('[authController] 회원가입 시도:', { username, email });

       // 이메일 중복 확인
       if (users.some(u => u.email === email)) {
         console.log('[authController] 이메일 중복:', email);
         return res.status(400).json({
           success: false,
           message: '이미 등록된 이메일입니다.'
         });
       }

       // 비밀번호 해시화
       const hashedPassword = await bcrypt.hash(password, 10);

       // 새 사용자 생성
       const newUser = {
         id: nextUserId++,
         username,
         email,
         password: hashedPassword
       };
       users.push(newUser);

       // 토큰 생성
       const token = generateToken(newUser.id);
       console.log('[authController] 회원가입 성공:', { userId: newUser.id, email: newUser.email });

       // 비밀번호 제외하고 사용자 정보 반환
       const { password: _, ...userWithoutPassword } = newUser;

       res.status(201).json({
         success: true,
         token,
         user: userWithoutPassword
       });
     } catch (error) {
       console.error('[authController] 회원가입 실패:', error);
       res.status(500).json({
         success: false,
         message: '회원가입 중 오류가 발생했습니다.'
       });
     }
   };

   // 토큰 갱신 로직
   exports.refreshToken = async (req, res) => {
     try {
      const userId = req.user.id;
      const token = generateToken(userId);
      console.log('[authController] 토큰 갱신 성공:', { userId });

       res.json({
         success: true,
         token
       });
     } catch (error) {
       console.error('[authController] 토큰 갱신 실패:', error);
       res.status(500).json({
         success: false,
         message: '토큰 갱신 중 오류가 발생했습니다.'
       });
     }
   };
   
