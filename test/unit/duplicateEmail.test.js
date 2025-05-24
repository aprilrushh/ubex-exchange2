jest.mock('../../backend/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const authController = require('../../backend/controllers/authController');
const db = require('../../backend/models');

const createRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

describe('register duplicate email', () => {
  test('returns 400 when email already exists', async () => {
    db.User.findOne.mockResolvedValue({ id: 1 });

    const req = { body: { username: 'u', email: 'e@test.com', password: 'p' } };
    const res = createRes();
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: '이미 등록된 이메일입니다.' });
  });
});
