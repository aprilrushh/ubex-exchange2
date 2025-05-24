const createSecurityService = require('../../backend/services/securityService');

describe('securityService token', () => {
  test('setup and verify 2FA token', async () => {
    const security = createSecurityService();
    const { secret, status } = await security.setup2FA(1);
    expect(secret).toBeDefined();
    expect(status).toBe('pending_verification');

    const result = await security.verify2FA(1, '123456');
    expect(result.success).toBe(true);
  });
});
