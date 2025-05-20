import React from 'react';
import './MyOrderList.css';

export default function MyOrderList({ orders = [], onCancelOrder }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() : '-';
  };

  const formatQuantity = (quantity) => {
    return quantity.toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'FILLED':
        return 'status-filled';
      case 'CANCELED':
        return 'status-canceled';
      case 'PARTIALLY_FILLED':
        return 'status-partial';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return '대기중';
      case 'FILLED':
        return '체결완료';
      case 'CANCELED':
        return '취소됨';
      case 'PARTIALLY_FILLED':
        return '부분체결';
      default:
        return status;
    }
  };

  return (
    <div className="my-order-list">
      <h3>내 주문</h3>
      {!orders || orders.length === 0 ? (
        <div className="no-orders">주문 내역이 없습니다.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>시간</th>
              <th>거래쌍</th>
              <th>유형</th>
              <th>방향</th>
              <th>가격</th>
              <th>수량</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.timestamp)}</td>
                <td>{order.symbol}</td>
                <td>{order.type === 'LIMIT' ? '지정가' : '시장가'}</td>
                <td className={order.side.toLowerCase()}>
                  {order.side === 'BUY' ? '매수' : '매도'}
                </td>
                <td>{formatPrice(order.price)}</td>
                <td>{formatQuantity(order.quantity)}</td>
                <td className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </td>
                <td>
                  {order.status === 'OPEN' && (
                    <button
                      className="cancel-button"
                      onClick={() => onCancelOrder(order.id)}
                    >
                      취소
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 