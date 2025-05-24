// backend/utils/addressValidator.js
// Simple Ethereum address validator

function validateEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

module.exports = validateEthereumAddress;
