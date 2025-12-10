# 🚀 Hướng Dẫn Deploy Website YD lên Vercel

## 📋 Yêu Cầu Trước Khi Deploy

- ✅ Tài khoản GitHub (đã có: sclmcustomer-ship-it/vinfast-wallet1-)
- ✅ Tài khoản Vercel (đăng nhập bằng GitHub)
- ✅ Supabase project đang hoạt động
- ✅ Code đã push lên GitHub

---

## 🔧 Bước 1: Chuẩn Bị Code

### 1.1 Kiểm tra build local
```bash
npm run build
```

Nếu có lỗi, fix trước khi deploy.

### 1.2 Commit và Push code
```bash
git add .
git commit -m "✨ YD UI redesign complete - ready for deploy"
git push origin yadea-ui-redesign
```

---

## 🌐 Bước 2: Deploy Lên Vercel

### Cách 1: Deploy Qua Vercel Dashboard (Khuyên Dùng)

1. **Truy cập Vercel**: https://vercel.com
2. **Đăng nhập** bằng GitHub account `sclmcustomer-ship-it`
3. **Click "Add New Project"**
4. **Import Git Repository**:
   - Chọn repository: `vinfast-wallet1-`
   - Branch: `yadea-ui-redesign` (hoặc `main`)
5. **Configure Project**:
   - Framework Preset: **Next.js** (tự động detect)
   - Root Directory: `./` (để trống)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

6. **Environment Variables** - Thêm các biến:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://sjrmdmudpttfsdwqirab.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
   NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
   ```

7. **Click "Deploy"** 🚀

### Cách 2: Deploy Qua Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

---

## ⚙️ Bước 3: Cấu Hình Sau Deploy

### 3.1 Custom Domain (Optional)
1. Vào **Project Settings > Domains**
2. Add domain: `yd-electric.com` (ví dụ)
3. Update DNS records theo hướng dẫn

### 3.2 Environment Variables
Kiểm tra lại tất cả env variables trong **Settings > Environment Variables**

### 3.3 Supabase Redirect URLs
Thêm Vercel URL vào Supabase:
1. Vào Supabase Dashboard > Authentication > URL Configuration
2. Thêm **Site URL**: `https://your-project.vercel.app`
3. Thêm **Redirect URLs**: 
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`

---

## 🔍 Bước 4: Test Deployment

Sau khi deploy xong, kiểm tra:

- ✅ Homepage load đúng
- ✅ Hero section hiển thị animations
- ✅ Product cards hover effects hoạt động
- ✅ Form đăng ký lái thử
- ✅ Mobile responsive menu
- ✅ Banker page: `/banker` (password: 123123ok@)
- ✅ Wallet page: `/wallet`
- ✅ API routes hoạt động

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Tự động enable trong project settings
- Xem realtime visitors, page views

### Error Tracking
- Check logs tại: **Deployments > [Your Deploy] > Functions**
- Runtime Logs cho API routes

---

## 🔄 Deploy Lại (Re-deploy)

Mỗi lần push code mới lên GitHub, Vercel sẽ **tự động deploy**.

### Manual Redeploy:
1. Vào **Deployments**
2. Click **⋮** > **Redeploy**

---

## 🛠️ Troubleshooting

### Build Failed?
```bash
# Check locally first
npm run build

# Common issues:
# - Missing dependencies: npm install
# - TypeScript errors: npm run type-check
# - ESLint errors: npm run lint
```

### Supabase Connection Failed?
- Kiểm tra env variables đúng chưa
- Check Supabase project còn active không
- Verify API keys chưa expire

### 404 Errors?
- Check `next.config.js` có redirect rules
- Verify file structure đúng
- Check Vercel rewrites in `vercel.json`

---

## 📝 Checklist Deploy

- [ ] Code build successfully local (`npm run build`)
- [ ] All environment variables prepared
- [ ] Code pushed to GitHub branch
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] First deployment successful
- [ ] Supabase redirect URLs updated
- [ ] Website tested on production URL
- [ ] Mobile responsive checked
- [ ] API routes working (banker, wallet)
- [ ] Custom domain configured (optional)

---

## 🎉 Xong Rồi!

Website của bạn đã live tại: **https://your-project.vercel.app**

### Next Steps:
1. Share link với khách hàng
2. Monitor analytics
3. Setup custom domain
4. Add more features (đăng nhập, đăng ký)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

**Hotline YD:** 0822 699 299 🏍️
