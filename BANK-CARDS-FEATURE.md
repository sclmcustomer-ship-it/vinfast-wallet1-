# 🏦 Hướng Dẫn: Xem Thẻ Ngân Hàng Khách Hàng trong Banker

## ✅ Tính Năng Đã Thêm

Banker giờ đây có thể xem đầy đủ thông tin thẻ ngân hàng của khách hàng với 3 cách khác nhau:

### 1. 👁️ Xem Nhanh trong Danh Sách User

Khi xem danh sách người dùng (`👥 Quản lý người dùng`), bạn sẽ thấy:

```
👤 Nguyễn Văn A
📧 0912345678 • ID: abc123
💰 Số dư: ₫1,000,000 • 💎 VIP Level 2 (5,000 điểm)
🏦 [MB Bank] [VCB] +1 thẻ khác
```

- Hiển thị tối đa **2 thẻ đầu tiên**
- Thẻ mặc định có **nền xanh nhạt**
- Hiển thị số lượng thẻ còn lại (nếu có)

### 2. 📋 Xem Chi Tiết trong Modal User

Khi click vào một user để chỉnh sửa, bạn sẽ thấy section **"🏦 Thẻ ngân hàng đã liên kết"**:

**Thông tin hiển thị:**
- Tổng số thẻ đã liên kết
- Tên ngân hàng (VD: "MB Bank - 0123456789")
- Số tài khoản đầy đủ với định dạng monospace
- Badge "⭐ Mặc định" cho thẻ chính
- Nền xanh nhạt cho thẻ mặc định

**Trạng thái:**
- ✅ Có thẻ: Hiển thị danh sách thẻ
- ⚠️ Chưa có thẻ: Hiển thị thông báo "Chưa liên kết thẻ ngân hàng nào"

### 3. 🏦 Tab Thẻ Ngân Hàng Riêng

Tab mới **"🏦 Thẻ ngân hàng"** cho phép xem tất cả thẻ của tất cả khách hàng:

**Thống kê:**
- 📊 Tổng số thẻ
- 👥 Số khách hàng có thẻ

**Hiển thị theo từng khách hàng:**
```
┌─────────────────────────────────────┐
│ NA  Nguyễn Văn A                    │
│     0912345678 • 2 thẻ    ₫1,000,000│
│                                      │
│ ┌─────────────────────────────┐     │
│ │ MB Bank - 0123456789         │     │
│ │ 0123456789012345         ⭐ Mặc định│
│ └─────────────────────────────┘     │
│                                      │
│ ┌─────────────────────────────┐     │
│ │ VCB - 9876543210            │     │
│ │ 9876543210987654             │     │
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

## 🎨 Thiết Kế UI

### Color Scheme
- **Thẻ mặc định**: `#eff6ff` (xanh nhạt)
- **Thẻ thường**: `white`
- **Badge mặc định**: `#3b82f6` (xanh dương)
- **Border**: `#e2e8f0` (xám nhạt)

### Font
- **Tên ngân hàng**: 14px, bold
- **Số tài khoản**: 13px, monospace, `#64748b`
- **Badge**: 11px, bold, white

## 📊 Dữ Liệu

Thông tin thẻ ngân hàng được lưu trong `linkedBanks`:

```typescript
interface BankCard {
  id: string;
  displayName: string;  // "MB Bank - 0123456789"
  value: string;         // "0123456789012345"
  isDefault?: boolean;   // true/false
}
```

## 🔧 Cách Sử Dụng

### 1. Truy cập Banker Dashboard
```
URL: http://localhost:3000/banker
Mật khẩu: 123123ok@
```

### 2. Xem Thẻ trong Danh Sách
- Click tab **"👥 Quản lý người dùng"**
- Scroll xem danh sách user
- Thông tin thẻ hiển thị ngay bên dưới số dư

### 3. Xem Chi Tiết Thẻ
- Click vào bất kỳ user nào
- Scroll xuống section **"🏦 Thẻ ngân hàng đã liên kết"**
- Xem danh sách đầy đủ tất cả các thẻ

### 4. Xem Tất Cả Thẻ
- Click tab **"🏦 Thẻ ngân hàng"**
- Xem thống kê tổng quan
- Browse qua danh sách khách hàng có thẻ

## ⚡ Tính Năng Nổi Bật

✅ **Realtime Update**: Dữ liệu tự động sync mỗi 2 giây từ Supabase  
✅ **Responsive Design**: Hoạt động tốt trên mobile và desktop  
✅ **Visual Hierarchy**: Thẻ mặc định được highlight rõ ràng  
✅ **Quick Preview**: Xem nhanh ngay trong danh sách  
✅ **Detailed View**: Xem chi tiết trong modal  
✅ **Centralized View**: Tab riêng để quản lý tất cả thẻ  

## 🔐 Bảo Mật

- ✅ Chỉ Banker có quyền truy cập
- ✅ Yêu cầu mật khẩu để đăng nhập
- ✅ Session được lưu trong sessionStorage
- ✅ Dữ liệu được sync từ Supabase (secure)

## 📝 Lưu Ý

1. **Thông tin nhạy cảm**: Số tài khoản được hiển thị đầy đủ cho Banker
2. **Không chỉnh sửa**: Hiện tại chỉ hiển thị, không có tính năng thêm/xóa thẻ từ Banker
3. **Khách hàng tự quản lý**: Khách hàng tự thêm/xóa thẻ từ ví của họ

## 🚀 Tương Lai

Các tính năng có thể mở rộng:

- [ ] Thêm/xóa thẻ ngân hàng cho khách hàng từ Banker
- [ ] Đặt thẻ mặc định cho khách hàng
- [ ] Xác minh thẻ ngân hàng
- [ ] Lịch sử thay đổi thẻ
- [ ] Export danh sách thẻ ra Excel/CSV
- [ ] Tìm kiếm theo số tài khoản/tên ngân hàng
- [ ] Filter theo ngân hàng

## 💡 Tips

### Tìm User có nhiều thẻ nhất
Xem tab **"🏦 Thẻ ngân hàng"** và xem số lượng thẻ của từng user

### Kiểm tra User chưa có thẻ
Những user không xuất hiện trong tab **"🏦 Thẻ ngân hàng"** là user chưa liên kết thẻ

### Xác minh thông tin rút tiền
Khi duyệt yêu cầu rút tiền, check thông tin thẻ ngân hàng của user để đảm bảo chuyển đúng tài khoản

---

**Cập nhật**: December 6, 2025  
**Version**: 2.0  
**Developer**: AI Assistant
