jest.mock('../../backend/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Wallet: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Withdrawal: {
    create: jest.fn(),
  },
}));

jest.mock('../../backend/services/blockchainService', () => () => ({
  generateAddress: jest.fn().mockResolvedValue({ address: 'addr1', privateKey: 'pk1' }),
  sendTransaction: jest.fn().mockResolvedValue({ txHash: 'tx123' }),
}));

const jwt = require('jsonwebtoken');
const jwtConfig = require('../../backend/config/jwtConfig');
const authController = require('../../backend/controllers/authController');
const walletController = require('../../backend/controllers/walletController');
const db = require('../../backend/models');

const createRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

describe('registration to withdrawal flow', () => {
  test('user can register and withdraw', async () => {
    db.User.findOne.mockResolvedValue(null);
    db.User.create.mockResolvedValue({
      id: 1,
      username: 'test',
      email: 'test@example.com',
      password: 'hashed',
      toJSON() { return { id: 1, username: 'test', email: 'test@example.com' }; },
    });
    db.Wallet.findOne.mockResolvedValue({ id: 1, user_id: 1, coin_symbol: 'BTC', address: 'addr1', private_key: 'pk1' });
    db.Withdrawal.create.mockResolvedValue({ id: 1, wallet_id: 1, amount: 0.1, tx_hash: 'tx123', status: 'PENDING', created_at: new Date() });

    const reqReg = { body: { username: 'test', email: 'test@example.com', password: 'pass' } };
    const resReg = createRes();
    await authController.register(reqReg, resReg);
    expect(resReg.status).toHaveBeenCalledWith(201);
    const token = resReg.json.mock.calls[0][0].token;
    const userId = jwt.verify(token, jwtConfig.secret).userId;

    const reqWithdraw = {
      body: { coin: 'BTC', amount: 0.1, address: 'destAddr' },
      user: { id: userId },
      app: { get: () => 3035 },
    };
    const resWithdraw = createRes();
    await walletController.requestWithdrawal(reqWithdraw, resWithdraw);
    expect(resWithdraw.status).toHaveBeenCalledWith(201);
  });
});
