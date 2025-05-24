// backend/services/logger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'app.log');

function write(level, msg) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`;
  fs.appendFile(logFile, line, err => {
    if (err) console.error('log write error', err);
  });
}

module.exports = {
  info: (msg) => write('INFO', msg),
  error: (msg) => write('ERROR', msg)
};
