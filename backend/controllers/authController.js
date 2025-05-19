   // backend/controllers/authController.js
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');
   const { User } = require('../models');
   const jwtConfig = require('../config/jwtConfig');

   // 임시 사용자 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
   let users = [
     // 초기 테스트 사용자가 필요하다면 여기에 추가
     // 예: { id: 1, username: 'test', email: 'test@example.com', passwordHash: bcrypt.hashSync('password123', 10) }
   ];
   let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

   console.log('[authController] 모듈 로드됨. 초기 사용자 수:', users.length, '다음 사용자 ID:', nextUserId);
   if (jwtConfig.secret) {
     console.log('[authController] JWT_SECRET 로드 성공.');
   } else {
     console.error('[authController] !!! JWT_SECRET 로드 실패. ../config/jwtConfig.js 파일을 확인하세요. !!!');
   }

   // JWT 토큰 생성 함수
   const generateToken = (user) => {
     return jwt.sign(
       { 
         id: user.id,
         email: user.email,
         username: user.username
       },
       jwtConfig.secret,
       { 
         expiresIn: jwtConfig.expiresIn,
         algorithm: jwtConfig.algorithm
       }
     );
   };

   // 회원가입 로직
   exports.register = async (req, res) => {
     try {
       const { username, email, password } = req.body;

       // 이메일 중복 체크
       const existingEmail = await User.findOne({ where: { email } });
       if (existingEmail) {
         return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
       }

       // 사용자명 중복 체크
       const existingUsername = await User.findOne({ where: { username } });
       if (existingUsername) {
         return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
       }

       // 비밀번호 해시화
       const hashedPassword = await bcrypt.hash(password, 10);

       // 사용자 생성
       const user = await User.create({
         username,
         email,
         password: hashedPassword
       });

       // 비밀번호 제외하고 JWT 발급
       const { password: _, ...userWithoutPassword } = user.toJSON();
       const token = generateToken(user);

       res.status(201).json({ 
         success: true,
         message: '회원가입이 완료되었습니다.',
         token, 
         user: userWithoutPassword 
       });
     } catch (error) {
       console.error('회원가입 오류:', error);
       res.status(500).json({ 
         success: false,
         message: '회원가입 중 오류가 발생했습니다.' 
       });
     }
   };

   // 로그인 로직
   exports.login = async (req, res) => {
     try {
       const { email, password } = req.body;

       // 사용자 찾기
       const user = await User.findOne({ where: { email } });
       if (!user) {
         return res.status(401).json({ 
           success: false,
           message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
         });
       }

       // 비밀번호 확인
       const isValidPassword = await bcrypt.compare(password, user.password);
       if (!isValidPassword) {
         return res.status(401).json({ 
           success: false,
           message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
         });
       }

       // 비밀번호 제외하고 JWT 발급
       const { password: _, ...userWithoutPassword } = user.toJSON();
       const token = generateToken(user);

       res.json({ 
         success: true,
         message: '로그인 성공',
         token, 
         user: userWithoutPassword 
       });
     } catch (error) {
       console.error('로그인 오류:', error);
       res.status(500).json({ 
         success: false,
         message: '로그인 중 오류가 발생했습니다.' 
       });
     }
   };

   // 토큰 갱신 로직
   exports.refreshToken = async (req, res) => {
     try {
       const user = await User.findByPk(req.user.id);
       if (!user) {
         return res.status(404).json({ 
           success: false,
           message: '사용자를 찾을 수 없습니다.' 
         });
       }

       const token = generateToken(user);
       res.json({ 
         success: true,
         message: '토큰이 갱신되었습니다.',
         token 
       });
     } catch (error) {
       console.error('토큰 갱신 오류:', error);
       res.status(500).json({ 
         success: false,
         message: '토큰 갱신 중 오류가 발생했습니다.' 
       });
     }
   };
   
