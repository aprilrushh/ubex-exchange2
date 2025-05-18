// src/components/OrderHistory/MyOrderList.js
import React, { useState, useEffect, useCallback } from 'react';
import { getMyOrders } from '../../services/tradeService';
import { useAuth } from '../../context/AuthContext';
// import './MyOrderList.css'; // 필요시 스타일 파일

const MyOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { authState } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (authState.isAuthenticated) {
      setIsLoading(true);
      setError('');
      try {
        const fetchedOrders = await getMyOrders();
        // 최신 주문이 위로 오도록 정렬
        setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        setError(err.message || '주문 내역을 불러오는 데 실패했습니다.');
        setOrders([]); // 오류 발생 시 주문 목록 비우기
      }
      setIsLoading(false);
    } else {
      setOrders([]); // 로그아웃 상태면 주문 목록 비우기
    }
  }, [authState.isAuthenticated]); // 로그인 상태가 변경될 때마다 fetchOrders 함수 재생성

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // fetchOrders 함수가 변경될 때 (즉, 로그인 상태 변경 시) 실행

  // TODO: 주문 제출 성공 시 이 컴포넌트의 주문 목록을 새로고침하는 기능 추가 필요
  // 예를 들어, TradingPanel에서 주문 성공 후 특정 이벤트를 발생시키거나 Context를 통해 상태를 전달하여
  // 이 컴포넌트에서 fetchOrders를 다시 호출하도록 할 수 있습니다.
  // 또는 간단하게 주기적으로 fetchOrders를 호출할 수도 있습니다.
  // useEffect(() => {
  //   if (authState.isAuthenticated) {
  //     const intervalId = setInterval(fetchOrders, 5000); // 5초마다 주문 목록 새로고침
  //     return () => clearInterval(intervalId);
  //   }
  // }, [authState.isAuthenticated, fetchOrders]);


  if (!authState.isAuthenticated) {
    return <p style={{ margin: '20px', padding: '10px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '4px' }}>주문 내역을 보려면 로그인이 필요합니다.</p>;
  }

  if (isLoading) {
    return <p style={{ margin: '20px', textAlign: 'center' }}>주문 내역을 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ margin: '20px', textAlign: 'center', color: 'red' }}>오류: {error}</p>;
  }

  return (
    <div className="my-order-list" style={{ margin: '20px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', maxWidth: '900px' }}>
      <h4>나의 주문 내역</h4>
      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f8f8' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>주문시간</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>코인(Symbol)</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>주문유형</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>구분(Side)</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>주문가격</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>주문수량</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>상태</th>
              {/* <th style={{ padding: '10px 8px', textAlign: 'left' }}>주문ID</th> */}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{new Date(order.createdAt).toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{order.symbol}</td>
                <td style={{ padding: '8px' }}>{order.type === 'limit' ? '지정가' : '시장가'}</td>
                <td style={{ padding: '8px', color: order.side === 'buy' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {order.side === 'buy' ? '매수' : '매도'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{order.price ? order.price.toLocaleString() : '-'}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{order.quantity}</td>
                <td style={{ padding: '8px' }}>{order.status}</td>
                {/* <td style={{ padding: '8px', fontSize: '0.8em' }}>{order.id}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrderList;
