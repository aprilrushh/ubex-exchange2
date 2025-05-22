const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwtConfig');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ admin: true }, jwtConfig.secret, { expiresIn: '24h' });
  res.json({ token });
};
