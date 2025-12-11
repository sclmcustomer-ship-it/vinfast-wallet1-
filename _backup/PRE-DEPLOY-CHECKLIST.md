# ✅ CHECKLIST TRƯỚC KHI DEPLOY

## 🎯 BƯỚC 1: KIỂM TRA CODE LOCAL

### A. Test Local
- [ ] Chạy `npm run dev` thành công
- [ ] Website mở được: http://localhost:3000
- [ ] Banker login được: http://localhost:3000/banker
- [ ] Wallet hoạt động: http://localhost:3000/wallet

### B. Test Banker Dashboard
- [ ] Login banker với password: `123123ok@`
- [ ] Tab "👥 Quản lý người dùng" hiển thị users
- [ ] Tab "📋 Yêu cầu giao dịch" hiển thị requests
- [ ] Tab "🏦 Thẻ ngân hàng" hiển thị bank cards
- [ ] Click vào user → Modal hiển thị đầy đủ thông tin
- [ ] Có thể chỉnh sửa user info
- [ ] Password hiển thị với icon 🔑

### C. Test Wallet
- [ ] Đăng nhập với user test
- [ ] Số dư hiển thị đúng
- [ ] Có thể tạo yêu cầu nạp tiền
- [ ] Có thể tạo yêu cầu rút tiền
- [ ] Lịch sử giao dịch hiển thị

### D. Test Build
```bash
npm run build
```
- [ ] Build thành công (không có lỗi)
- [ ] Không có TypeScript errors
- [ ] Không có warnings quan trọng

---

## 🗄️ BƯỚC 2: KIỂM TRA DATABASE

### A. Supabase Dashboard
- [ ] Đăng nhập Supabase: https://supabase.com
- [ ] Project đang active
- [ ] API keys còn hạn

### B. Kiểm Tra Tables
```sql
-- Check bảng users
SELECT COUNT(*) FROM users;

-- Check bảng transaction_requests
SELECT COUNT(*) FROM transaction_requests;

-- Check cột password đã có chưa
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password';
```

### C. Migration Password (Nếu Chưa)
- [ ] Chạy SQL: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;`
- [ ] Verify: `SELECT id, password FROM users LIMIT 5;`

### D. Backup Database (Khuyến nghị)
- [ ] Supabase Dashboard → Database → Backups → Create backup
- [ ] Hoặc export SQL:
  ```sql
  -- Backup users
  COPY (SELECT * FROM users) TO '/backup/users.csv' CSV HEADER;
  ```

---

## 🔧 BƯỚC 3: CHUẨN BỊ DEPLOY

### A. Environment Variables
- [ ] Copy Supabase URL: `https://xxx.supabase.co`
- [ ] Copy Supabase Anon Key: `eyJxxx...`
- [ ] Lưu vào file `.env.local` (local test)
- [ ] Chuẩn bị để paste vào Vercel

### B. Git Repository
- [ ] Tạo repo GitHub (nếu chưa)
- [ ] Repository: `github.com/YOUR_USERNAME/vinfast-wallet`
- [ ] Repo set public hoặc private (tùy ý)

### C. Files Cần Commit
```bash
# Kiểm tra files
git status

# Các files QUAN TRỌNG cần commit:
✅ app/              (tất cả pages và API routes)
✅ lib/              (supabase config)
✅ components/       (React components)
✅ public/           (static files)
✅ package.json
✅ next.config.js
✅ tsconfig.json
✅ tailwind.config.js

# Files KHÔNG nên commit:
❌ node_modules/
❌ .next/
❌ .env.local
❌ *.log
```

### D. .gitignore
Tạo file `.gitignore`:
```
node_modules/
.next/
.env.local
.env*.local
*.log
.DS_Store
.vercel
```

---

## 🚀 BƯỚC 4: DEPLOY

### A. Vercel Setup
- [ ] Đăng ký Vercel: https://vercel.com
- [ ] Connect GitHub account
- [ ] Import project: `vinfast-wallet`

### B. Configure Project
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)

### C. Environment Variables
Thêm vào Vercel:
```
NEXT_PUBLIC_SUPABASE_URL = [paste URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste Key]
```

