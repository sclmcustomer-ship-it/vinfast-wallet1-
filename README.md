# 🏍️ Thương Hiệu YD - Website Xe Điện Thông Minh

> Modern electric bike e-commerce website với Next.js 14, Supabase, và Tailwind CSS

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

## ✨ Features

- 🎨 **Modern UI/UX**: Gradient animations, glassmorphism effects, smooth transitions
- 🏍️ **Product Showcase**: Product cards với badges, ratings, hover effects
- 📱 **Fully Responsive**: Mobile-first design, responsive menu
- ⚡ **High Performance**: Next.js 14 App Router, optimized builds
- 🔐 **Authentication**: Supabase auth integration (ready for login/register)
- 💰 **Wallet System**: Deposit/withdraw functionality
- 👨‍💼 **Banker Dashboard**: Admin management panel
- 🚀 **Deploy Ready**: Vercel configuration included

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

## 📦 Project Structure

```
vinfast-wallet1-/
├── app/
│   ├── page.tsx           # Homepage (YD design)
│   ├── layout.tsx         # Root layout with Header/Footer
│   ├── globals.css        # Global styles + animations
│   ├── admin/             # Admin panel
│   ├── banker/            # Banker management
│   ├── wallet/            # Wallet system
│   └── api/               # API routes
│       ├── auth/          # Login/Signup
│       ├── banker/        # Banker operations
│       └── transaction/   # Deposit/Withdraw
├── components/
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Footer with links
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── supabase-helpers.ts
├── public/                # Static assets
├── vercel.json            # Vercel config
├── .env.local.example     # Environment template
├── DEPLOY.md              # Deployment guide
└── deploy.bat/.sh         # Quick deploy scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sclmcustomer-ship-it/vinfast-wallet1-.git
cd vinfast-wallet1-
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

### 5️⃣ Build for Production

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
