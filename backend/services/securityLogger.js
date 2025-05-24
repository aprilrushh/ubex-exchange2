// backend/services/securityLogger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'security.log');

function write(level, msg) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`;
  fs.appendFile(logFile, line, err => {
    if (err) console.error('security log write error', err);
  });
}

module.exports = {
  whitelistAdd: (userId, coin, address) =>
    write('INFO', `WHITELIST_ADD user:${userId} coin:${coin} address:${address}`),
  whitelistDelete: (userId, coin, address) =>
    write('INFO', `WHITELIST_DELETE user:${userId} coin:${coin} address:${address}`),
  whitelistConfirm: (userId, coin, address) =>
    write('INFO', `WHITELIST_CONFIRM user:${userId} coin:${coin} address:${address}`),
  suspiciousPattern: (userId, detail) =>
    write('WARN', `SUSPICIOUS_PATTERN user:${userId} detail:${JSON.stringify(detail)}`),
  alert: msg => write('ALERT', msg)
};
