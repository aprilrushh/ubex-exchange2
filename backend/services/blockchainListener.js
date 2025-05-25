// backend/services/blockchainListener.js
'use strict';
const Web3 = require('web3');           // v1.x 설치 후
const db   = require('../models');

module.exports.startListening = () => {
  const wsUrl = process.env.WS_RPC_URL || 'ws://localhost:8545';
  const provider = new Web3.providers.WebsocketProvider(wsUrl);
  const web3 = new Web3(provider);

  web3.eth.subscribe('newBlockHeaders', async (err, header) => {
    if (err) {
      console.error('BlockListener error:', err);
      return;
    }
    
    try {
      const block = await web3.eth.getBlock(header.number, true);
      console.log(`[BlockListener] New block received: ${block.number}`);
      
      for (const tx of block.transactions || []) {
        const wallet = await db.Wallet.findOne({ where: { address: tx.to } });
        if (wallet) {
          const amount = web3.utils.fromWei(tx.value, 'ether');
          console.log(`[Deposit] Found transaction to wallet ${tx.to}: ${amount} ETH`);
          
          await db.Deposit.create({
            wallet_id: wallet.id,
            tx_hash: tx.hash,
            amount: amount,
            confirmed: false,
            block_number: block.number,
            from_address: tx.from,
            to_address: tx.to
          });
          
          console.log(`[Deposit] Created deposit record for tx ${tx.hash}`);
        }
      }
    } catch (error) {
      console.error('[BlockListener] Error processing block:', error);
    }
  })
  .on('connected', subId => {
    console.log(`[BlockListener] Successfully subscribed to new blocks: ${subId}`);
  })
  .on('error', error => {
    console.error('[BlockListener] Subscription error:', error);
    // 재연결 로직 추가
    setTimeout(() => {
      console.log('[BlockListener] Attempting to reconnect...');
      startListening();
    }, 5000);
  });
};
