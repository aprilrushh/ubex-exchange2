import React, { useEffect, useState } from 'react';
import { listCoins, saveCoin } from '../services/AdminService';
import { useNavigate } from 'react-router-dom';

const CoinListPage = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    listCoins()
      .then(setCoins)
      .catch(() => setError('코인 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (coin) => {
    try {
      await saveCoin({ ...coin, active: !coin.active });
      setCoins(coins => coins.map(c => c.id === coin.id ? { ...c, active: !c.active } : c));
    } catch {
      alert('상태 변경 실패');
    }
  };

  return (
    <div>
      <h2>코인 목록</h2>
      {loading ? <div>로딩 중...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%', background:'#fff', borderRadius:8, overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#f5f6fa'}}>
              <th>심볼</th>
              <th>이름</th>
              <th>소수점</th>
              <th>활성</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coins.map(coin => (
              <tr key={coin.id}>
                <td>{coin.symbol}</td>
                <td>{coin.name}</td>
                <td>{coin.decimals}</td>
                <td>
                  <button onClick={()=>handleToggle(coin)} style={{color:coin.active?'#0a0':'#aaa'}}>
                    {coin.active ? '활성' : '비활성'}
                  </button>
                </td>
                <td>
                  <button onClick={()=>navigate(`/admin/coins/${coin.id}`)}>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CoinListPage; 