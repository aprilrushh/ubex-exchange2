// backend/config/jwtConfig.js

require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h',
  algorithm: 'HS256'
};

module.exports = jwtConfig;
