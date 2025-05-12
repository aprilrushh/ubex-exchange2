const API_BASE_URL = 'http://localhost:3001/api/admin';

export const listCoins = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/coins`);
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('코인 목록 조회 실패:', e);
    throw e;
  }
};

export const getCoin = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/coins/${id}`);
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('코인 조회 실패:', e);
    throw e;
  }
};

export const saveCoin = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/coins`, {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('코인 저장 실패:', e);
    throw e;
  }
};

export const listPairs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/pairs`);
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('거래쌍 목록 조회 실패:', e);
    throw e;
  }
};

export const getPair = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/pairs/${id}`);
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('거래쌍 조회 실패:', e);
    throw e;
  }
};

export const savePair = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/pairs`, {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API 오류: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('거래쌍 저장 실패:', e);
    throw e;
  }
}; 