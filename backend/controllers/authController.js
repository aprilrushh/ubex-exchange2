   // backend/controllers/authController.js
   const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const { JWT_SECRET } = require('../config/jwtConfig'); // 중앙 설정 파일에서 JWT_SECRET 가져오기

   // 임시 사용자 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
   let users = [
     // 초기 테스트 사용자가 필요하다면 여기에 추가
     // 예: { id: 1, username: 'test', email: 'test@example.com', passwordHash: bcrypt.hashSync('password123', 10) }
   ];
   let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

   console.log('[authController] 모듈 로드됨. 초기 사용자 수:', users.length, '다음 사용자 ID:', nextUserId);
   if (JWT_SECRET) {
     console.log('[authController] JWT_SECRET 로드 성공.');
   } else {
     console.error('[authController] !!! JWT_SECRET 로드 실패. ../config/jwtConfig.js 파일을 확인하세요. !!!');
   }

   // 회원가입 로직
   exports.register = async (req, res) => {
     const { username, email, password } = req.body;
     const currentPort = req.app.get('port') || process.env.PORT || 3030; // 현재 실행 포트 가져오기
     console.log(`[Port:${currentPort}] [authController] /register 요청 받음:`, { username, email, password: '[FILTERED]' });

     if (!username || !email || !password) {
       return res.status(400).json({ success: false, message: '사용자 이름, 이메일, 비밀번호를 모두 입력해주세요.' });
     }
     if (password.length < 6) {
       return res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야 합니다.' });
     }
     if (users.some(user => user.email === email)) {
       return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
     }
     if (users.some(user => user.username === username)) {
       return res.status(409).json({ success: false, message: '이미 사용 중인 사용자 이름입니다.' });
     }

     try {
       const passwordHash = await bcrypt.hash(password, 10);
       const newUser = {
         id: nextUserId++,
         username,
         email,
         passwordHash,
       };
       users.push(newUser);
       console.log(`[Port:${currentPort}] [authController] 사용자 등록 성공: ${username} (${email}), ID: ${newUser.id}`);
       console.log(`[Port:${currentPort}] [authController] 현재 사용자 목록:`, users.map(u => ({id: u.id, email: u.email, username: u.username })));


       // 회원가입 성공 시 바로 토큰 발급 (선택 사항)
       const token = jwt.sign(
         { id: newUser.id, email: newUser.email, username: newUser.username },
         JWT_SECRET,
         { expiresIn: '1h' }
       );
       const userResponse = { id: newUser.id, email: newUser.email, username: newUser.username };

       res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다 (컨트롤러)',
         user: userResponse,
         token: token
       });
     } catch (error) {
       console.error(`[Port:${currentPort}] [authController] 회원가입 처리 중 오류:`, error);
       res.status(500).json({ success: false, message: '서버 내부 오류로 회원가입에 실패했습니다.' });
     }
   };

   // 로그인 로직
   exports.login = async (req, res) => {
     const { email, password } = req.body;
     const currentPort = req.app.get('port') || process.env.PORT || 3030;
     console.log(`[Port:${currentPort}] [authController] /login 요청 받음: ${email}`);

     const user = users.find(u => u.email === email);

     if (!user) {
       console.log(`[Port:${currentPort}] [authController] 로그인 실패: 사용자를 찾을 수 없음 - ${email}`);
       return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다 (컨트롤러).' });
     }

     const isMatch = await bcrypt.compare(password, user.passwordHash);

     if (!isMatch) {
       console.log(`[Port:${currentPort}] [authController] 로그인 실패: 비밀번호 불일치 - ${email}`);
       return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다 (컨트롤러).' });
     }

     // 로그인 성공: JWT 생성
     const token = jwt.sign(
       { id: user.id, email: user.email, username: user.username },
       JWT_SECRET,
       { expiresIn: '1h' }
     );

     const userResponse = { id: user.id, email: user.email, username: user.username };
     console.log(`[Port:${currentPort}] [authController] 로그인 성공: ${email} (ID: ${user.id})`);
     res.json({
       success: true,
       message: '로그인 성공 (컨트롤러)',
       token,
       user: userResponse
     });
   };
   
