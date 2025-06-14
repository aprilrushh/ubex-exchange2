// backend/controllers/walletController.js

const crypto = require('crypto');
const Web3 = require('web3');
const web3 = new Web3();
const emailService = require('../services/emailService');
const validateEthereumAddress = require('../utils/addressValidator');
const whitelistConfig = require('../config/whitelist');

// 간단한 화이트리스트 추가 속도 제한 관리
const whitelistRateMap = new Map();
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const checkRateLimit = (userId) => {
  const now = Date.now();
  const arr = whitelistRateMap.get(userId) || [];
  const filtered = arr.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (filtered.length >= RATE_LIMIT_COUNT) return false;
  filtered.push(now);
  whitelistRateMap.set(userId, filtered);
  return true;
};

// 임시 사용자 잔액 저장소는 서비스 모듈에서 관리한다
const { userWallets, ensureUserWallet } = require('../services/balanceStore');

  // 임시 입출금 내역 저장소
  let transactionHistory = [];
  let nextTransactionId = 1;
  
  // Helper function to ensure user wallet exists is provided by balanceStore
  
  
  // DB 및 블록체인 서비스 불러오기
  const db = require('../models');
  const blockchainService = require('../services/blockchainService')();


  // 입금 주소 조회 로직
exports.getDepositAddress = async (req, res) => {
    try {
      const { coin } = req.params;
      const coinSymbol = coin.toUpperCase();
      const userId = req.user.id; // authMiddleware에서 설정
      const currentPort = req.app.get('port') || process.env.PORT || 3035;

      // 지갑이 이미 존재하면 재사용
      let wallet = await db.Wallet.findOne({
        where: { user_id: userId, coin_symbol: coinSymbol }
      });

      if (!wallet) {
        // 새 주소 생성 후 DB에 저장
        const { address, privateKey } = await blockchainService.generateAddress(coinSymbol);
        wallet = await db.Wallet.create({
          user_id: userId,
          coin_symbol: coinSymbol,
          address,
          private_key: privateKey
        });
      }

      console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 ${coinSymbol} 입금 주소 조회 요청.`);
      res.json({
        success: true,
        data: {
          coin: coinSymbol,
          address: wallet.address,
        }
      });
    } catch (error) {
      console.error('[WalletController] 입금 주소 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '입금 주소 조회 중 오류가 발생했습니다.'
      });
    }
  };

// 사용자가 입금 주소를 수동으로 지정
exports.setDepositAddress = async (req, res) => {
  try {
    const { coin } = req.params;
    const { address, privateKey } = req.body;
    const userId = req.user.id;
    const coinSymbol = coin.toUpperCase();
    const currentPort = req.app.get('port') || process.env.PORT || 3035;

    if (!address || address.trim() === '') {
      return res.status(400).json({ success: false, message: '주소가 필요합니다.' });
    }

    if (address.startsWith('0x') && !validateEthereumAddress(address)) {
      return res.status(400).json({ success: false, message: 'Invalid Ethereum address.' });
    }

    let wallet = await db.Wallet.findOne({
      where: { user_id: userId, coin_symbol: coinSymbol }
    });

    if (wallet) {
      await wallet.update({
        address,
        private_key: privateKey !== undefined ? privateKey : wallet.private_key
      });
    } else {
      await db.Wallet.create({
        user_id: userId,
        coin_symbol: coinSymbol,
        address,
        private_key: privateKey || ''
      });
    }

    console.log(
      `[Port:${currentPort}] 사용자 ID ${userId}의 ${coinSymbol} 입금 주소 설정: ${address}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[WalletController] 입금 주소 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '입금 주소 설정 중 오류가 발생했습니다.'
    });
  }
};
  
  // 출금 요청 로직
  exports.requestWithdrawal = async (req, res) => {
    try {
      const { coin, amount, address } = req.body; // coin은 coinSymbol과 동일하게 취급
      const userId = req.user.id;
      const currentPort = req.app.get('port') || process.env.PORT || 3035;
      const coinSymbol = coin.toUpperCase();
      const withdrawalAmount = parseFloat(amount);
  
      // 유효성 검사 (간단 예시)
      if (!coinSymbol || !address || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({ success: false, message: '필수 출금 정보(코인, 주소, 유효한 수량)가 누락되었거나 잘못되었습니다.' });
      }

      if (address.startsWith('0x') && !validateEthereumAddress(address)) {
        return res.status(400).json({ success: false, message: 'Invalid Ethereum address.' });
      }
  
      ensureUserWallet(userId); // 사용자 지갑 존재 확인 및 초기화

      // Enforce whitelist rules if enabled
      if (whitelistConfig.emailVerification) {
        const wl = await db.WhitelistAddress.findOne({
          where: { user_id: userId, coin_symbol: coinSymbol, address }
        });
        if (!wl) {
          return res.status(400).json({
            success: false,
            message: 'Whitelist address not registered.'
          });
        }
        if (!whitelistConfig.instantConfirm) {
          const validAfter =
            new Date(wl.created_at).getTime() +
            whitelistConfig.waitingPeriod * 1000;
          if (Date.now() < validAfter) {
            return res.status(400).json({
              success: false,
              message: 'Whitelist waiting period has not passed.'
            });
          }
        }
      }
  
      const userCoinWallet = userWallets[userId][coinSymbol];
      if (!userCoinWallet || userCoinWallet.available < withdrawalAmount) {
        const availableBalance = userCoinWallet ? userCoinWallet.available : 0;
        console.log(`[Port:${currentPort}] 출금 실패 (사용자 ID: ${userId}, 코인: ${coinSymbol}): 잔액 부족. 요청: ${withdrawalAmount}, 보유: ${availableBalance}`);
        return res.status(400).json({ success: false, message: `${coinSymbol} 출금 가능 잔액이 부족합니다. (보유: ${availableBalance})` });
      }
  
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, coin_symbol: coinSymbol }
      });
      if (!wallet) {
        return res.status(400).json({ success: false, message: `${coinSymbol} 지갑이 존재하지 않습니다.` });
      }

      const allowed = await checkWhitelistAddress(userId, coinSymbol, address);
      if (!allowed) {
        return res.status(400).json({ success: false, message: '등록된 출금 주소가 아닙니다.' });
      }

      // 실제 출금 처리 로직 (블록체인 트랜잭션 생성 및 DB 기록)
      userWallets[userId][coinSymbol].available -= withdrawalAmount;
      userWallets[userId][coinSymbol].total -= withdrawalAmount; // total도 함께 차감

      const tx = await blockchainService.sendTransaction(
        coinSymbol,
        wallet.address,
        address,
        withdrawalAmount.toString()
      );

      const withdrawal = await db.Withdrawal.create({
        wallet_id: wallet.id,
        to_address: address,
        amount: withdrawalAmount,
        tx_hash: tx.txHash,
        status: 'PENDING'
      });

      const withdrawRequest = {
        id: withdrawal.id,
        userId,
        type: 'WITHDRAWAL',
        coin: coinSymbol,
        amount: withdrawalAmount,
        address,
        status: withdrawal.status,
        txHash: tx.txHash,
        createdAt: withdrawal.created_at
      };
      transactionHistory.push(withdrawRequest);
  
      console.log(`[Port:${currentPort}] 출금 요청 접수 (사용자 ID: ${userId}):`, withdrawRequest);
      console.log(`[Port:${currentPort}] ${coinSymbol} 잔액 변경 후 (사용자 ID: ${userId}):`, userWallets[userId][coinSymbol]);
  
      res.status(201).json({
        success: true,
        message: `${coinSymbol} 출금 요청이 성공적으로 접수되었습니다. 관리자 승인 후 처리됩니다.`,
        data: withdrawRequest
      });
    } catch (error) {
      console.error('[WalletController] 출금 요청 오류:', error);
      res.status(500).json({
        success: false,
        message: '출금 요청 처리 중 오류가 발생했습니다.'
      });
    }
  };
  
  // 입금 내역 조회 로직
  exports.getDeposits = async (req, res) => {
    try {
      const userId = req.user.id;
      // const { coin, startDate, endDate, page = 1, limit = 20 } = req.query; // 페이징 및 필터링은 추후 구현
      const currentPort = req.app.get('port') || process.env.PORT || 3035;
  
      // DB에서 입금 기록 조회
      const userDeposits = await db.Deposit.findAll({
        include: [{ model: db.Wallet, where: { user_id: userId } }],
        order: [['id', 'DESC']]
      });
  
      console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 입금 내역 조회 요청. ${userDeposits.length}건 발견.`);
      res.json({
        success: true,
        data: {
          deposits: userDeposits,
          pagination: { /* page: parseInt(page), limit: parseInt(limit), total: userDeposits.length */ }
        }
      });
    } catch (error) {
      console.error('[WalletController] 입금 내역 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '입금 내역 조회 중 오류가 발생했습니다.'
      });
    }
  };
  
  // 출금 내역 조회 로직
  exports.getWithdrawals = async (req, res) => {
    try {
      const userId = req.user.id;
      // const { coin, startDate, endDate, page = 1, limit = 20 } = req.query; // 페이징 및 필터링은 추후 구현
      const currentPort = req.app.get('port') || process.env.PORT || 3035;
  
      // DB에서 출금 기록 조회
      const userWithdrawals = await db.Withdrawal.findAll({
        include: [{ model: db.Wallet, where: { user_id: userId } }],
        order: [['id', 'DESC']]
      });
      
      console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 출금 내역 조회 요청. ${userWithdrawals.length}건 발견.`);
      res.json({
        success: true,
        data: {
          withdrawals: userWithdrawals,
          pagination: { /* page: parseInt(page), limit: parseInt(limit), total: userWithdrawals.length */ }
        }
      });
    } catch (error) {
      console.error('[WalletController] 출금 내역 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출금 내역 조회 중 오류가 발생했습니다.'
      });
    }
  };
  
  // 특정 코인 잔액 조회 로직
  exports.getCoinBalance = async (req, res) => {
    try {
      const { coin } = req.params;
      const userId = req.user.id;
      const currentPort = req.app.get('port') || process.env.PORT || 3035;
      const coinSymbol = coin.toUpperCase();
  
      ensureUserWallet(userId); // 사용자 지갑 존재 확인 및 초기화
  
      const coinWallet = userWallets[userId][coinSymbol] || { available: 0, inOrder: 0, total: 0 };
  
      console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 ${coinSymbol} 잔액 조회 요청.`);
      res.json({
        success: true,
        data: {
          coin: coinSymbol,
          available: coinWallet.available.toString(),
          inOrder: coinWallet.inOrder.toString(),
          total: coinWallet.total.toString()
        }
      });
    } catch (error) {
      console.error('[WalletController] 특정 코인 잔액 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '잔액 조회 중 오류가 발생했습니다.'
      });
    }
  };
  
  // 전체 사용자 잔액 조회 로직 (이전 버전과의 호환성 또는 요약용)
exports.getUserBalances = async (req, res) => {
    const userId = req.user.id;
    const currentPort = req.app.get('port') || process.env.PORT || 3035;
  
    ensureUserWallet(userId);
    const balances = userWallets[userId];
  
    // 숫자형 잔액을 문자열로 변환하여 응답 (사용자님 코드 형식 참고)
    const responseBalances = {};
    for (const coin in balances) {
      responseBalances[coin] = balances[coin].available.toString(); // 우선 available만 반환하는 간단한 형태로
    }
  
  
    console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 전체 잔액 조회 요청. 잔액:`, responseBalances);
    res.status(200).json({
      success: true,
      data: responseBalances // 예: { BTC: "0.1", ETH: "2", KRW: "1000000" }
    });
  };

  // 화이트리스트 주소 목록 조회
  exports.listWhitelist = async (req, res) => {
    try {
      const { coin } = req.params;
      const userId = req.user.id;
      const coinSymbol = coin.toUpperCase();
      const currentPort = req.app.get('port') || process.env.PORT || 3035;

      const addresses = await db.WhitelistAddress.findAll({
        where: { user_id: userId, coin_symbol: coinSymbol },
        order: [['id', 'DESC']]
      });

      console.log(
        `[Port:${currentPort}] 사용자 ID ${userId}의 ${coinSymbol} 화이트리스트 조회 요청.`
      );
      res.json({ success: true, data: addresses });
    } catch (error) {
      console.error('[WalletController] 화이트리스트 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '화이트리스트 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 모든 화이트리스트 주소 목록 조회
  exports.listAllWhitelist = async (req, res) => {
    try {
      const userId = req.user.id;
      const currentPort = req.app.get('port') || process.env.PORT || 3035;

      const addresses = await db.WhitelistAddress.findAll({
        where: { user_id: userId },
        order: [['id', 'DESC']]
      });

      console.log(
        `[Port:${currentPort}] 사용자 ID ${userId}의 화이트리스트 전체 조회 요청.`
      );
      res.json({ success: true, data: addresses });
    } catch (error) {
      console.error('[WalletController] 전체 화이트리스트 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '화이트리스트 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 화이트리스트 주소 추가
  exports.addWhitelist = async (req, res) => {
    try {
      const { coin, address, label } = req.body;
      const userId = req.user.id;
      if (!coin) {
        return res.status(400).json({ success: false, message: '코인 정보가 필요합니다.' });
      }
      const coinSymbol = coin.toUpperCase();
      const currentPort = req.app.get('port') || process.env.PORT || 3035;

      if (!address) {
        return res.status(400).json({ success: false, message: '주소가 필요합니다.' });
      }



      const entry = await db.WhitelistAddress.create({
        user_id: userId,
        coin_symbol: coinSymbol,
        address,
        label,
        status: env === 'test' ? 'confirmed' : 'pending',
        confirmed_at: env === 'test' ? new Date() : null
      });



      console.log(
        `[Port:${currentPort}] 사용자 ID ${userId} ${coinSymbol} 화이트리스트 추가: ${address}`
      );
      res.status(201).json({
        success: true,
        data: { ...entry.toJSON(), confirmed, availableAfter }
      });
    } catch (error) {
      console.error('[WalletController] 화이트리스트 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: '화이트리스트 추가 중 오류가 발생했습니다.'
      });
    }
  };

  // 화이트리스트 주소 삭제
  exports.deleteWhitelist = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const currentPort = req.app.get('port') || process.env.PORT || 3035;

      const record = await db.WhitelistAddress.findOne({
        where: { id, user_id: userId }
      });

      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: '화이트리스트 항목을 찾을 수 없습니다.' });
      }

      const coinSymbol = record.coin_symbol;

      await db.WhitelistAddress.destroy({
        where: { id, user_id: userId }
      });

      console.log(
        `[Port:${currentPort}] 사용자 ID ${userId}의 화이트리스트 항목 삭제: ${id}`
      );
      await securityService.logUserActivity(userId, 'whitelist_deleted', {
        coin: coinSymbol,
        address: record.address,
        ip: req.ip
      });
      await securityService.checkSuspiciousActivity(userId, 'whitelist_deleted', {
        ip: req.ip,
        coin: coinSymbol
      });
      securityLogger.whitelistDelete(userId, coinSymbol, record.address);
      res.json({ success: true });
    } catch (error) {
      console.error('[WalletController] 화이트리스트 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '화이트리스트 삭제 중 오류가 발생했습니다.'
      });
    }
  };

  // 화이트리스트 주소 확인
