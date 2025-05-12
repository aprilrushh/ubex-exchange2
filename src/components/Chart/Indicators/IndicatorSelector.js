// src/components/Chart/Indicators/IndicatorSelector.js
import React, { useState } from 'react';
import './IndicatorSelector.css';

const IndicatorSelector = ({ onIndicatorChange }) => {
  const [indicators, setIndicators] = useState({
    ma5: false,
    ma10: false,
    ma20: true, // 기본적으로 20일 이동평균선 활성화
    ma60: false,
    ma120: false,
    rsi: false,
    macd: false
  });

  const handleChange = (indicator) => {
    const updatedIndicators = {
      ...indicators,
      [indicator]: !indicators[indicator]
    };
    
    setIndicators(updatedIndicators);
    
    // 상위 컴포넌트에 변경 알림
    if (onIndicatorChange) {
      onIndicatorChange(updatedIndicators);
    }
  };
  
  return (
    <div className="indicator-selector">
      <h4>기술적 지표</h4>
      <div className="indicator-options">
        <div className="indicator-group">
          <h5>이동평균선</h5>
          <div className="checkbox-group">
            <label className={indicators.ma5 ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.ma5}
                onChange={() => handleChange('ma5')}
              />
              <span className="ma5-color">MA 5</span>
            </label>
            
            <label className={indicators.ma10 ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.ma10}
                onChange={() => handleChange('ma10')}
              />
              <span className="ma10-color">MA 10</span>
            </label>
            
            <label className={indicators.ma20 ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.ma20}
                onChange={() => handleChange('ma20')}
              />
              <span className="ma20-color">MA 20</span>
            </label>
            
            <label className={indicators.ma60 ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.ma60}
                onChange={() => handleChange('ma60')}
              />
              <span className="ma60-color">MA 60</span>
            </label>
            
            <label className={indicators.ma120 ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.ma120}
                onChange={() => handleChange('ma120')}
              />
              <span className="ma120-color">MA 120</span>
            </label>
          </div>
        </div>
        
        <div className="indicator-group">
          <h5>모멘텀 지표</h5>
          <div className="checkbox-group">
            <label className={indicators.rsi ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.rsi}
                onChange={() => handleChange('rsi')}
              />
              <span>RSI (14)</span>
            </label>
            
            <label className={indicators.macd ? 'active' : ''}>
              <input 
                type="checkbox" 
                checked={indicators.macd}
                onChange={() => handleChange('macd')}
              />
              <span>MACD</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorSelector;
