require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASS || 'mysql',
    database: process.env.DB_NAME || 'ubex',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASS || 'mysql',
    database: process.env.DB_NAME || 'ubex',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASS || 'mysql',
    database: process.env.DB_NAME || 'ubex',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  }
};
