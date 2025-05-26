function validateEthereumAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

module.exports = validateEthereumAddress;
