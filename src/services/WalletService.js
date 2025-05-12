const API_BASE_URL = 'http://localhost:3001/api';

export const getDepositAddress = async (asset) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/deposit-address/${asset}`);
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('입금 주소 조회 실패:', error);
    throw error;
  }
};

export const requestWithdraw = async ({ asset, amount, toAddress, otp }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, amount, toAddress, otp }),
    });
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('출금 요청 실패:', error);
    throw error;
  }
}; 