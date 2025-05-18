   // backend/routes/authRoutes.js
   const express = require('express');
   const router = express.Router();
   const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const { User } = require('../models');

   // 회원가입
   router.post('/register', async (req, res) => {
     try {
       const { username, email, password } = req.body;

       // 이메일 중복 체크
       const existingUser = await User.findOne({ where: { email } });
       if (existingUser) {
         return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
       }

       // 비밀번호 해시화
       const hashedPassword = await bcrypt.hash(password, 10);

       // 사용자 생성
       const user = await User.create({
         username,
         email,
         password: hashedPassword
       });

       // 비밀번호 제외하고 응답
       const { password: _, ...userWithoutPassword } = user.toJSON();
       res.status(201).json(userWithoutPassword);
     } catch (error) {
       console.error('회원가입 오류:', error);
       res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
     }
   });

   // 로그인
   router.post('/login', async (req, res) => {
     try {
       const { email, password } = req.body;

       // 사용자 찾기
       const user = await User.findOne({ where: { email } });
       if (!user) {
         return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
       }

       // 비밀번호 확인
       const isValidPassword = await bcrypt.compare(password, user.password);
       if (!isValidPassword) {
         return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
       }

       // 비밀번호 제외하고 JWT 발급
       const { password: _, ...userWithoutPassword } = user.toJSON();
       const token = jwt.sign(
         { id: user.id, email: user.email, username: user.username },
         process.env.JWT_SECRET,
         { expiresIn: '1h' }
       );

       // 토큰과 사용자 정보를 한 번에 응답
       res.json({ token, user: userWithoutPassword });
     } catch (error) {
       console.error('로그인 오류:', error);
       res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
     }
   });

   module.exports = router;
      
   
