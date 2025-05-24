const walletController = require('../../backend/controllers/walletController');

// Mock response object
const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('setDepositAddress validation', () => {
  test('returns 400 when address missing', async () => {
    const req = {
      params: { coin: 'BTC' },
      body: { address: '' },
      user: { id: 1 },
      app: { get: () => 3035 },
    };
    const res = createRes();

    await walletController.setDepositAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: '주소가 필요합니다.' });
  });

  test('returns 400 for invalid ethereum address', async () => {
    const req = {
      params: { coin: 'ETH' },
      body: { address: '0x123' },
      user: { id: 1 },
      app: { get: () => 3035 },
    };
    const res = createRes();

    await walletController.setDepositAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid Ethereum address.' });
  });
});

describe('addWhitelist validation', () => {
  test('returns 400 for invalid ethereum address', async () => {
    const req = {
      body: { coin: 'ETH', address: '0x123', label: 'bad' },
      user: { id: 1 },
      app: { get: () => 3035 },
    };
    const res = createRes();

    await walletController.addWhitelist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid Ethereum address.' });
  });
});

describe('requestWithdrawal validation', () => {
  test('returns 400 for invalid ethereum address', async () => {
    const req = {
      body: { coin: 'ETH', amount: '1', address: '0x123' },
      user: { id: 1 },
      app: { get: () => 3035 },
    };
    const res = createRes();

    await walletController.requestWithdrawal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid Ethereum address.' });
  });
});
