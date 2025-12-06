-- Thêm cột password vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Update comment cho table
COMMENT ON COLUMN users.password IS 'Mật khẩu người dùng (plaintext for demo - trong production nên hash)';
