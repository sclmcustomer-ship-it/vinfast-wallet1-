# Yadea Wallet - Ứng dụng ví điện tử

Hệ thống ví điện tử Yadea với giao diện hiện đại và tính năng quản lý đầy đủ.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

## 🚀 Tính năng

### Wallet (Ví người dùng)
- ✅ Xem số dư tài khoản (Balance, Deposit, Locked, Pending)
- ✅ Nạp tiền vào ví với ngân hàng liên kết
- ✅ Rút tiền từ ví về ngân hàng
- ✅ Xem lịch sử giao dịch chi tiết
- ✅ Giao diện hiện đại với hiệu ứng động và icon 3D

### Banker (Quản trị viên)
- ✅ Quản lý người dùng (thêm, sửa, xóa)
- ✅ Xử lý yêu cầu nạp/rút tiền
- ✅ Khóa/Mở khóa tài khoản
- ✅ Xem thống kê tổng quan hệ thống
- ✅ **Thay đổi Logo và Tên thương hiệu** từ Settings tab

### Admin
- ✅ Quản lý toàn hệ thống
- ✅ Cấu hình và giám sát

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 14.2.33 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

## 📦 Cấu trúc Project

```
yadea-wallet/
├── app/
│   ├── page.tsx           # Homepage - redirect to wallet
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles + animations
│   ├── admin/             # Admin panel
│   │   └── page.tsx
│   ├── banker/            # Banker management dashboard
│   │   └── page.tsx       # With Settings tab for branding
│   ├── wallet/            # Main wallet interface
│   │   └── page.tsx       # User wallet with transactions
│   └── api/               # API routes
│       ├── auth/          # Login/Signup endpoints
│       ├── banker/        # Banker operations
│       └── transaction/   # Deposit/Withdraw handlers
├── components/
│   ├── Header.tsx         # Navigation header (unused in wallet-only)
│   └── Footer.tsx         # Footer component (unused in wallet-only)
├── lib/
│   ├── supabase.ts        # Supabase client configuration
│   └── supabase-helpers.ts # Helper functions
├── public/
│   └── images/            # Static images and assets
├── _backup/               # Old files and documentation
└── package.json           # Dependencies and scripts
```

## 🚀 Hướng dẫn sử dụng

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn
- Git
- Tài khoản Supabase

### 1️⃣ Cài đặt Dependencies

```bash
npm install
```

### 2️⃣ Cấu hình môi trường

Tạo file `.env.local` với thông tin Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open **http://localhost:3000** 🎉
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3️⃣ Chạy Development Server

```bash
npm run dev
```

Truy cập:
- **Wallet**: http://localhost:3000/wallet
- **Banker**: http://localhost:3000/banker
- **Admin**: http://localhost:3000/admin

### 4️⃣ Build Production

```bash
npm run build
npm start
```

### 5️⃣ Deploy lên Vercel

```bash
vercel --prod
```

## 🎨 Thay đổi Logo và Thương hiệu

Banker có thể dễ dàng thay đổi logo và tên thương hiệu:

1. Truy cập trang Banker: `/banker`
2. Chọn tab **Settings** (⚙️) ở cuối menu
3. Nhập thông tin mới:
   - **Logo URL**: Đường dẫn đến file logo mới
   - **Brand Name**: Tên thương hiệu (vd: "Yadea", "VinFast")
   - **App Title**: Tiêu đề ứng dụng (vd: "Ví Yadea")
4. Xem preview logo trước khi lưu
5. Nhấn **💾 Lưu thay đổi**
6. Nhấn **🔄 Đặt lại mặc định** để quay về branding Yadea

**Lưu ý**: Thay đổi sẽ áp dụng cho TẤT CẢ người dùng ngay lập tức thông qua localStorage!

## 📱 Chức năng chính

### Wallet (Ví người dùng)
- Xem số dư: Balance, Deposit, Locked, Pending
- Nạp tiền qua ngân hàng liên kết
- Rút tiền về tài khoản ngân hàng
- Xem lịch sử giao dịch chi tiết
- Giao diện với icon động và hiệu ứng 3D

### Banker (Quản trị)
- Quản lý danh sách người dùng
- Xử lý yêu cầu nạp/rút tiền
- Khóa/Mở khóa tài khoản người dùng
- Xem thống kê hệ thống
- **Settings**: Thay đổi logo và brand name

## � Bảo mật

- ✅ Authentication với Supabase
- ✅ Row Level Security (RLS) trên database
- ✅ Mã hóa thông tin nhạy cảm
- ✅ Validation dữ liệu đầu vào
- ✅ Rate limiting trên API routes

## 📝 License

Private project - All rights reserved## 🎨 Styling

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

---

**Cập nhật gần nhất:** 11 tháng 12, 2025  
**Version:** 2.0.0 - Wallet System with Brand Configuration
