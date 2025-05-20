import React from 'react';

const MyOrderList = ({ orders = [], isLoading, error, onCancel }) => {
  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error loading orders: {error}</div>;
  }

  return (
    <div className="my-orders">
      <h3>My Orders</h3>
      {orders.length === 0 ? (
        <div>No orders found</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className={`order-item ${order.side}`}>
              <div className="order-info">
                <span className="order-type">{order.type}</span>
                <span className="order-side">{order.side}</span>
                <span className="order-price">{order.price}</span>
                <span className="order-amount">{order.amount}</span>
                <span className="order-status">{order.status}</span>
              </div>
              {order.status === 'open' && (
                <button
                  className="cancel-button"
                  onClick={() => onCancel(order.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrderList; 