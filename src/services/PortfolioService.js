const API_BASE_URL = 'http://localhost:3001/api';

export const getAssetSummary = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/summary/${userId}`);
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('포트폴리오 요약 불러오기 실패:', error);
    throw error;
  }
};

export const getAssetList = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/assets/${userId}`);
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('자산 목록 불러오기 실패:', error);
    throw error;
  }
}; 
