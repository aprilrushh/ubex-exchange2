import React, { useState, useEffect } from 'react';
import websocketService from '../../services/websocketService';

const OrderBook = ({ symbol = 'BTC/USDT' }) => {
  const [orderBook, setOrderBook] = useState({
    bids: [],
    asks: []
  });

  useEffect(() => {
    const handleOrderBookUpdate = (data) => {
      if (data && data.bids && data.asks) {
        setOrderBook(data);
      }
    };

    websocketService.subscribe('orderBook', handleOrderBookUpdate);

    return () => {
      websocketService.unsubscribe('orderBook', handleOrderBookUpdate);
    };
  }, [symbol]);

  return (
    <div className="order-book">
      <h3>Order Book - {symbol}</h3>
      <div className="order-book-container">
        <div className="asks">
          <h4>Asks</h4>
          {orderBook.asks.map((ask, index) => (
            <div key={`ask-${index}`} className="order-row ask">
              <span className="price">{ask.price}</span>
              <span className="amount">{ask.amount}</span>
            </div>
          ))}
        </div>
        <div className="bids">
          <h4>Bids</h4>
          {orderBook.bids.map((bid, index) => (
            <div key={`bid-${index}`} className="order-row bid">
              <span className="price">{bid.price}</span>
              <span className="amount">{bid.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook; 