### D. Deploy
- [ ] Click "Deploy"
- [ ] Đợi 2-3 phút
- [ ] Nhận được URL: `https://vinfast-wallet-xxx.vercel.app`

---

## ✅ BƯỚC 5: VERIFY SAU DEPLOY

### A. Test Website Live
- [ ] Mở URL Vercel: `https://your-site.vercel.app`
- [ ] Homepage load thành công
- [ ] Không có lỗi 500/404

### B. Test Banker Dashboard
```
URL: https://your-site.vercel.app/banker
Password: 123123ok@
```
- [ ] Login thành công
- [ ] Users list hiển thị
- [ ] Bank cards hiển thị
- [ ] Password hiển thị
- [ ] Transaction requests hoạt động

### C. Test Wallet
```
URL: https://your-site.vercel.app/wallet
```
- [ ] Login với user cũ thành công
- [ ] Số dư hiển thị ĐÚNG
- [ ] Lịch sử giao dịch còn
- [ ] Có thể tạo request mới

### D. Verify Dữ Liệu
```sql
-- Check trên Supabase
SELECT COUNT(*) FROM users; 
-- Số lượng user KHÔNG thay đổi

SELECT COUNT(*) FROM transaction_requests;
-- Số lượng transactions KHÔNG thay đổi
```

### E. Browser Console
- [ ] Mở F12 → Console
- [ ] Không có errors màu đỏ
- [ ] API calls thành công (status 200)

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Error: "Module not found"
**Fix:**
```bash
npm install
npm run build
git add .
git commit -m "Fix: Install dependencies"
git push
```

### ❌ Error: "Supabase connection failed"
**Fix:**
- Kiểm tra Environment Variables trên Vercel
- Verify SUPABASE_URL và ANON_KEY đúng
- Redeploy: Vercel Dashboard → Redeploy

### ❌ Error: "Build failed"
**Fix:**
```bash
# Test build local
npm run build

# Check errors
npm run lint

# Fix và commit lại
```

### ❌ Data không hiển thị
**Fix:**
- Check Supabase Dashboard → Database → Users
- Verify API calls: Browser → Network tab
- Check RLS policies: Supabase → Authentication → Policies

---

## 📊 MONITOR SAU DEPLOY

### A. Vercel Analytics
```
Vercel Dashboard → Your Project → Analytics
```
- [ ] Visitors count
- [ ] Page views
- [ ] Performance metrics

### B. Supabase Logs
```
Supabase Dashboard → Logs
```
- [ ] API requests
- [ ] Database queries
- [ ] Error logs

### C. Check Daily
- [ ] Website still online
- [ ] Database connection OK
- [ ] No errors in logs

---

## 🔄 UPDATE SAU NÀY

### Khi Cần Update Code:
```bash
# 1. Sửa code local
# 2. Test local
npm run dev

# 3. Build test
npm run build

# 4. Commit và push
git add .
git commit -m "Update: [mô tả]"
git push

# 5. Vercel tự động deploy!
```

### ⚠️ LƯU Ý:
- Deploy code MỚI ≠ Mất dữ liệu
- Database trên Supabase KHÔNG thay đổi
- Users, transactions, bank cards vẫn còn

---

## 🎯 FINAL CHECKLIST

### Trước Khi Deploy:
- [x] Code tested local ✅
- [x] Build thành công ✅
- [x] Database có dữ liệu ✅
- [x] Đã backup database ✅
- [x] Git repo ready ✅

### Sau Khi Deploy:
- [ ] Website live
- [ ] Banker hoạt động
- [ ] Wallet hoạt động
- [ ] Dữ liệu còn nguyên
- [ ] No errors

---

## ✅ SẴN SÀNG?

**Nếu TẤT CẢ checkboxes trên đều ✅:**

🚀 **DEPLOY NGAY!**

**Lệnh nhanh:**
```bash
# Automated deploy
npm run deploy

# Hoặc manual:
git add .
git commit -m "Deploy VinFast Wallet to production"
git push
# Rồi import trên Vercel
```

---

**📞 Cần trợ giúp? Hỏi trước khi deploy nhé!**

**🎉 Chúc anh deploy thành công!**
