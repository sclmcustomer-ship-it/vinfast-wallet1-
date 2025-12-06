# 🔑 Hướng Dẫn: Banker Xem Mật Khẩu Người Dùng

## ✅ Cập Nhật Mới

Banker giờ đây có thể **xem và chỉnh sửa mật khẩu** của tất cả người dùng trong hệ thống!

## 🎯 Tính Năng

### 1. 👁️ Xem Mật Khẩu trong Danh Sách User

Khi xem danh sách người dùng (`👥 Quản lý người dùng`), mật khẩu được hiển thị ngay:

```
👤 Nguyễn Văn A
📧 0912345678 • ID: abc123
🔑 matkhau123  ← Mật khẩu hiển thị với nền vàng nhạt
💰 Số dư: ₫1,000,000 • 💎 VIP Level 2 (5,000 điểm)
```

**Đặc điểm:**
- 🔑 Icon khóa để dễ nhận biết
- **Font monospace** để dễ đọc
- **Nền màu vàng** (#fef3c7) để nổi bật
- Chỉ hiển thị nếu user có mật khẩu

### 2. ✏️ Xem & Chỉnh Sửa Mật Khẩu trong Modal

Click vào user để mở modal chỉnh sửa:

**Trường mật khẩu:**
- 📝 Label: "🔑 Mật khẩu"
- ✍️ Input text (không hidden) để banker có thể copy
- 💡 Placeholder: "Chưa có mật khẩu" nếu trống
- 🎨 Nền vàng nhạt nếu có mật khẩu
- 🔓 Thông báo: "Banker có thể xem và chỉnh sửa mật khẩu của người dùng"

**Chức năng:**
- ✅ Xem mật khẩu hiện tại
- ✏️ Chỉnh sửa/thay đổi mật khẩu
- ➕ Thêm mật khẩu cho user chưa có
- 🗑️ Xóa mật khẩu (để trống)
- 💾 Lưu vào database khi click "Lưu thay đổi"

## 🗄️ Cấu Trúc Database

### Schema Update

Đã thêm cột `password` vào bảng `users`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
```

**Chi tiết:**
- **Kiểu dữ liệu**: TEXT (nullable)
- **Mã hóa**: ⚠️ **KHÔNG MÃ HÓA** (plaintext cho demo)
- **Ghi chú**: Trong production nên dùng bcrypt/argon2

### Cập Nhật Supabase

Chạy file migration:
```bash
# Kết nối vào Supabase SQL Editor và chạy:
# File: supabase-update-add-password.sql
```

## 🔐 API Updates

### 1. Đăng Ký (`/api/auth/signup`)

**Trước:**
```typescript
// Chỉ trả về demo response, không lưu vào DB
return { success: true, user: { id: ..., name: ... } }
```

**Sau:**
```typescript
// Lưu vào Supabase với password
await supabase.from('users').insert({
  id: userId,
  full_name: name,
  email_or_phone: email || phone,
  password: password,  // ← Lưu plaintext
  balance: 0,
  ...
})
```

**Tính năng mới:**
- ✅ Kiểm tra email/phone đã tồn tại
- ✅ Validate password match confirmPassword
- ✅ Lưu password vào database
- ✅ Tạo record đầy đủ trong Supabase

### 2. Đăng Nhập (`/api/auth/login`)

**Trước:**
```typescript
// Demo - luôn trả về success
return { success: true, token: 'demo_token' }
```

**Sau:**
```typescript
// Verify password từ database
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email_or_phone', email)
  .single();

if (user.password !== password) {
  return { error: 'Sai mật khẩu' }
}
```

**Tính năng mới:**
- ✅ Verify password thật từ database
- ✅ Kiểm tra tài khoản có bị khóa không
- ✅ Cập nhật last_login timestamp
- ✅ Trả về thông tin user đầy đủ

## 🎨 UI/UX Design

### Color Scheme

| Element | Background | Text Color | Border |
|---------|-----------|------------|--------|
| Password trong list | `#fef3c7` | `#b45309` | - |
| Password input (có giá trị) | `#fef3c7` | `#1e293b` | `#e2e8f0` |
| Password input (trống) | `#f8fafc` | `#64748b` | `#e2e8f0` |

### Typography
- **Font**: Monospace (cho password)
- **Size**: 12px (trong list), 14px (trong input)
- **Weight**: Normal (400)

## 🔧 Cách Sử Dụng

### 1. Xem Mật Khẩu User

**Bước 1:** Truy cập Banker
```
URL: http://localhost:3000/banker
Password: 123123ok@
```

**Bước 2:** Xem danh sách user
- Click tab "👥 Quản lý người dùng"
- Mật khẩu hiển thị với nền vàng, dễ nhận biết

**Bước 3:** Xem chi tiết
- Click vào user bất kỳ
- Scroll xuống trường "🔑 Mật khẩu"
- Copy password nếu cần

### 2. Chỉnh Sửa Mật Khẩu

**Thay đổi password:**
1. Mở modal chỉnh sửa user
2. Tìm trường "🔑 Mật khẩu"
3. Nhập mật khẩu mới
4. Click "Lưu thay đổi"
5. ✅ Password được cập nhật vào Supabase

**Xóa password:**
1. Mở modal chỉnh sửa user
2. Xóa hết nội dung trong trường password
3. Click "Lưu thay đổi"
4. ✅ Password được set thành `null`

**Thêm password cho user chưa có:**
1. User chưa có password sẽ hiển thị placeholder "Chưa có mật khẩu"
2. Nhập password mới
3. Click "Lưu thay đổi"
4. ✅ User giờ có thể đăng nhập

## 🚨 Lưu Ý Bảo Mật

### ⚠️ CẢNH BÁO

**Hệ thống hiện tại lưu password dạng PLAINTEXT (không mã hóa)!**

**Chỉ phù hợp cho:**
- 🧪 Demo / Development environment
- 📚 Testing / Learning purposes
- 🏠 Internal company tools

**KHÔNG sử dụng cho:**
- ❌ Production environment
- ❌ Công khai trên internet
- ❌ Hệ thống có dữ liệu thật

### 🔐 Khuyến Nghị Production

Nếu deploy lên production, **BẮT BUỘC** phải:

1. **Hash password** trước khi lưu:
```typescript
import bcrypt from 'bcrypt';

// Đăng ký
const hashedPassword = await bcrypt.hash(password, 10);

// Đăng nhập
const match = await bcrypt.compare(password, user.hashedPassword);
```

2. **Không hiển thị password trong Banker:**
```typescript
// Thay vì hiển thị password, chỉ cho phép reset
<button>Reset Password</button>
```

3. **Thêm rate limiting** cho API login
4. **Thêm 2FA** (Two-Factor Authentication)
5. **Log tất cả thao tác** của Banker

## 📊 Dữ Liệu

### UserData Interface

```typescript
interface UserData {
  id: string;
  fullName: string;
  emailOrPhone: string;
  password?: string;  // ← NEW! Optional field
  balance: number;
  vipLevel: number;
  vipPoints: number;
  linkedBanks: BankCard[];
  kycStatus: string;
  isLocked: boolean;
  transactionHistory: Transaction[];
  createdAt: string;
  lastLogin: string;
}
```

### Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email_or_phone TEXT UNIQUE NOT NULL,
  password TEXT,  -- ← NEW! Nullable password field
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
```

## 🎯 Use Cases

### 1. Hỗ Trợ Khách Hàng Quên Mật Khẩu

**Scenario:** Khách gọi hotline quên mật khẩu

**Solution:**
1. Banker verify danh tính qua phone/email
2. Mở dashboard banker
3. Tìm user trong danh sách
4. Xem mật khẩu hiện tại và cho khách biết
5. HOẶC đổi mật khẩu mới cho khách

### 2. Kiểm Tra Tài Khoản Bị Hack

**Scenario:** Khách báo tài khoản bị truy cập trái phép

**Solution:**
1. Banker check `last_login` timestamp
2. Xem password có bị đổi không
3. Đổi password mới cho khách
4. Kích hoạt `isLocked` để bảo vệ tài khoản

### 3. Audit & Compliance

**Scenario:** Cần kiểm tra user nào chưa đặt mật khẩu

**Solution:**
1. Mở tab "👥 Quản lý người dùng"
2. Users không hiển thị 🔑 = chưa có password
3. Liên hệ yêu cầu họ đặt mật khẩu

## 📈 Số Liệu

### Statistics Dashboard (Tương lai)

Có thể thêm tab thống kê:
- 📊 Số user có password: X / Total
- 🔐 Password strength distribution
- 🕐 Last password change date
- ⚠️ Users với weak passwords

## 🔄 Migration Guide

### Cập Nhật Database Hiện Có

Nếu đã có users trong database, chạy migration:

```sql
-- File: supabase-update-add-password.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Optional: Set password mặc định cho users cũ
UPDATE users 
SET password = 'default123' 
WHERE password IS NULL;
```

### Test Migration

1. Backup database trước khi migrate
2. Chạy migration trên test environment
3. Verify data integrity
4. Deploy lên production

## 🐛 Troubleshooting

### Vấn Đề: Password không hiển thị

**Nguyên nhân:**
- User chưa có password (null trong DB)
- Chưa chạy migration

**Giải pháp:**
```sql
-- Check password column
SELECT id, full_name, password FROM users LIMIT 10;

-- Nếu không có column, chạy migration
ALTER TABLE users ADD COLUMN password TEXT;
```

### Vấn Đề: Đăng nhập bị lỗi

**Nguyên nhân:**
- Password trong DB là null
- API chưa được update

**Giải pháp:**
1. Check file `/api/auth/login/route.ts` đã import supabase
2. Verify password comparison logic
3. Set password cho user trong banker dashboard

## 🚀 Tính Năng Tương Lai

- [ ] Password strength indicator (weak/medium/strong)
- [ ] Password history (track changes)
- [ ] Bulk password reset
- [ ] Export users với/không có password
- [ ] Force password change on next login
- [ ] Password expiry date
- [ ] Email notification khi password thay đổi

---

**Cập nhật**: December 6, 2025  
**Version**: 3.0  
**Developer**: AI Assistant  
**⚠️ Security Warning**: Chỉ dùng cho demo - Hash passwords trong production!
