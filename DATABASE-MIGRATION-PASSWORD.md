# 🔧 Hướng Dẫn Cập Nhật Database

## Bước 1: Thêm Cột Password

Truy cập Supabase Dashboard và chạy SQL sau:

```sql
-- File: supabase-update-add-password.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

COMMENT ON COLUMN users.password IS 'Mật khẩu người dùng (plaintext for demo - trong production nên hash)';
```

## Bước 2: Verify Migration

Kiểm tra cột đã được thêm:

```sql
-- Check column existence
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password';

-- Check existing users
SELECT id, full_name, email_or_phone, password 
FROM users 
LIMIT 5;
```

## Bước 3: Optional - Set Default Password

Nếu muốn set password mặc định cho users hiện có:

```sql
-- Set password mặc định cho users chưa có password
UPDATE users 
SET password = 'temp123' 
WHERE password IS NULL;
```

⚠️ **LƯU Ý:** Sau khi set default password, nên thông báo cho users đổi password mới!

## Bước 4: Test

1. Tạo user mới qua API `/api/auth/signup`
2. Verify password được lưu vào database
3. Test đăng nhập qua API `/api/auth/login`
4. Kiểm tra password hiển thị trong Banker dashboard

## Rollback (Nếu Cần)

```sql
-- Xóa cột password nếu cần rollback
ALTER TABLE users DROP COLUMN IF EXISTS password;
```
