const whitelistRateLimit = require('../../backend/middlewares/whitelistRateLimit');

describe('whitelistRateLimit middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    whitelistRateLimit.reset();
    req = { user: { id: 1 }, ip: '1.1.1.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('allows up to 5 registrations per user per day', () => {
    for (let i = 0; i < 5; i++) {
      whitelistRateLimit(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(5);

    whitelistRateLimit(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalled();
  });

  test('limits 10 attempts per IP per hour', () => {
    for (let i = 0; i < 10; i++) {
      req.user.id = i;
      whitelistRateLimit(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(10);

    res.status.mockClear();
    res.json.mockClear();
    next.mockClear();
    req.user.id = 999;
    whitelistRateLimit(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalled();
  });
});
