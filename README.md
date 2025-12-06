# Electric Mobility - Xe máy điện

Trang web giới thiệu và bán xe máy điện với hệ thống đăng nhập, nạp tiền, rút tiền và quản lý Banker.

## 🚀 Hướng dẫn Setup & Chạy

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### 1️⃣ Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 2️⃣ Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

Mở browser và truy cập: **http://localhost:3000**

### 3️⃣ Build cho production

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## 📁 Cấu trúc Project

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts     # Đăng nhập API
│   │   │   └── signup/route.ts    # Đăng ký API
│   │   ├── transaction/
│   │   │   ├── deposit/route.ts   # Nạp tiền API
│   │   │   └── withdraw/route.ts  # Rút tiền API
│   │   └── banker/route.ts        # Quản lý Banker API
│   ├── layout.tsx             # Layout chính
│   ├── page.tsx              # Trang chủ (Component chính)
│   └── globals.css           # Global styles
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
└── README.md               # File này

```

## ✨ Các tính năng

### 🔐 Xác thực (Authentication)
- ✅ Đăng nhập với email/SĐT
- ✅ Đăng ký tài khoản mới
- ✅ Quên mật khẩu (ready)

### 💳 Quản lý Tài Chính
- ✅ **Nạp tiền** - Hỗ trợ multiple payment methods
  - Chuyển khoản ngân hàng
  - Ví điện tử (Momo, Zalo Pay)
  - Thẻ tín dụng
  - Crypto (USDT)
  
- ✅ **Rút tiền** - Rút tiền về tài khoản ngân hàng
  - Xem số dư hiện tại
  - Chọn tài khoản rút tiền
  - Tính toán phí tự động

### 👔 Quản lý Banker
- ✅ Xem thông tin Banker hiện tại
- ✅ Xem danh sách Banker khác
- ✅ Chuyển đổi Banker
- ✅ Xem quyền lợi (hoa hồng, hỗ trợ VIP, etc.)

### 🛍️ Sản phẩm
- ✅ Hiển thị sản phẩm xe máy điện
- ✅ Thông tin chi tiết sản phẩm
- ✅ Giá cả và quãng đường

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/signup` - Đăng ký

### Transactions
- `POST /api/transaction/deposit` - Nạp tiền
- `POST /api/transaction/withdraw` - Rút tiền

### Banker
- `GET /api/banker` - Lấy danh sách Banker
- `POST /api/banker` - Chọn Banker

## 📝 Thông tin Form

### Login
- Email hoặc số điện thoại
- Mật khẩu

### Signup
- Họ tên
- Email
- Số điện thoại
- Mật khẩu (tối thiểu 8 ký tự)
- Xác nhận mật khẩu

### Deposit (Nạp tiền)
- Số tài khoản / Email
- Số tiền (10.000 - 100.000.000 VNĐ)
- Phương thức thanh toán
- Ngân hàng

### Withdraw (Rút tiền)
- Số tiền (tối thiểu 50.000 VNĐ)
- Tài khoản rút tiền
- Phí: 5.000 - 10.000 VNĐ

## 🎨 Styling

- Sử dụng inline styles trong React components
- Responsive design - tương thích mobile
- Màu sắc chính: #003366 (primary color)
- Font: System UI

## 🔐 Security Notes

⚠️ **Đây là bản DEMO, cần cải thiện trước khi deploy production:**

- [ ] Thêm hashing mật khẩu (bcryptjs)
- [ ] Implement JWT tokens
- [ ] Validate backend properly
- [ ] HTTPS (SSL/TLS)
- [ ] Environment variables cho secrets
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Input sanitization
- [ ] Database integration (MongoDB, PostgreSQL, etc)

## 🚀 Deployment

### Deploy trên Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy trên Netlify
```bash
npm run build
netlify deploy
```

### Deploy trên Docker
```bash
docker build -t electric-bike .
docker run -p 3000:3000 electric-bike
```

## 📞 Contact & Support

Liên hệ Banker để hỗ trợ:
- 📱 Phone: 09XX XXX XXX
- 💬 Zalo: 09XX XXX XXX
- 📧 Email: support@electricmobility.com

## 📜 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại

---

**Lần cập nhật cuối:** 4 tháng 12, 2025
**Version:** 1.0.0
