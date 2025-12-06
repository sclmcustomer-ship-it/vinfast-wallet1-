# Electric Mobility - Hướng dẫn Test

## 🧪 Test các chức năng

### 1. Test Đăng Nhập
```
Email: test@example.com
Mật khẩu: password123

Kết quả: ✅ Đăng nhập thành công
Số dư: 5.000.000 VNĐ
```

### 2. Test Đăng Ký
```
Họ tên: Nguyễn Văn Test
Email: newuser@example.com
SĐT: 0912345678
Mật khẩu: password123
Xác nhận: password123

Kết quả: ✅ Đăng ký thành công
Sau đó có thể đăng nhập
```

### 3. Test Nạp Tiền
```
Số tài khoản: 123456789
Số tiền: 1000000 (1 triệu VNĐ)
Phương thức: Chuyển khoản ngân hàng
Ngân hàng: Vietcombank

Kết quả: ✅ Yêu cầu nạp tiền đã được gửi
Mã giao dịch: TRX_[timestamp]
```

### 4. Test Rút Tiền
```
Số tiền: 500000 (500 nghìn VNĐ)
Tài khoản: Vietcombank - 123456789

Kết quả: ✅ Yêu cầu rút tiền đã được gửi
Số tiền nhận: 490.000 VNĐ (sau phí 10.000)
Thời gian: 1-3 ngày làm việc
```

### 5. Test Quản lý Banker
```
Banker hiện tại: Nguyễn Văn A
Hoa hồng: 2-3% / giao dịch

Chọn Banker khác: Trần Thị B
Kết quả: ✅ Đã chọn Banker thành công
```

## 🔍 Test Responsive (Mobile)

1. Mở DevTools (F12)
2. Chuyển sang Mobile view (Ctrl+Shift+M)
3. Test các kích thước:
   - 320px (iPhone SE)
   - 375px (iPhone 12)
   - 768px (Tablet)
   - 1024px (Desktop)

## ✅ Checklist Test

- [ ] Header hiển thị đúng
- [ ] Nút "Đăng nhập / Đăng ký" mở modal
- [ ] Tab chuyển đổi bình thường
- [ ] Form validation hoạt động
- [ ] API response hiển thị chính xác
- [ ] Modal có thể đóng bằng nút X
- [ ] Modal có thể đóng bằng phím Escape
- [ ] Modal có thể đóng bằng click ngoài
- [ ] Form reset sau khi submit
- [ ] Loading state hiển thị khi submit
- [ ] Responsive design hoạt động tốt

## 🐛 Debugging Tips

### Mở DevTools Console
```javascript
// Kiểm tra status API
console.log('API request:', fetch('/api/auth/login'))

// Kiểm tra state
console.log('Modal open:', isModalOpen)
console.log('Active tab:', activeTab)
```

### Xem Network Requests
1. Mở DevTools → Network tab
2. Submit form
3. Xem request và response

## 📊 Expected API Responses

### Login Success
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "id": "1",
    "email": "test@example.com",
    "name": "Người dùng Demo",
    "balance": 5000000
  },
  "token": "demo_token_..."
}
```

### Deposit Success
```json
{
  "success": true,
  "message": "Yêu cầu nạp tiền đã được gửi",
  "transaction": {
    "id": "TRX_...",
    "amount": 1000000,
    "method": "Chuyển khoản ngân hàng",
    "status": "pending",
    "createdAt": "2025-12-04T..."
  }
}
```

## 🚀 Performance Testing

### Lighthouse Test
1. Mở DevTools → Lighthouse tab
2. Click "Analyze page load"
3. Check scores:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 85
   - SEO: > 90

### Load Testing
```bash
# Cài autocannon (npm install -g autocannon)
autocannon http://localhost:3000 -d 10 -c 10
```

## 📱 Device Testing

Test trên các thiết bị thực:
- [ ] iPhone (iOS)
- [ ] Android phone
- [ ] Tablet
- [ ] Desktop
- [ ] Laptop

---

**Note:** Đây là bản demo, các API trả về dữ liệu giả. Để sử dụng thực tế, cần integrate với backend real.
