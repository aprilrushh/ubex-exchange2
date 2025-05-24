const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();

function loadBlacklist(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const entries = data.split(/\r?\n/).map(l => l.trim().toLowerCase()).filter(Boolean);
    return new Set(entries);
  } catch (err) {
    return new Set();
  }
}

async function validateEthereumAddress(address, options = {}) {
  if (typeof address !== 'string' || !web3.utils.isAddress(address)) {
    return { valid: false, message: '유효하지 않은 주소 형식입니다.' };
  }

  const checksum = web3.utils.toChecksumAddress(address);
  if (address !== checksum) {
    return { valid: false, message: '주소의 체크섬이 올바르지 않습니다.' };
  }

  const blacklistPath = options.blacklistPath || process.env.BLACKLIST_PATH;
  if (blacklistPath) {
    const blacklist = loadBlacklist(blacklistPath);
    if (blacklist.has(checksum.toLowerCase())) {
      return { valid: false, message: '블랙리스트에 등록된 주소입니다.' };
    }
  }

  if (typeof options.blacklistService === 'function') {
    const blocked = await options.blacklistService(checksum);
    if (blocked) {
      return { valid: false, message: '블랙리스트에 등록된 주소입니다.' };
    }
  }

  return { valid: true, checksumAddress: checksum };
}

module.exports = validateEthereumAddress;
