-- 자산 테이블
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 자산 테이블
CREATE TABLE IF NOT EXISTS user_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  asset_id INTEGER NOT NULL REFERENCES assets(id),
  symbol VARCHAR(10) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL DEFAULT 0,
  average_price DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, asset_id)
);

-- 포트폴리오 히스토리 테이블
CREATE TABLE IF NOT EXISTS portfolio_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_value DECIMAL(20,8) NOT NULL DEFAULT 0,
  profit_loss DECIMAL(20,8) NOT NULL DEFAULT 0,
  profit_loss_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 시장 데이터 테이블
CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id),
  current_price DECIMAL(20,8) NOT NULL DEFAULT 0,
  price_change_24h DECIMAL(20,8) NOT NULL DEFAULT 0,
  price_change_percentage_24h DECIMAL(10,2) NOT NULL DEFAULT 0,
  volume_24h DECIMAL(20,8) NOT NULL DEFAULT 0,
  market_cap DECIMAL(20,8) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(asset_id)
);

-- 더미 자산 데이터
INSERT INTO assets (symbol, name, type) VALUES
('BTC', 'Bitcoin', 'cryptocurrency'),
('ETH', 'Ethereum', 'cryptocurrency'),
('XRP', 'Ripple', 'cryptocurrency'),
('ADA', 'Cardano', 'cryptocurrency'),
('DOT', 'Polkadot', 'cryptocurrency')
ON CONFLICT (symbol) DO NOTHING;

-- 더미 시장 데이터
INSERT INTO market_data (asset_id, current_price, price_change_24h, price_change_percentage_24h, volume_24h, market_cap)
SELECT 
  id,
  CASE 
    WHEN symbol = 'BTC' THEN 50000.00
    WHEN symbol = 'ETH' THEN 3000.00
    WHEN symbol = 'XRP' THEN 0.50
    WHEN symbol = 'ADA' THEN 1.20
    WHEN symbol = 'DOT' THEN 20.00
  END,
  CASE 
    WHEN symbol = 'BTC' THEN 1000.00
    WHEN symbol = 'ETH' THEN 100.00
    WHEN symbol = 'XRP' THEN 0.02
    WHEN symbol = 'ADA' THEN 0.05
    WHEN symbol = 'DOT' THEN 1.00
  END,
  CASE 
    WHEN symbol = 'BTC' THEN 2.00
    WHEN symbol = 'ETH' THEN 3.50
    WHEN symbol = 'XRP' THEN 4.00
    WHEN symbol = 'ADA' THEN 4.50
    WHEN symbol = 'DOT' THEN 5.00
  END,
  CASE 
    WHEN symbol = 'BTC' THEN 1000000000.00
    WHEN symbol = 'ETH' THEN 500000000.00
    WHEN symbol = 'XRP' THEN 100000000.00
    WHEN symbol = 'ADA' THEN 50000000.00
    WHEN symbol = 'DOT' THEN 20000000.00
  END,
  CASE 
    WHEN symbol = 'BTC' THEN 1000000000000.00
    WHEN symbol = 'ETH' THEN 300000000000.00
    WHEN symbol = 'XRP' THEN 20000000000.00
    WHEN symbol = 'ADA' THEN 30000000000.00
    WHEN symbol = 'DOT' THEN 20000000000.00
  END
FROM assets
ON CONFLICT (asset_id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  price_change_24h = EXCLUDED.price_change_24h,
  price_change_percentage_24h = EXCLUDED.price_change_percentage_24h,
  volume_24h = EXCLUDED.volume_24h,
  market_cap = EXCLUDED.market_cap,
  last_updated = CURRENT_TIMESTAMP; 