exports.confirmWhitelistAddress = async (req, res) => {
    try {
      const { token } = req.body;
      const record = await db.WhitelistConfirmationToken.findOne({ where: { token, used: false } });
      if (!record) {
        return res.status(400).json({ success: false, message: '토큰이 유효하지 않습니다.' });
      }
      if (record.expires_at < new Date()) {
        return res.status(400).json({ success: false, message: '토큰이 만료되었습니다.' });
      }

      const whitelist = await db.WhitelistAddress.findOne({ where: { id: record.whitelist_id, user_id: record.user_id } });
      if (!whitelist) {
        return res.status(400).json({ success: false, message: '화이트리스트 항목을 찾을 수 없습니다.' });
      }

      await whitelist.update({ status: 'confirmed', confirmed_at: new Date() });
      await record.update({ used: true });

      res.json({ success: true });
    } catch (error) {
      console.error('[WalletController] 화이트리스트 확인 오류:', error);
      res.status(500).json({ success: false, message: '주소 확인 중 오류가 발생했습니다.' });
    }
  }; 

// 전체 화이트리스트 주소 조회
exports.listAllWhitelist = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentPort = req.app.get('port') || process.env.PORT || 3035;

    const addresses = await db.WhitelistAddress.findAll({
      where: { user_id: userId },
      order: [['id', 'DESC']]
    });

    console.log(
      `[Port:${currentPort}] 사용자 ID ${userId}의 전체 화이트리스트 조회 요청.`
    );
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('[WalletController] 전체 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '화이트리스트 조회 중 오류가 발생했습니다.'
    });
  }
};

// 화이트리스트 확인 메일 재전송
exports.resendWhitelistConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const currentPort = req.app.get('port') || process.env.PORT || 3035;

    const whitelist = await db.WhitelistAddress.findOne({
      where: { id, user_id: userId }
    });
    if (!whitelist) {
      return res
        .status(404)
        .json({ success: false, message: '화이트리스트 항목을 찾을 수 없습니다.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.WhitelistConfirmationToken.create({
      token,
      user_id: userId,
      whitelist_id: id,
      expires_at: expiresAt
    });

    const user = await db.User.findOne({ where: { id: userId } });
    if (user) {
      await emailService.sendConfirmationEmail(user.email, token);
    }

    console.log(
      `[Port:${currentPort}] 사용자 ID ${userId}의 화이트리스트 확인 메일 재전송: ${id}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[WalletController] 화이트리스트 확인 메일 재전송 오류:', error);
    res.status(500).json({
      success: false,
      message: '주소 확인 메일 재전송 중 오류가 발생했습니다.'
    });
  }
};
  