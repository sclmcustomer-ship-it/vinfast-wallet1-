# 🚀 Hướng dẫn Deploy lên Netlify

## ⚠️ Lưu ý quan trọng

Next.js 14 với App Router hoạt động tốt nhất trên **Vercel**. Netlify có thể gặp vấn đề với các tính năng động.

## 📦 Chuẩn bị trước khi deploy

1. **Cài đặt Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build test:**
```bash
npm run build
```

## 🌐 Deploy lên Netlify

### Cách 1: Netlify CLI (Nhanh)

```bash
# Login Netlify
netlify login

# Deploy
netlify deploy --prod
```

Khi được hỏi:
- Publish directory: `.next`
- Build command: `npm run build`

### Cách 2: Netlify Dashboard (Giao diện)

1. Vào [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Chọn GitHub repository
4. Cấu hình:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18

5. **Environment Variables** (Quan trọng!):
   - Click "Site settings" → "Environment variables"
   - Thêm:
     ```
     NEXT_PUBLIC_SUPABASE_URL = <your-supabase-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY = <your-supabase-key>
     ```

6. Click "Deploy site"

## ⚡ Khuyến nghị: Deploy lên Vercel

**Tại sao nên dùng Vercel:**
- ✅ Được tạo bởi Next.js team
- ✅ Tối ưu 100% cho Next.js
- ✅ Deploy tự động từ GitHub
- ✅ Miễn phí với đầy đủ tính năng
- ✅ Không cần config phức tạp

### Deploy Vercel (Đơn giản hơn nhiều):

```bash
# Cài Vercel CLI
npm i -g vercel

# Login và deploy
vercel

# Hoặc deploy production
vercel --prod
```

**Hoặc qua Dashboard:**
1. Vào [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Thêm Environment Variables (như trên)
5. Click "Deploy" → Xong!

## 🔧 Nếu gặp lỗi trên Netlify

### Lỗi: "Build failed"

Thử cài plugin:
```bash
npm install -D @netlify/plugin-nextjs
```

### Lỗi: "Page not found"

Thêm file `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Lỗi: "Cannot find module"

Xóa `node_modules` và rebuild:
```bash
rm -rf node_modules .next
npm install
npm run build
```

## 📝 Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] File `.env.local` có đầy đủ thông tin Supabase
- [ ] Build thành công ở local (`npm run build`)
- [ ] Đã thêm Environment Variables trên hosting
- [ ] Đã test redirect từ `/` → `/wallet`

## 🆘 Nếu vẫn không được

Cho em biết:
1. Lỗi cụ thể là gì?
2. Build log trên Netlify
3. Hoặc em sẽ hướng dẫn anh deploy Vercel (dễ hơn!)
