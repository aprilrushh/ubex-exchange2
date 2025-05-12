module.exports = {
  // src와 test 폴더를 모두 테스트 루트로 인식
  roots: ['<rootDir>/src', '<rootDir>/test'],
  // 단위 테스트 경로 매칭 패턴
  testMatch: ['**/test/unit/**/*.test.js'],
  // JS/JSX 파일을 Babel로 변환
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // 필요 시 확장자 지정
  moduleFileExtensions: ['js', 'jsx', 'json'],
}; 