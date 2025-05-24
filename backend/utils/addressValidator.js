const Web3 = require('web3');
const web3 = new Web3();

function validateEthereumAddress(address) {
  return typeof address === 'string' && web3.utils.isAddress(address);
}

module.exports = validateEthereumAddress;
