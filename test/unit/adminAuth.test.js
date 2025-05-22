const jwt = require('jsonwebtoken');
const adminAuth = require('../../backend/middlewares/adminAuth');
const jwtConfig = require('../../backend/config/jwtConfig');

describe('adminAuth middleware', () => {
  test('allows request when token valid', () => {
    const token = jwt.sign({ admin: true }, jwtConfig.secret, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    adminAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.admin).toBe(true);
  });
});
