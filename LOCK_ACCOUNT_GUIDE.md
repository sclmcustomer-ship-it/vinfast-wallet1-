# 🔒 Hướng dẫn sử dụng tính năng KHÓA TÀI KHOẢN

## 🎯 Tổng quan

Tính năng khóa tài khoản cho phép Banker kiểm soát hoạt động rút/nạp tiền của người dùng.

### Khi tài khoản bị khóa:
- ❌ **Không thể nạp tiền** - Hiện thông báo: "🔒 Tài khoản của bạn đã bị khóa"
- ❌ **Không thể rút tiền** - Hiện thông báo: "🔒 Tài khoản của bạn đã bị khóa"  
- ✅ **Vẫn xem được số dư** - Người dùng vẫn đăng nhập và xem thông tin
- ✅ **Vẫn nhận thông báo** - Banker vẫn gửi thông báo được

---

## 📋 BƯỚC 1: Cập nhật Database

**⚠️ QUAN TRỌNG: Phải làm bước này trước!**

1. Mở Supabase Dashboard: https://supabase.com/dashboard/project/sjrmdmudpttfsdwqirab/sql

2. Click **SQL Editor** ở sidebar bên trái

3. Copy và paste script sau vào SQL Editor:

```sql
-- Thêm cột is_locked vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Cập nhật tất cả user hiện tại thành không bị khóa
UPDATE users SET is_locked = false WHERE is_locked IS NULL;

-- Tạo index để tăng tốc độ query
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(is_locked);
```

4. Click nút **RUN** (hoặc Ctrl+Enter) để chạy script

5. Kiểm tra kết quả - Nếu thấy `Success. No rows returned` là OK!

---

## 🎮 BƯỚC 2: Sử dụng tính năng

### Trong BANKER:

1. **Xem danh sách users**:
   - Tab "👥 Quản lý người dùng"
   - User bị khóa sẽ có badge đỏ: **🔒 Đã khóa**

2. **Khóa/Mở khóa tài khoản**:
   - Click vào user cần khóa
   - Tìm mục **"🔒 Trạng thái tài khoản"**
   - Chọn:
     - **✅ Hoạt động bình thường** - Cho phép rút/nạp tiền
     - **🔒 Đã khóa** - Cấm rút/nạp tiền
   - Click **Lưu thay đổi**
   - Thấy thông báo: "✅ Đã cập nhật thông tin user thành công!"

### Trong WALLET (Phía người dùng):

1. **Khi user bị khóa thử nạp tiền**:
   ```
   🔒 VinFast thông báo
   
   Tài khoản của bạn đã bị khóa!
   
   Vui lòng liên hệ CSKH để được hỗ trợ.
   ```

2. **Khi user bị khóa thử rút tiền**:
   ```
   🔒 VinFast thông báo
   
   Tài khoản của bạn đã bị khóa!
   
   Vui lòng liên hệ CSKH để được hỗ trợ.
   ```

---

## 🔄 Đồng bộ Real-time

- ✅ **Tự động sync mỗi 2 giây** - Wallet tự động đọc trạng thái khóa từ database
- ✅ **Ngay lập tức** - Banker khóa → Wallet biết ngay sau 2 giây
- ✅ **Không cần refresh** - Mọi thay đổi tự động cập nhật

---

## 🧪 Test tính năng

### Test Case 1: Khóa tài khoản đang hoạt động

1. **Banker**: Mở user "Nguyễn Văn A"
2. **Banker**: Chọn "🔒 Đã khóa" → Click Lưu
3. **Wallet**: Đăng nhập bằng tài khoản "Nguyễn Văn A"
4. **Wallet**: Thử nạp tiền → Thấy thông báo "Tài khoản đã bị khóa" ✅
5. **Wallet**: Thử rút tiền → Thấy thông báo "Tài khoản đã bị khóa" ✅

### Test Case 2: Mở khóa tài khoản

1. **Banker**: Mở user "Nguyễn Văn A"
2. **Banker**: Chọn "✅ Hoạt động bình thường" → Click Lưu
3. **Wallet**: Đợi 2 giây (auto sync)
4. **Wallet**: Thử nạp tiền → Hoạt động bình thường ✅
5. **Wallet**: Thử rút tiền → Hoạt động bình thường ✅

---

## 📊 Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email_or_phone TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'Chưa xác minh',
  is_locked BOOLEAN DEFAULT false,  ← MỚI THÊM
  linked_banks JSONB DEFAULT '[]'::jsonb,
  transaction_history JSONB DEFAULT '[]'::jsonb,
  notifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);
```

---

## 💡 Lưu ý

1. ⚠️ **Phải chạy SQL script trước** - Nếu không sẽ bị lỗi khi save user
2. ⏱️ **Đồng bộ 2 giây** - Wallet cần 2 giây để nhận biết bị khóa
3. 🔄 **Không ảnh hưởng số dư** - Khóa tài khoản chỉ cấm giao dịch, không đóng băng tiền
4. 👀 **User vẫn xem được** - User vẫn login và xem tất cả thông tin
5. 📱 **Multi-device** - Khóa trên 1 thiết bị → Tất cả thiết bị đều bị khóa

---

## 🆘 Troubleshooting

### Lỗi: "column 'is_locked' does not exist"
**Nguyên nhân**: Chưa chạy SQL script  
**Giải pháp**: Chạy lại script ở BƯỚC 1

### User vẫn rút/nạp được dù đã khóa
**Nguyên nhân**: Wallet chưa sync  
**Giải pháp**: Đợi 2 giây, hoặc refresh trang Wallet

### Badge "🔒 Đã khóa" không hiện
**Nguyên nhân**: Banker chưa sync  
**Giải pháp**: Refresh trang Banker

---

## ✅ Checklist Deploy

- [ ] Chạy SQL script trong Supabase
- [ ] Build lại: `npm run build`
- [ ] Test khóa tài khoản trong Banker
- [ ] Test nạp tiền bị chặn trong Wallet
- [ ] Test rút tiền bị chặn trong Wallet
- [ ] Test mở khóa hoạt động bình thường
- [ ] Deploy lên Netlify

---

**🎉 Hoàn tất!** Tính năng khóa tài khoản đã sẵn sàng sử dụng!
