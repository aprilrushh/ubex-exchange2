// backend/services/blockchainListener.js
const { ethers } = require('ethers');

class BlockchainListener {
  constructor() {
    this.provider = null;
    this.isConnected = false;
    this._isListening = false; // 🔧 private 속성으로 변경
    this.watchedAddresses = new Set();
  }

  async initialize() {
    try {
      console.log('[BE BlockListener] 초기화 시작...');
      
      // 환경변수 확인
      if (!process.env.ETHEREUM_RPC_URL) {
        throw new Error('ETHEREUM_RPC_URL이 설정되지 않았습니다');
      }
      
      this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      
      // 네트워크 확인
      const network = await this.provider.getNetwork();
      console.log(`[BE BlockListener] 이더리움 노드에 연결되었습니다: ${network.name}`);
      
      this.isConnected = true;
      this._isListening = false;
      
      // 블록 리스너 시작
      this.startBlockListener();
      
      return true;
      
    } catch (error) {
      console.error('[BE BlockListener] 초기화 실패:', error.message);
      this.isConnected = false;
      this._isListening = false;
      
      // 초기화 실패해도 서버는 계속 실행
      return false;
    }
  }

  startBlockListener() {
    if (!this.provider) {
      console.error('[BE BlockListener] Provider가 초기화되지 않았습니다');
      return;
    }

    if (this._isListening) {
      console.log('[BE BlockListener] 이미 블록 리스닝 중입니다');
      return;
    }

    try {
      console.log('[BE BlockListener] 블록 리스닝 시작...');
      
      // 🔧 블록 리스너 등록
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

          // 블록 이벤트 발생
          this.emitBlockEvent({
            blockNumber,
            transactionCount: block.transactions ? block.transactions.length : 0,
            timestamp: block.timestamp
          });

        } catch (error) {
          console.error(`[BE BlockListener] 블록 ${blockNumber} 처리 중 오류:`, error.message);
          // 개별 블록 처리 오류는 무시하고 계속 진행
        }
      });
      
      this._isListening = true;
      console.log('[BE BlockListener] 블록 리스닝이 시작되었습니다.');
      
    } catch (error) {
      console.error('[BE BlockListener] 블록 리스너 시작 실패:', error.message);
      this._isListening = false;
    }
  }

  // 🔧 블록 이벤트 발생 함수 (오류 해결됨)
  emitBlockEvent(blockData) {
    try {
      // WebSocket을 통해 클라이언트에 블록 정보 전송
      if (global.io) {
        global.io.emit('newBlock', blockData);
        console.log(`[BE BlockListener] 블록 이벤트 전송: ${blockData.blockNumber}`);
      } else {
        console.log(`[BE BlockListener] WebSocket 없음 - 블록 ${blockData.blockNumber} 로그만 출력`);
      }
      
    } catch (error) {
      console.error('[BE BlockListener] 블록 이벤트 발생 오류:', error.message);
    }
  }

  async processBlockTransactions(block) {
    try {
      // 감시 중인 주소가 없으면 스킵
      if (this.watchedAddresses.size === 0) {
        return;
      }

      for (const txHash of block.transactions) {
        try {
          const tx = await this.provider.getTransaction(txHash);
          
          if (tx && tx.to && this.watchedAddresses.has(tx.to.toLowerCase())) {
            const amount = ethers.formatEther(tx.value);
            console.log(`[BE BlockListener] 입금 감지: ${tx.to} ← ${amount} ETH (from: ${tx.from})`);
            
            // 입금 처리
            await this.processDeposit({
              address: tx.to,
              amount: amount,
              txHash: tx.hash,
              blockNumber: block.number,
              from: tx.from,
              gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0'
            });
          }
        } catch (txError) {
          console.error(`[BE BlockListener] 트랜잭션 ${txHash} 처리 오류:`, txError.message);
          // 개별 트랜잭션 오류는 무시하고 계속
        }
      }
    } catch (error) {
      console.error('[BE BlockListener] 블록 트랜잭션 처리 오류:', error.message);
    }
  }

  // 🔧 주소 감시 추가
  addWatchedAddress(address) {
    if (!address) {
      console.error('[BE BlockListener] 유효하지 않은 주소');
      return false;
    }
    
    const normalizedAddress = address.toLowerCase();
    this.watchedAddresses.add(normalizedAddress);
    console.log(`[BE BlockListener] 주소 감시 추가: ${address} (총 ${this.watchedAddresses.size}개)`);
    return true;
  }

  // 🔧 주소 감시 제거
  removeWatchedAddress(address) {
    if (!address) return false;
    
    const normalizedAddress = address.toLowerCase();
    const removed = this.watchedAddresses.delete(normalizedAddress);
    if (removed) {
      console.log(`[BE BlockListener] 주소 감시 제거: ${address}`);
    }
    return removed;
  }

  async processDeposit(depositData) {
    try {
      console.log('[BE BlockListener] 💰 입금 처리 시작:', {
        address: depositData.address,
        amount: depositData.amount,
        txHash: depositData.txHash.slice(0, 10) + '...'
      });
      
      // WebSocket으로 프론트엔드에 실시간 알림
      if (global.io) {
        global.io.emit('newDeposit', {
          ...depositData,
          status: 'pending',
          confirmations: 1,
          timestamp: new Date().toISOString()
        });
        console.log('[BE BlockListener] 실시간 입금 알림 전송됨');
      }
      
      // 임시: 콘솔 로그 (나중에 DB 저장 로직 추가)
      console.log(`[BE BlockListener] 💰 입금 완료: ${depositData.amount} ETH → ${depositData.address}`);
      
    } catch (error) {
      console.error('[BE BlockListener] 입금 처리 오류:', error.message);
    }
  }

  // 🔧 연결 상태 확인 (getter로 수정)
  get isListening() {
    return this._isListening && this.isConnected;
  }

  // 🔧 상태 정보 반환
  getStatus() {
    return {
      isConnected: this.isConnected,
      isListening: this._isListening,
      watchedAddresses: Array.from(this.watchedAddresses),
      networkUrl: process.env.ETHEREUM_RPC_URL ? '연결됨' : '미설정'
    };
  }

  // 🔧 리스너 중지
  stop() {
    try {
      if (this.provider && this._isListening) {
        this.provider.removeAllListeners('block');
        this._isListening = false;
        console.log('[BE BlockListener] 블록 리스너 중지됨');
      }
    } catch (error) {
      console.error('[BE BlockListener] 리스너 중지 오류:', error.message);
    }
  }

  // 🔧 수동 블록 확인 (테스트용)
  async checkLatestBlock() {
    try {
      if (!this.provider) {
        throw new Error('Provider가 초기화되지 않았습니다');
      }
      
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);
      
      console.log('[BE BlockListener] 최신 블록 정보:', {
        number: blockNumber,
        hash: block.hash,
        transactions: block.transactions.length
      });
      
      return block;
      
    } catch (error) {
      console.error('[BE BlockListener] 최신 블록 확인 오류:', error.message);
      return null;
    }
  }
}

// 🔧 싱글톤 인스턴스 생성
const blockchainListener = new BlockchainListener();

module.exports = blockchainListener;
module.exports = blockchainListener;