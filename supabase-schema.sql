-- Tạo bảng users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email_or_phone TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'Chưa xác minh',
  is_locked BOOLEAN DEFAULT false,
  linked_banks JSONB DEFAULT '[]'::jsonb,
  transaction_history JSONB DEFAULT '[]'::jsonb,
  notifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng transaction_requests
CREATE TABLE transaction_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  bank_info TEXT,
  status TEXT DEFAULT 'Chờ duyệt',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index để tăng tốc độ query
CREATE INDEX idx_users_email ON users(email_or_phone);
CREATE INDEX idx_transaction_user ON transaction_requests(user_id);
CREATE INDEX idx_transaction_status ON transaction_requests(status);

-- Enable Row Level Security (bảo mật)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép đọc/ghi public (vì app này dùng localStorage logic)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON transaction_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON transaction_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON transaction_requests FOR UPDATE USING (true);
