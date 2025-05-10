// src/utils/chartIndicators.js

/**
 * 이동평균선(Moving Average) 계산
 * @param {Array} data - 캔들스틱 데이터 배열
 * @param {number} period - 기간 (예: 5, 10, 20)
 * @returns {Array} 이동평균 데이터 배열
 */
export const calculateMA = (data, period) => {
  const result = [];
  
  // 데이터가 충분하지 않으면 빈 배열 반환
  if (data.length < period) {
    return result;
  }
  
  // 처음 period-1개 캔들은 MA 계산 불가
  for (let i = 0; i < period - 1; i++) {
    // 빈 값을 넣지 않고 건너뜀
  }
  
  // i번째 캔들부터 i-(period-1)번째 캔들까지의 종가 평균 계산
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    
    const ma = sum / period;
    
    result.push({
      time: data[i].time,
      value: ma
    });
  }
  
  return result;
};

/**
 * RSI(Relative Strength Index) 계산
 * @param {Array} data - 캔들스틱 데이터 배열
 * @param {number} period - 기간 (일반적으로 14)
 * @returns {Array} RSI 데이터 배열
 */
export const calculateRSI = (data, period = 14) => {
  const result = [];
  
  // 데이터가 충분하지 않으면 빈 배열 반환
  if (data.length <= period) {
    return result;
  }
  
  // 가격 변화 계산
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  // 첫 평균 이득과 손실 계산
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // 첫 RSI 계산 및 추가
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // 0으로 나누기 방지
  let rsi = 100 - (100 / (1 + rs));
  
  result.push({
    time: data[period].time,
    value: rsi
  });
  
  // 나머지 포인트 계산
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    // 스무딩 적용
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[i + 1].time,
      value: rsi
    });
  }
  
  return result;
};

/**
 * MACD(Moving Average Convergence Divergence) 계산
 * @param {Array} data - 캔들스틱 데이터 배열
 * @param {number} fastPeriod - 빠른 EMA 기간 (일반적으로 12)
 * @param {number} slowPeriod - 느린 EMA 기간 (일반적으로 26)
 * @param {number} signalPeriod - 시그널 EMA 기간 (일반적으로 9)
 * @returns {Object} MACD, Signal, Histogram 데이터 배열
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  // EMA(지수이동평균) 계산
  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    const emaData = [];
    
    // 첫 번째 EMA는 단순 평균으로 계산
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    
    let ema = sum / period;
    emaData.push({
      time: data[period - 1].time,
      value: ema
    });
    
    // 나머지 EMA 계산
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * k + ema;
      emaData.push({
        time: data[i].time,
        value: ema
      });
    }
    
    return emaData;
  };
  
  // 데이터가 충분하지 않으면 빈 객체 반환
  if (data.length <= slowPeriod) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }
  
  // 빠른 EMA와 느린 EMA 계산
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // MACD 라인 계산 (빠른 EMA - 느린 EMA)
  const macdLine = [];
  const startIndex = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + startIndex;
    
    if (fastIndex >= 0 && fastIndex < fastEMA.length) {
      macdLine.push({
        time: slowEMA[i].time,
        value: fastEMA[fastIndex].value - slowEMA[i].value
      });
    }
  }
  
  // 시그널 라인 계산 (MACD의 EMA)
  if (macdLine.length <= signalPeriod) {
    return { macdLine, signalLine: [], histogram: [] };
  }
  
  // 시그널 라인을 위한 EMA 초기값 계산
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdLine[i].value;
  }
  
  const signalLine = [];
  let signal = sum / signalPeriod;
  
  signalLine.push({
    time: macdLine[signalPeriod - 1].time,
    value: signal
  });
  
  // 나머지 시그널 라인 계산
  const k = 2 / (signalPeriod + 1);
  for (let i = signalPeriod; i < macdLine.length; i++) {
    signal = (macdLine[i].value - signal) * k + signal;
    signalLine.push({
      time: macdLine[i].time,
      value: signal
    });
  }
  
  // 히스토그램 계산 (MACD - 시그널)
  const histogram = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalPeriod - 1;
    if (macdIndex < macdLine.length) {
      histogram.push({
        time: signalLine[i].time,
        value: macdLine[macdIndex].value - signalLine[i].value,
        color: macdLine[macdIndex].value >= signalLine[i].value
          ? 'rgba(214, 0, 0, 0.5)' // 상승 - 빨간색 (한국식)
          : 'rgba(0, 81, 199, 0.5)' // 하락 - 파란색 (한국식)
      });
    }
  }
  
  return { macdLine, signalLine, histogram };
};

/**
 * 볼린저 밴드(Bollinger Bands) 계산
 * @param {Array} data - 캔들스틱 데이터 배열
 * @param {number} period - 기간 (일반적으로 20)
 * @param {number} multiplier - 표준편차 승수 (일반적으로 2)
 * @returns {Object} 상단 밴드, 중간 밴드, 하단 밴드 데이터 배열
 */
export const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const result = {
    upper: [],
    middle: [],
    lower: []
  };
  
  // 데이터가 충분하지 않으면 빈 객체 반환
  if (data.length < period) {
    return result;
  }
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    
    // 중간 밴드 (SMA)
    const middle = sum / period;
    
    // 표준편차 계산
    let squareSum = 0;
    for (let j = 0; j < period; j++) {
      squareSum += Math.pow(data[i - j].close - middle, 2);
    }
    
    const stdDev = Math.sqrt(squareSum / period);
    
    // 밴드 계산
    const upper = middle + (multiplier * stdDev);
    const lower = middle - (multiplier * stdDev);
    
    const time = data[i].time;
    
    result.upper.push({ time, value: upper });
    result.middle.push({ time, value: middle });
    result.lower.push({ time, value: lower });
  }
  
  return result;
};