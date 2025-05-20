const jwt = require('jsonwebtoken');
const authMiddleware = require('../../backend/middleware/authMiddleware');
const jwtConfig = require('../../backend/config/jwtConfig');

describe('authMiddleware', () => {
  test('adds user id to req when token is valid', () => {
    const userId = 123;
    const token = jwt.sign({ userId }, jwtConfig.secret, { expiresIn: '1h' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: userId });
  });
});
