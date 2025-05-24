jest.mock('axios');
const axios = require('axios');
const apiService = require('../../backend/services/ExternalApiService');

describe('ExternalApiService rate limit', () => {
  test('propagates 429 error', async () => {
    axios.get.mockRejectedValue({ response: { status: 429 } });
    await expect(apiService.fetchBinanceTicker('BTCUSDT')).rejects.toHaveProperty('response.status', 429);
  });
});
