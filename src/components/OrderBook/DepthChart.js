import React, { useEffect, useState, useRef } from 'react';
import webSocketService from '../../services/websocketService';
import './DepthChart.css';

const DepthChart = ({ symbol }) => {
  const [depth, setDepth] = useState({ bids: [], asks: [] });
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 150 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const handleUpdate = (data) => {
      if (data && data.symbol === symbol) {
        setDepth(data);
      }
    };
    webSocketService.on('orderbook-update', handleUpdate);
    webSocketService.emit('subscribe', { channel: `market-${symbol}` });
    return () => {
      webSocketService.off('orderbook-update', handleUpdate);
      webSocketService.emit('unsubscribe', { channel: `market-${symbol}` });
    };
  }, [symbol]);

  const computeDepth = (orders, isBid) => {
    const sorted = [...orders].sort((a, b) =>
      isBid ? b.price - a.price : a.price - b.price
    );
    let cumulative = 0;
    return sorted.map((o) => {
      const qty = parseFloat(o.quantity || o.amount || 0);
      cumulative += qty;
      return { price: parseFloat(o.price), cumulative };
    });
  };

  const bids = computeDepth(depth.bids || [], true);
  const asks = computeDepth(depth.asks || [], false);

  const allPrices = [...bids.map((b) => b.price), ...asks.map((a) => a.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const maxVolume = Math.max(
    bids[bids.length - 1]?.cumulative || 0,
    asks[asks.length - 1]?.cumulative || 0
  );

  const scaleX = (price) =>
    ((price - minPrice) / (maxPrice - minPrice || 1)) * dimensions.width;
  const scaleY = (vol) =>
    dimensions.height - (vol / (maxVolume || 1)) * dimensions.height;

  const createPath = (data) => {
    if (!data.length) return '';
    let path = `M ${scaleX(data[0].price)} ${scaleY(data[0].cumulative)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${scaleX(data[i].price)} ${scaleY(data[i].cumulative)}`;
    }
    const last = data[data.length - 1];
    path += ` L ${scaleX(last.price)} ${dimensions.height}`;
    path += ` L ${scaleX(data[0].price)} ${dimensions.height} Z`;
    return path;
  };

  return (
    <div className="depth-chart" ref={containerRef}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <path d={createPath(bids)} className="bids-area" />
        <path d={createPath(asks)} className="asks-area" />
      </svg>
    </div>
  );
};

export default DepthChart;
