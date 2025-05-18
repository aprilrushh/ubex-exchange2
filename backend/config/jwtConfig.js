// backend/config/jwtConfig.js

// JWT 시크릿 키: 모든 JWT 관련 작업에서 이 값을 사용합니다.
// 실제 프로덕션 환경에서는 이 값을 환경 변수로 관리하는 것이 매우 중요합니다.
// 예: const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_if_env_not_set';
const JWT_SECRET = 'mySuperSecretKeyForUbexExchange2025!'; // 이전과 동일한 하드코딩된 키

module.exports = {
  JWT_SECRET,
};
