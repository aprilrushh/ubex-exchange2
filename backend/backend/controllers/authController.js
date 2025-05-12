// backend/controllers/authController.js

// 회원가입 요청을 처리하는 함수
exports.register = async (req, res) => {
  // 일단 요청이 잘 오는지 확인하기 위해 req.body를 로그로 출력
  console.log('회원가입 요청 본문:', req.body);
  res.status(201).json({ message: '회원가입 요청을 받았습니다. (아직 처리 로직 없음)' });
};
