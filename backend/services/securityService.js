// backend/services/securityService.js
const createSecurityService = () => {
  // 보안 설정 상태를 저장할 객체 (실제 구현에서는 데이터베이스 사용)
  const userSecuritySettings = new Map();
  
  // 활동 로그 저장 (실제 구현에서는 데이터베이스 사용)
  const activityLogs = new Map();
  
  // 가상의 2FA 비밀키 저장소 (실제 구현에서는 암호화하여 DB에 저장)
  const twoFactorSecrets = new Map();
  
  // 2FA 설정
  const setup2FA = async (userId) => {
    try {
      // 실제 구현에서는 스펙드(speakeasy) 같은 라이브러리 사용해 OTP 비밀키 생성
      const secret = generateRandomSecret();
      twoFactorSecrets.set(userId, secret);
      
      // 사용자의 보안 설정 업데이트
      const userSettings = userSecuritySettings.get(userId) || {};
      userSecuritySettings.set(userId, {
        ...userSettings,
        twoFactorEnabled: true,
        twoFactorVerified: false
      });
      
      // 활동 로그 기록
      logUserActivity(userId, 'setup_2fa', {
        timestamp: Date.now(),
        status: 'pending_verification'
      });
      
      // 실제 구현에서는 QR 코드 생성
      const qrCodeUrl = `otpauth://totp/UBEX:${userId}?secret=${secret}&issuer=UBEX`;
      
      return {
        secret,
        qrCodeUrl,
        status: 'pending_verification'
      };
    } catch (error) {
      console.error(`Error setting up 2FA for user ${userId}:`, error);
      throw error;
    }
  };
  
  // 2FA 토큰 검증
  const verify2FA = async (userId, token) => {
    try {
      // 실제 구현에서는 스펙드(speakeasy) 라이브러리로 토큰 검증
      const secret = twoFactorSecrets.get(userId);
      if (!secret) {
        throw new Error('2FA not set up for this user');
      }
      
      // 간단한 토큰 검증 시뮬레이션 (실제로는 OTP 알고리즘으로 검증)
      const isValid = token === '123456' || simulateTokenValidation(token, secret);
      
      if (isValid) {
        // 사용자 설정 업데이트
        const userSettings = userSecuritySettings.get(userId) || {};
        userSecuritySettings.set(userId, {
          ...userSettings,
          twoFactorVerified: true,
          lastVerification: Date.now()
        });
        
        // 활동 로그 기록
        logUserActivity(userId, '2fa_verified', {
          timestamp: Date.now(),
          status: 'success'
        });
      } else {
        // 활동 로그 기록
        logUserActivity(userId, '2fa_verification_failed', {
          timestamp: Date.now(),
          status: 'failed'
        });
      }
      
      return { success: isValid };
    } catch (error) {
      console.error(`Error verifying 2FA for user ${userId}:`, error);
      throw error;
    }
  };
  
  // 사용자 활동 로깅
  const logUserActivity = async (userId, action, metadata = {}) => {
    try {
      const userLogs = activityLogs.get(userId) || [];
      
      const logEntry = {
        timestamp: Date.now(),
        action,
        ip: metadata.ip || '0.0.0.0',
        userAgent: metadata.userAgent || 'unknown',
        ...metadata
      };
      
      userLogs.push(logEntry);
      activityLogs.set(userId, userLogs);
      
      // 중요한 보안 활동은 별도 처리
      if (isSecuritySensitiveAction(action)) {
        // 실제 구현에서는 이메일이나 SMS 알림 전송
        console.log(`Security alert for user ${userId}: ${action}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error logging activity for user ${userId}:`, error);
      return false;
    }
  };
  
  // 사용자 활동 내역 조회
  const getUserActivityLogs = async (userId, page = 1, limit = 10) => {
    try {
      const userLogs = activityLogs.get(userId) || [];
      
      // 페이지네이션 적용
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedLogs = userLogs.slice(startIndex, endIndex);
      
      return {
        logs: paginatedLogs,
        total: userLogs.length,
        page,
        limit,
        totalPages: Math.ceil(userLogs.length / limit)
      };
    } catch (error) {
      console.error(`Error retrieving activity logs for user ${userId}:`, error);
      throw error;
    }
  };
  
  // 의심스러운 활동 탐지
  const checkSuspiciousActivity = async (userId, action, metadata = {}) => {
    try {
      // 실제 구현에서는 머신러닝 또는 규칙 기반 시스템으로 탐지
      const userLogs = activityLogs.get(userId) || [];
      
      // 최근 로그 분석 (예: 마지막 24시간)
      const recentLogs = userLogs.filter(log => 
        log.timestamp > Date.now() - 24 * 60 * 60 * 1000
      );
      
      // 의심스러운 패턴 확인 (예시)
      const suspiciousActivity = {
        isMultipleIPs: hasMultipleIPs(recentLogs, metadata.ip),
        isUnusualLocation: isUnusualLocation(recentLogs, metadata.geoip),
        isUnusualTime: isUnusualTime(recentLogs, Date.now()),
        isSuspiciousWithdrawal: action === 'withdrawal' && isSuspiciousAmount(metadata.amount),
      };
      
      const isSuspicious = Object.values(suspiciousActivity).some(value => value === true);
      
      if (isSuspicious) {
        // 의심스러운 활동 기록
        logUserActivity(userId, 'suspicious_activity_detected', {
          timestamp: Date.now(),
          details: suspiciousActivity,
          originalAction: action
        });
      }
      
      return {
        isSuspicious,
        details: suspiciousActivity,
        riskLevel: calculateRiskLevel(suspiciousActivity)
      };
    } catch (error) {
      console.error(`Error checking suspicious activity for user ${userId}:`, error);
      return { isSuspicious: false, error: error.message };
    }
  };
  
  // 인증 설정 업데이트
  const updateSecuritySettings = async (userId, settings) => {
    try {
      const currentSettings = userSecuritySettings.get(userId) || {};
      
      // 업데이트할 설정 병합
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: Date.now()
      };
      
      userSecuritySettings.set(userId, updatedSettings);
      
      // 활동 로그 기록
      logUserActivity(userId, 'security_settings_updated', {
        timestamp: Date.now(),
        updatedFields: Object.keys(settings)
      });
      
      return updatedSettings;
    } catch (error) {
      console.error(`Error updating security settings for user ${userId}:`, error);
      throw error;
    }
  };
  
  // 보안 설정 조회
  const getSecuritySettings = async (userId) => {
    return userSecuritySettings.get(userId) || {
      twoFactorEnabled: false,
      twoFactorVerified: false,
      loginNotifications: false,
      withdrawalConfirmation: true,
      lastUpdated: null
    };
  };
  
  // ===== 헬퍼 함수들 =====
  
  // 랜덤 2FA 비밀키 생성
  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };
  
  // 토큰 검증 시뮬레이션
  const simulateTokenValidation = (token, secret) => {
    // 실제 구현에서는 TOTP 알고리즘으로 검증
    // 테스트 목적으로 간단히 구현
    return token.length === 6 && /^\d+$/.test(token) && Math.random() > 0.2;
  };
  
  // 중요 보안 활동 여부 확인
  const isSecuritySensitiveAction = (action) => {
    const securityActions = [
      'login', 'password_change', 'email_change', 'withdrawal',
      'api_key_created', 'api_key_deleted', '2fa_setup', '2fa_disabled'
    ];
    return securityActions.includes(action);
  };
  
  // 여러 IP에서 접속했는지 확인
  const hasMultipleIPs = (logs, currentIp) => {
    const uniqueIPs = new Set(logs.map(log => log.ip));
    return uniqueIPs.size > 2 || (uniqueIPs.size === 2 && !uniqueIPs.has(currentIp));
  };
  
  // 평소와 다른 위치에서 접속했는지 확인
  const isUnusualLocation = (logs, geoip) => {
    // 실제 구현에서는 GeoIP DB를 사용하여 위치 확인
    return Math.random() < 0.1; // 10% 확률로 비정상 위치로 판단 (테스트용)
  };
  
  // 평소와 다른 시간에 접속했는지 확인
  const isUnusualTime = (logs, currentTime) => {
    // 실제 구현에서는 사용자의 일반적인 활동 시간 패턴 분석
    return Math.random() < 0.05; // 5% 확률로 비정상 시간으로 판단 (테스트용)
  };
  
  // 비정상적인 출금 금액인지 확인
  const isSuspiciousAmount = (amount) => {
    // 실제 구현에서는 사용자의 일반적인 출금 패턴 분석
    return amount > 10; // 예시: 10 BTC 이상 출금시 의심
  };
  
  // 위험 수준 계산
  const calculateRiskLevel = (suspiciousFlags) => {
    const riskFactors = Object.values(suspiciousFlags).filter(Boolean).length;
    
    if (riskFactors === 0) return 'low';
    if (riskFactors === 1) return 'medium';
    return 'high';
  };
  
  return {
    setup2FA,
    verify2FA,
    logUserActivity,
    getUserActivityLogs,
    checkSuspiciousActivity,
    updateSecuritySettings,
    getSecuritySettings
  };
};

module.exports = createSecurityService;
