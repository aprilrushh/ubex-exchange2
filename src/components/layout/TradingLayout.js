// src/components/layout/TradingLayout.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import SimpleChart from '../Chart/SimpleChart';
import OrderBook from '../OrderBook/OrderBook';
import OrderForm from '../OrderForm/OrderForm';
import MyOrderList from '../OrderList/MyOrderList';
import './TradingLayout.css';

const TradingLayout = () => {
  const { symbol = 'BTC/USDT' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { orderBook, myOrders, createOrder, cancelOrder } = useOrder();

  const handleOrderSubmit = async (orderData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await createOrder(orderData);
  };

  const handleOrderCancel = async (orderId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await cancelOrder(orderId);
  };

  return (
    <div className="trading-layout">
      <div className="trading-main">
        <div className="chart-section">
          <SimpleChart symbol={symbol} />
        </div>
        <div className="order-section">
          <OrderForm onSubmit={handleOrderSubmit} />
          <MyOrderList 
            orders={myOrders} 
            onCancel={handleOrderCancel}
          />
        </div>
      </div>
      <div className="trading-sidebar">
        <OrderBook 
          orderBook={orderBook}
          symbol={symbol}
        />
      </div>
    </div>
  );
};

export default TradingLayout;