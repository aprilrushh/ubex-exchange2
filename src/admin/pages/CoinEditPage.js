import React, { useEffect, useState } from 'react';
import { getCoin, saveCoin } from '../services/AdminService';
import { useNavigate, useParams } from 'react-router-dom';

const CoinEditPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ symbol: '', name: '', decimals: 8 });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCoin(id)
        .then(data => setForm(data))
        .catch(() => setError('코인 정보를 불러오지 못했습니다.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'decimals' ? Number(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      await saveCoin({ ...form, id });
      navigate('/admin/coins');
    } catch {
      setError('저장 실패');
    }
  };

  return (
    <div>
      <h2>코인 {id ? '수정' : '등록'}</h2>
      {loading ? <div>로딩 중...</div> : (
        <form onSubmit={handleSubmit} style={{background:'#fff', padding:24, borderRadius:8, maxWidth:400}}>
          <div style={{marginBottom:16}}>
            <label>심볼</label><br/>
            <input name="symbol" value={form.symbol} onChange={handleChange} required style={{width:'100%'}} />
          </div>
          <div style={{marginBottom:16}}>
            <label>이름</label><br/>
            <input name="name" value={form.name} onChange={handleChange} required style={{width:'100%'}} />
          </div>
          <div style={{marginBottom:16}}>
            <label>소수점</label><br/>
            <input name="decimals" type="number" value={form.decimals} onChange={handleChange} min={0} max={18} required style={{width:'100%'}} />
          </div>
          <button type="submit">저장</button>
          {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
        </form>
      )}
    </div>
  );
};

export default CoinEditPage; 