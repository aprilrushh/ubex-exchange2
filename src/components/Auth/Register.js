// src/components/Auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate import 추가
import { registerUser } from '../../services/auth'; // registerUser 서비스 함수 import
import './Auth.css'; // 스타일 파일 import

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!username) {
      setError('사용자 이름을 입력하세요.');
      return;
    }

    try {
      // auth.js의 registerUser 함수 호출
      const result = await registerUser({ username, email, password });
      console.log('회원가입 결과:', result);
      alert('회원가입 성공! 로그인 페이지로 이동합니다.'); // 성공 알림
      navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
    } catch (err) {
      // 오류 발생 시 메시지 표시
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">사용자 이름:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
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
            minLength={6} // 간단한 비밀번호 길이 제한 예시
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">회원가입</button>
      </form>
      <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
    </div>
  );
};

export default Register;
