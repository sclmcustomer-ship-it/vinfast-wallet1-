-- Script để thêm cột is_locked vào bảng users
-- Chạy script này trong Supabase SQL Editor: https://supabase.com/dashboard/project/sjrmdmudpttfsdwqirab/sql

-- Thêm cột is_locked với giá trị mặc định là false
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Cập nhật tất cả user hiện tại thành không bị khóa
UPDATE users SET is_locked = false WHERE is_locked IS NULL;

-- Tạo index để tăng tốc độ query theo trạng thái khóa
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(is_locked);
