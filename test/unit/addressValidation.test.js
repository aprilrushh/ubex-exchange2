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
});
