// backend/services/blockchainListener.js
'use strict';
const Web3 = require('web3');           // v1.x 설치 후
const db   = require('../models');
const { userWallets, ensureUserWallet } = require('./balanceStore');

module.exports.startListening = () => {
  const wsUrl   = process.env.WS_RPC_URL || 'ws://127.0.0.1:8545';
  const provider = new Web3.providers.WebsocketProvider(wsUrl);
  const web3     = new Web3(provider);

  web3.eth.subscribe('newBlockHeaders', async (err, header) => {
    if (err) return console.error('BlockListener error:', err);
    const block = await web3.eth.getBlock(header.number, true);
    for (const tx of block.transactions || []) {
      const wallet = await db.Wallet.findOne({ where: { address: tx.to } });
      if (wallet) {
        const amountStr = web3.utils.fromWei(tx.value, 'ether');
        await db.Deposit.create({
          wallet_id: wallet.id,
          tx_hash:   tx.hash,
          amount:    amountStr,
          confirmed: false
        });

        const userId = wallet.user_id;
        const coinSymbol = wallet.coin_symbol;
        ensureUserWallet(userId);
        const amount = parseFloat(amountStr);
        userWallets[userId][coinSymbol].available += amount;
        userWallets[userId][coinSymbol].total += amount;
        // TODO: Persist balances to DB if persistent storage is added
        console.log(`[Deposit] ${tx.to} ← ${tx.hash} (${amountStr} ${coinSymbol})`);
        console.log('[Deposit] Updated balance:', userWallets[userId][coinSymbol]);
      }
    }
  })
  .on('connected', subId => console.log(`[BlockListener] Subscribed: ${subId}`));
};
