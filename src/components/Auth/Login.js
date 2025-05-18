// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // useAuth 훅 import
import { loginUser } from '../../services/auth'; // 로그인 서비스 함수 import
import './Auth.css'; // 스타일 파일 import

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext의 login 함수 가져오기

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 이전 오류 메시지 초기화
    try {
      // auth.js의 loginUser 함수 호출
      const { token, user } = await loginUser({ email, password });
      // AuthContext의 login 함수 호출하여 상태 업데이트 및 로컬 스토리지 저장
      login(token, user);
      console.log('로그인 성공, 사용자:', user);
      navigate('/portfolio'); // 로그인 성공 시 포트폴리오 페이지로 이동
    } catch (err) {
      // 서비스에서 throw된 Error 객체의 message 사용
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">로그인</button>
      </form>
      <p>계정이 없으신가요? <Link to="/register">회원가입</Link></p>
    </div>
  );
};

export default Login;
