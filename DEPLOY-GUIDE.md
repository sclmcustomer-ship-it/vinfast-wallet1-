# 🚀 Hướng dẫn Deploy Ví Yadea

## ✅ Build đã hoàn tất!

Trang chủ (`/`) sẽ tự động redirect về `/wallet` - Khách hàng mở website là vào thẳng ví!

## 📦 Files cần deploy

Toàn bộ các file sau đây:

```
.next/                  # Folder build (QUAN TRỌNG)
public/                 # Assets tĩnh
node_modules/          # Dependencies (cần cho server-side)
package.json
package-lock.json
next.config.js
.env.local             # Biến môi trường (SUPABASE_URL, SUPABASE_ANON_KEY)
```

## 🌐 Các cách Deploy

### Option 1: Vercel (Khuyến nghị - Miễn phí)

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com)
3. Import repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

**Lệnh:**
```bash
# Cài Vercel CLI (nếu chưa có)
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify

1. Build project: `npm run build`
2. Vào [netlify.com](https://netlify.com)
3. Drag & drop folder `.next` và các file cần thiết
4. Cấu hình:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Option 3: VPS/Server tự host

**Yêu cầu:**
- Node.js 18+
- PM2 (quản lý process)

**Lệnh:**
```bash
# 1. Copy files lên server (dùng FTP/SCP)
# 2. SSH vào server

# 3. Cài dependencies
npm ci --production

# 4. Cài PM2
npm install -g pm2

# 5. Chạy production
pm2 start npm --name "yadea-wallet" -- start

# 6. Lưu lại để tự động restart
pm2 save
pm2 startup
```

**Cấu hình Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Environment Variables (.env.local)

Đừng quên tạo file `.env.local` trên server với nội dung:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🧪 Test Local Production

Chạy thử production build ở local:

```bash
npm run build
npm start
```

Mở: http://localhost:3000 → Sẽ tự động chuyển đến `/wallet`

## 📊 Thông tin Build

- ✅ Trang chủ: 636 B (88 kB First Load) - Auto redirect
- ✅ Ví Yadea: 11 kB (153 kB First Load)
- ✅ Tối ưu production
- ✅ Static + Dynamic rendering

## 🎯 Kiểm tra sau khi deploy

1. Mở domain → Phải tự động vào ví
2. Đăng ký tài khoản test
3. Đăng nhập
4. Thử nạp/rút tiền
5. Kiểm tra responsive mobile

## 🆘 Troubleshooting

**Lỗi: "Cannot find module"**
→ Chạy: `npm ci`

**Lỗi: "SUPABASE is not defined"**
→ Kiểm tra file `.env.local`

**Lỗi: "Port 3000 already in use"**
→ Đổi port: `PORT=3001 npm start`

## 📝 Notes

- Trang chủ đã được cấu hình redirect tự động
- Logo Yadea màu trắng
- Responsive mobile-first
- 3 phím tắt cố định bên dưới
- Không có header (clean design)
