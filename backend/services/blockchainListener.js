// backend/services/blockchainListener.js
'use strict';
const { ethers } = require('ethers');
const { Wallet } = require('../models/Wallet');
const { Deposit } = require('../models/Deposit');
const { websocketService } = require('./websocketService');

class BlockchainListener {
  constructor() {
    this.provider = null;
    this.isListening = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5초
  }

  async startListening() {
    try {
      if (this.isListening) {
        console.log('[BE BlockListener] 이미 리스닝 중입니다.');
        return;
      }

      // Sepolia 테스트넷 URL 사용
      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/5265c45bc1b0428fb9ceaea55ca42706';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 연결 테스트
      const network = await this.provider.getNetwork();
      console.log('[BE BlockListener] 이더리움 노드에 연결되었습니다:', network.name);

      this.provider.on('block', async (blockNumber) => {
        try {
          console.log(`[BE BlockListener] 새 블록 수신: ${blockNumber}`);
          websocketService.emitBlockEvent('newBlock', { blockNumber });

          const block = await this.provider.getBlock(blockNumber, true);
          if (!block || !block.transactions) {
            console.log(`[BE BlockListener] 블록 ${blockNumber}에 트랜잭션이 없습니다.`);
            return;
          }

          for (const tx of block.transactions) {
            try {
              const wallet = await Wallet.findOne({ address: tx.to.toLowerCase() });
              if (wallet) {
                const valueInEth = ethers.formatEther(tx.value);
                console.log(`[BE BlockListener] 지갑 ${wallet.address}로 ${valueInEth} ETH 입금 감지`);

                const deposit = await Deposit.create({
                  user_id: wallet.user_id,
                  coin: 'ETH',
                  amount: valueInEth,
                  tx_hash: tx.hash,
                  status: 'pending',
                  block_number: blockNumber,
                  from_address: tx.from,
                  to_address: tx.to,
                  timestamp: new Date(block.timestamp * 1000)
                });

                websocketService.emitBlockEvent('newDeposit', {
                  depositId: deposit.id,
                  userId: wallet.user_id,
                  amount: valueInEth,
                  txHash: tx.hash
                });

                console.log(`[BE BlockListener] 입금 기록 생성 완료: ${deposit.id}`);
              }
            } catch (txError) {
              console.error(`[BE BlockListener] 트랜잭션 처리 중 오류:`, txError);
            }
          }
        } catch (blockError) {
          console.error(`[BE BlockListener] 블록 ${blockNumber} 처리 중 오류:`, blockError);
        }
      });

      this.isListening = true;
      this.reconnectAttempts = 0;
      console.log('[BE BlockListener] 블록 리스닝이 시작되었습니다.');

    } catch (error) {
      console.error('[BE BlockListener] 리스닝 시작 중 오류:', error);
      blockchainListener.handleError(error);
    }
  }

  async stopListening() {
    if (this.provider) {
      this.provider.removeAllListeners();
      this.isListening = false;
      console.log('[BE BlockListener] 리스닝이 중지되었습니다.');
    }
  }

  handleError(error) {
    console.error('[BE BlockListener] 오류 발생:', error);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[BE BlockListener] ${this.reconnectDelay/1000}초 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.stopListening();
        this.startListening();
      }, this.reconnectDelay);
    } else {
      console.error('[BE BlockListener] 최대 재연결 시도 횟수를 초과했습니다.');
      this.isListening = false;
    }
  }
}

const blockchainListener = new BlockchainListener();
module.exports = blockchainListener;
