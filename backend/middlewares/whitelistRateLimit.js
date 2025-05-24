const userCounters = new Map();
const ipCounters = new Map();

function checkLimit(map, key, limit, windowMs) {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || (now - entry.start) > windowMs) {
    map.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function reset() {
  userCounters.clear();
  ipCounters.clear();
}

function middleware(req, res, next) {
  const userId = req.user && req.user.id;
  const ip = req.ip;

  const userAllowed = checkLimit(userCounters, userId, 5, 24 * 60 * 60 * 1000);
  const ipAllowed = checkLimit(ipCounters, ip, 10, 60 * 60 * 1000);

  if (!userAllowed || !ipAllowed) {
    return res.status(429).json({ success: false, message: 'Too many attempts' });
  }
  return next();
}

middleware.reset = reset;

module.exports = middleware;
