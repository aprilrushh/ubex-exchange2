const fs = require('fs');
const path = require('path');
const validateEthereumAddress = require('../../backend/utils/addressValidator');

describe('validateEthereumAddress', () => {
  const validAddr = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const lowerAddr = validAddr.toLowerCase();

  test('returns valid for checksum address', async () => {
    const { valid } = await validateEthereumAddress(validAddr);
    expect(valid).toBe(true);
  });

  test('fails for address with wrong checksum', async () => {
    const { valid } = await validateEthereumAddress(lowerAddr);
    expect(valid).toBe(false);
  });

  test('fails when address is blacklisted', async () => {
    const tmp = path.join(__dirname, 'blacklist.txt');
    fs.writeFileSync(tmp, validAddr.toLowerCase());
    const { valid } = await validateEthereumAddress(validAddr, { blacklistPath: tmp });
    fs.unlinkSync(tmp);
    expect(valid).toBe(false);
  });
});
