import React, { useEffect, useState } from 'react';
import { getDepositAddress } from '../../services/WalletService';

const DepositForm = ({ asset }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDepositAddress(asset)
      .then(data => {
        setAddress(data.address);
      })
      .catch(() => setError('입금 주소를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [asset]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="deposit-form">
      <h3>{asset} 입금</h3>
      {loading ? <div>로딩 중...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <>
          <div className="address-row">
            <input type="text" value={address} readOnly style={{width:'80%'}} />
            <button onClick={handleCopy}>복사</button>
          </div>
          <div className="qr-row" style={{margin:'16px 0'}}>
            {address && (
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${address}`} alt="입금 QR코드" />
            )}
          </div>
          <div className="notice" style={{color:'#888', fontSize:'14px'}}>
            - 반드시 본인 지갑에서만 입금하세요.<br/>
            - 잘못된 주소로 입금 시 복구가 불가합니다.
          </div>
        </>
      )}
    </div>
  );
};

export default DepositForm; 