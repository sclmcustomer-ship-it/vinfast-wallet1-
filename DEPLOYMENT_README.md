# 🏍️ Website Xe Điện YD - Ready for Deployment

## 📦 Files Đã Tạo Cho Deploy

✅ **vercel.json** - Vercel deployment configuration
✅ **.env.local.example** - Environment variables template  
✅ **DEPLOY.md** - Hướng dẫn deploy chi tiết
✅ **package.json** - Updated scripts (build, deploy)
✅ **.gitignore** - Updated (đã có sẵn)

---

## 🚀 Quick Deploy Guide

### Option 1: Deploy qua Vercel Dashboard (Dễ nhất)

1. **Truy cập**: https://vercel.com
2. **Login** với GitHub account: `sclmcustomer-ship-it`
3. **Import** repository: `vinfast-wallet1-`
4. **Chọn branch**: `yadea-ui-redesign`
5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://sjrmdmudpttfsdwqirab.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
   ```
6. **Click Deploy** 🚀

### Option 2: Deploy qua Command Line

```bash
# 1. Check build
npm run build

# 2. Commit & Push
git add .
git commit -m "✨ Ready for deployment"
git push origin yadea-ui-redesign

# 3. Install Vercel CLI
npm i -g vercel

# 4. Deploy
vercel --prod
```

---

## ⚙️ Environment Variables Cần Setup

Copy từ `.env.local.example` và điền values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sjrmdmudpttfsdwqirab.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Lấy keys từ đâu?**
- Vào Supabase Dashboard > Settings > API
- Copy `URL` và `anon public` key

---

## 📋 Pre-Deploy Checklist

- [ ] Test build local: `npm run build`
- [ ] Code đã push lên GitHub
- [ ] Environment variables prepared
- [ ] Supabase project đang active
- [ ] Đọc kỹ `DEPLOY.md`

---

## 🔗 Links Quan Trọng

- **Repository**: https://github.com/sclmcustomer-ship-it/vinfast-wallet1-
- **Branch**: `yadea-ui-redesign`
- **Supabase**: https://sjrmdmudpttfsdwqirab.supabase.co
- **Vercel**: https://vercel.com/dashboard

---

## 📞 Contact

**Hotline CSKH**: 0822 699 299  
**Email**: contact@thuonghieuyd.vn

---

## 🎯 What's Next After Deploy?

1. ✅ Website live tại Vercel URL
2. 🔧 Setup custom domain (optional)
3. 📊 Monitor analytics
4. 🔐 Add login/register features
5. 📱 Share with customers!

**Chi tiết đầy đủ trong file `DEPLOY.md`** 📖
