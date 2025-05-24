const ipAttempts = new Map();
const userAttempts = new Map();

function whitelistRateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip;
  const userId = req.user && req.user.id;

  // IP limit: 10 attempts per hour
  let ipData = ipAttempts.get(ip);
  if (!ipData) {
    ipData = { count: 0, lastReset: now };
    ipAttempts.set(ip, ipData);
  }
  if (now - ipData.lastReset >= 60 * 60 * 1000) {
    ipData.count = 0;
    ipData.lastReset = now;
  }
  if (ipData.count >= 10) {
    return res.status(429).json({
      success: false,
      message: 'IP당 시간당 최대 10회 시도만 허용됩니다.'
    });
  }
  ipData.count += 1;

  // User limit: 5 registrations per day
  let userData = userAttempts.get(userId);
  if (!userData) {
    userData = { count: 0, lastReset: now };
    userAttempts.set(userId, userData);
  }
  if (now - userData.lastReset >= 24 * 60 * 60 * 1000) {
    userData.count = 0;
    userData.lastReset = now;
  }
  if (userData.count >= 5) {
    return res.status(429).json({
      success: false,
      message: '하루 최대 5회의 화이트리스트 등록만 허용됩니다.'
    });
  }
  userData.count += 1;
  next();
}

whitelistRateLimit.reset = function () {
  ipAttempts.clear();
  userAttempts.clear();
};

module.exports = whitelistRateLimit;
