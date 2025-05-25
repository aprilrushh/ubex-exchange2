// backend/services/blockchainListener.js
const { ethers } = require('ethers');

class BlockchainListener {
  constructor() {
    this.provider = null;
    this.isConnected = false;
    this.watchedAddresses = new Set();
  }

  async initialize() {
    try {
      console.log('[BE BlockListener] 초기화 시작...');
      
      this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      
      // 네트워크 확인
      const network = await this.provider.getNetwork();
      console.log(`[BE BlockListener] 이더리움 노드에 연결되었습니다: ${network.name}`);
      
      this.isConnected = true;
      this.startBlockListener();
      
    } catch (error) {
      console.error('[BE BlockListener] 초기화 실패:', error);
      this.isConnected = false;
    }
  }

  startBlockListener() {
    if (!this.provider) {
      console.error('[BE BlockListener] Provider가 없습니다');
      return;
    }

    console.log('[BE BlockListener] 블록 리스닝이 시작되었습니다.');
    
    // 🔧 수정된 블록 리스너
    this.provider.on('block', async (blockNumber) => {
      try {
        console.log(`[BE BlockListener] 새 블록 수신: ${blockNumber}`);
        
        // 블록 상세 정보 조회
        const block = await this.provider.getBlock(blockNumber);
        if (!block) {
          console.log(`[BE BlockListener] 블록 ${blockNumber} 정보 조회 실패`);
          return;
        }

        // 트랜잭션 처리
        if (block.transactions && block.transactions.length > 0) {
          console.log(`[BE BlockListener] 블록 ${blockNumber}에 ${block.transactions.length}개 트랜잭션`);
          await this.processBlockTransactions(block);
        }

        // 🔧 emitBlockEvent 함수 수정
        this.emitBlockEvent({
          blockNumber,
          transactionCount: block.transactions ? block.transactions.length : 0,
          timestamp: block.timestamp
        });

      } catch (error) {
        console.error(`[BE BlockListener] 블록 ${blockNumber} 처리 중 오류:`, error.message);
        // 에러가 발생해도 계속 진행
      }
    });
  }

  // 🆕 emitBlockEvent 함수 추가
  emitBlockEvent(blockData) {
    try {
      // WebSocket을 통해 클라이언트에 블록 정보 전송
      if (global.io) {
        global.io.emit('newBlock', blockData);
      }
      
      // 콘솔 로그
      console.log(`[BE BlockListener] 블록 이벤트 발생: ${blockData.blockNumber}`);
      
    } catch (error) {
      console.error('[BE BlockListener] 블록 이벤트 발생 오류:', error);
    }
  }

  async processBlockTransactions(block) {
    try {
      for (const txHash of block.transactions) {
        // 감시 중인 주소와 관련된 트랜잭션만 처리
        if (this.watchedAddresses.size > 0) {
          const tx = await this.provider.getTransaction(txHash);
          if (tx && this.watchedAddresses.has(tx.to)) {
            console.log(`[BE BlockListener] 입금 감지: ${tx.to} → ${ethers.formatEther(tx.value)} ETH`);
            
            // 입금 처리
            await this.processDeposit({
              address: tx.to,
              amount: ethers.formatEther(tx.value),
              txHash: tx.hash,
              blockNumber: block.number,
              from: tx.from
            });
          }
        }
      }
    } catch (error) {
      console.error('[BE BlockListener] 트랜잭션 처리 오류:', error);
    }
  }

  // 주소 감시 추가
  addWatchedAddress(address) {
    this.watchedAddresses.add(address.toLowerCase());
    console.log(`[BE BlockListener] 주소 감시 추가: ${address}`);
  }

  // 주소 감시 제거
  removeWatchedAddress(address) {
    this.watchedAddresses.delete(address.toLowerCase());
    console.log(`[BE BlockListener] 주소 감시 제거: ${address}`);
  }

  async processDeposit(depositData) {
    try {
      console.log('[BE BlockListener] 입금 처리:', depositData);
      
      // 임시: 콘솔 로그만 출력 (나중에 DB 저장 로직 추가)
      console.log(`💰 입금 감지: ${depositData.amount} ETH → ${depositData.address}`);
      
      // WebSocket으로 프론트엔드에 실시간 알림
      if (global.io) {
        global.io.emit('newDeposit', {
          ...depositData,
          status: 'pending',
          confirmations: 1,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('[BE BlockListener] 입금 처리 오류:', error);
    }
  }

  // 연결 상태 확인
  isListening() {
    return this.isConnected && this.provider;
  }

  // 리스너 중지
  stop() {
    if (this.provider) {
      this.provider.removeAllListeners('block');
      console.log('[BE BlockListener] 블록 리스너 중지됨');
    }
  }
}

// 싱글톤 인스턴스
const blockchainListener = new BlockchainListener();

module.exports = blockchainListener;