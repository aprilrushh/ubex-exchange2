const validateEthereumAddress = require('../../backend/utils/addressValidator');

describe('validateEthereumAddress', () => {
  const validAddr = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const invalidAddr = '0x123';

  test('returns true for valid address', () => {
    expect(validateEthereumAddress(validAddr)).toBe(true);
  });

  test('returns false for invalid address', () => {
    expect(validateEthereumAddress(invalidAddr)).toBe(false);
  });
});
