# 🚀 HƯỚNG DẪN DEPLOY LÊN NETLIFY

## 🎯 CÁCH 1: Deploy Qua Netlify Dashboard (DỄ NHẤT)

### Bước 1: Chuẩn Bị Code
```bash
# Tạo file netlify.toml (đã có rồi)
# Push code lên GitHub
git add .
git commit -m "Ready for Netlify deployment"
git push
```

### Bước 2: Deploy Trên Netlify
1. Vào: https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **GitHub** → Authorize
4. Chọn repository: `vinfast-wallet`
5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - ⚠️ Netlify tự động detect Next.js!

6. **Environment Variables:**
   - Click "Advanced" → "New variable"
   - Thêm:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...
     ```

7. Click **"Deploy site"**
8. Đợi 2-3 phút
9. ✅ Done! URL: `https://your-app.netlify.app`

---

## 🎯 CÁCH 2: Deploy Qua Netlify CLI

### Bước 1: Cài Netlify CLI
```bash
npm install -g netlify-cli
```

### Bước 2: Login
```bash
netlify login
```

### Bước 3: Init Project
```bash
cd "c:\Users\CFKJ\Documents\BI虂nh vinfast"
netlify init
```

Chọn:
- Create & configure a new site
- Team: Your team
- Site name: vinfast-wallet

### Bước 4: Set Environment Variables
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJxxx..."
```

### Bước 5: Deploy
```bash
netlify deploy --prod
```

---

## 🎯 CÁCH 3: Drag & Drop (Không Khuyến Nghị)

⚠️ **KHÔNG NÊN** vì Next.js cần SSR (Server-Side Rendering)

---

## ⚙️ NETLIFY.TOML (Đã Tạo)

File `netlify.toml` đã được tạo với config:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🔄 AUTO DEPLOY

Sau khi setup xong, mỗi lần push code:
```bash
git add .
git commit -m "Update features"
git push
```
→ Netlify tự động deploy! 🎉

---

## 🆚 NETLIFY vs VERCEL

| Tính Năng | Netlify | Vercel |
|-----------|---------|--------|
| Next.js Support | ✅ OK | ✅ Best |
| Free Tier | ✅ Good | ✅ Good |
| Auto Deploy | ✅ Yes | ✅ Yes |
| Setup | 🟡 Medium | 🟢 Easy |
| Performance | 🟢 Fast | 🟢 Faster |

**Khuyến nghị:** Vercel tốt hơn cho Next.js (do cùng công ty)

---

## ✅ CHECKLIST

- [x] File `netlify.toml` đã tạo
- [ ] Code đã push lên GitHub
- [ ] Netlify account đã tạo
- [ ] Repository đã import
- [ ] Environment variables đã set
- [ ] Deploy thành công

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Build failed"
```bash
# Check build local trước
npm run build
```

### Lỗi: "Environment variables not found"
- Vào Netlify Dashboard → Site settings → Environment variables
- Thêm lại `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Lỗi: "404 Not Found"
- Check `netlify.toml` có đúng không
- Check redirects rules

---

## 🎉 SAU KHI DEPLOY

1. **Test URL:** `https://your-app.netlify.app`
2. **Test Banker:** `https://your-app.netlify.app/banker`
3. **Test Wallet:** `https://your-app.netlify.app/wallet`
4. **Check Database:** Dữ liệu vẫn còn nguyên ✅

---

## 🔗 CUSTOM DOMAIN (Nếu Có)

1. Netlify Dashboard → Domain settings
2. Add custom domain: `yoursite.com`
3. Update DNS records
4. Wait 24h cho DNS propagate
5. ✅ Done!

---

**🚀 SẴN SÀNG DEPLOY? CHỌN CÁCH 1 (DỄ NHẤT)!**
