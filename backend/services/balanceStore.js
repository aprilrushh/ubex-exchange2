// backend/services/balanceStore.js
// Simple in-memory wallet balance store used by walletController and blockchainListener

const demoCoins = ['BTC', 'ETH', 'XRP', 'ADA', 'DOT', 'LAYER', 'KAITO', 'STPT', 'MOVE', 'USDT', 'KRW'];

// 초기 데모 잔액 (테스트용)
const userWallets = {
  1: {
    BTC:   { available: 0.5,    inOrder: 0, total: 0.5 },
    ETH:   { available: 5,      inOrder: 0, total: 5 },
    XRP:   { available: 1000,   inOrder: 0, total: 1000 },
    ADA:   { available: 2000,   inOrder: 0, total: 2000 },
    DOT:   { available: 300,    inOrder: 0, total: 300 },
    LAYER: { available: 5000,   inOrder: 0, total: 5000 },
    KAITO: { available: 5000,   inOrder: 0, total: 5000 },
    STPT:  { available: 10000,  inOrder: 0, total: 10000 },
    MOVE:  { available: 5000,   inOrder: 0, total: 5000 },
    USDT:  { available: 1000,   inOrder: 0, total: 1000 },
    KRW:   { available: 5000000, inOrder: 0, total: 5000000 }
  },
  2: {
    BTC: { available: 0.1, inOrder: 0, total: 0.1 },
    ETH: { available: 2,   inOrder: 0, total: 2 },
    USDT:{ available: 500, inOrder: 0, total: 500 },
    KRW: { available: 1000000, inOrder: 0, total: 1000000 }
  }
};

function ensureUserWallet(userId) {
  if (!userWallets[userId]) {
    userWallets[userId] = {};
  }
  demoCoins.forEach(sym => {
    if (!userWallets[userId][sym]) {
      userWallets[userId][sym] = { available: 0, inOrder: 0, total: 0 };
    }
  });
}

module.exports = {
  userWallets,
  ensureUserWallet,
  demoCoins
};
