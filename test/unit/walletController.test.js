jest.mock('../../backend/helpers/whitelistHelper', () => ({
  checkWhitelistAddress: jest.fn()
}));
jest.mock('../../backend/models', () => ({
  Wallet: { findOne: jest.fn() },
  Withdrawal: { create: jest.fn() },
  WhitelistAddress: { findOne: jest.fn() }
}));
const mockSendTransaction = jest.fn();
jest.mock('../../backend/services/blockchainService', () => {
  const svc = jest.fn(() => ({ sendTransaction: mockSendTransaction }));
  svc.mockSendTransaction = mockSendTransaction;
  return svc;
});

let requestWithdrawal;
let db;
let blockchainService;
let checkWhitelistAddress;

describe('requestWithdrawal whitelist check', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    ({ checkWhitelistAddress } = require('../../backend/helpers/whitelistHelper'));
    db = require('../../backend/models');
    blockchainService = require('../../backend/services/blockchainService');
    ({ requestWithdrawal } = require('../../backend/controllers/walletController'));
  });

  function createReq(amount = 0.1) {
    return {
      body: { coin: 'BTC', amount, address: 'DEST' },
      user: { id: 1 },
      app: { get: () => 3035 }
    };
  }

  test('fails when address not confirmed', async () => {
    checkWhitelistAddress.mockResolvedValue(false);
    db.Wallet.findOne.mockResolvedValue({ id: 1, address: 'FROM' });
    const req = createReq();
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await requestWithdrawal(req, res);

    expect(checkWhitelistAddress).toHaveBeenCalledWith(1, 'BTC', 'DEST');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: '등록된 출금 주소가 아닙니다.' });
    expect(blockchainService.mockSendTransaction).not.toHaveBeenCalled();
    expect(db.Withdrawal.create).not.toHaveBeenCalled();
  });

  test('succeeds when address confirmed', async () => {
    checkWhitelistAddress.mockResolvedValue(true);
    db.Wallet.findOne.mockResolvedValue({ id: 1, address: 'FROM' });
    blockchainService.mockSendTransaction.mockResolvedValue({ txHash: 'hash' });
    db.Withdrawal.create.mockResolvedValue({
      id: 1,
      wallet_id: 1,
      to_address: 'DEST',
      amount: 0.1,
      tx_hash: 'hash',
      status: 'PENDING',
      created_at: new Date()
    });

    const req = createReq();
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await requestWithdrawal(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.Withdrawal.create).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].success).toBe(true);
  });
});
