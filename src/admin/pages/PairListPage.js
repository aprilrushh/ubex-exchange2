import React, { useEffect, useState } from 'react';
import { listPairs, savePair } from '../services/AdminService';

const PairListPage = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listPairs()
      .then(setPairs)
      .catch(() => setError('거래쌍 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (pair) => {
    try {
      await savePair({ ...pair, active: !pair.active });
      setPairs(pairs => pairs.map(p => p.id === pair.id ? { ...p, active: !p.active } : p));
    } catch {
      alert('상태 변경 실패');
    }
  };

  const handleEdit = (pair) => {
    alert('거래쌍 수정 페이지는 추후 구현');
  };

  return (
    <div>
      <h2>거래쌍 목록</h2>
      {loading ? <div>로딩 중...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%', background:'#fff', borderRadius:8, overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#f5f6fa'}}>
              <th>기준코인</th>
              <th>상대코인</th>
              <th>수수료(%)</th>
              <th>활성</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(pair => (
              <tr key={pair.id}>
                <td>{pair.base}</td>
                <td>{pair.quote}</td>
                <td>{pair.fee}</td>
                <td>
                  <button onClick={()=>handleToggle(pair)} style={{color:pair.active?'#0a0':'#aaa'}}>
                    {pair.active ? '활성' : '비활성'}
                  </button>
                </td>
                <td>
                  <button onClick={()=>handleEdit(pair)}>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PairListPage; 