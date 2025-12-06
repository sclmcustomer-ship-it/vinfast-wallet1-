# 🚀 HƯỚNG DẪN DEPLOY VINFAST WALLET

## 📋 MỤC LỤC
1. [Chuẩn Bị Deploy](#chuẩn-bị)
2. [Cập Nhật Database](#database)
3. [Deploy lên Vercel](#vercel)
4. [Bảo Vệ Dữ Liệu](#dữ-liệu)
5. [Sau Khi Deploy](#sau-deploy)

---

## 1️⃣ CHUẨN BỊ TRƯỚC KHI DEPLOY {#chuẩn-bị}

### ✅ Checklist:
- [x] Code đã hoàn thiện
- [ ] Database Supabase đã setup
- [ ] Đã chạy migration SQL thêm cột `password`
- [ ] Environment variables đã cấu hình
- [ ] Test local thành công

### 📦 Cài Đặt Dependencies
```bash
cd "c:\Users\CFKJ\Documents\BI虂nh vinfast"
npm install
```

### 🔧 Kiểm Tra Build
```bash
npm run build
```
Nếu có lỗi, fix trước khi deploy!

---

## 2️⃣ CẬP NHẬT DATABASE {#database}

### ⚠️ QUAN TRỌNG: Dữ Liệu Sẽ KHÔNG BỊ MẤT!

**Tại sao?**
- Database lưu trên **Supabase Cloud** (không phải local)
- Khi deploy, chỉ CODE thay đổi, database VẪN GIỮ NGUYÊN
- Tất cả users, transactions, bank cards đều an toàn

### 🗄️ Chạy Migration (Nếu Chưa)

**Bước 1:** Truy cập Supabase Dashboard
```
https://supabase.com/dashboard
```

**Bước 2:** Chọn project của anh → SQL Editor

**Bước 3:** Chạy SQL sau:
```sql
-- Thêm cột password (nếu chưa có)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Kiểm tra
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

**Bước 4:** Verify dữ liệu hiện tại:
```sql
-- Xem tất cả users
SELECT id, full_name, email_or_phone, balance, vip_level 
FROM users;

-- Xem tất cả transaction requests
SELECT * FROM transaction_requests 
ORDER BY created_at DESC 
LIMIT 10;
```

✅ **Dữ liệu vẫn còn đó? → An toàn để deploy!**

---

## 3️⃣ DEPLOY LÊN VERCEL {#vercel}

### 🎯 Tại Sao Chọn Vercel?
- ✅ FREE cho Next.js
- ✅ Deploy tự động từ GitHub
- ✅ HTTPS miễn phí
- ✅ Fast & reliable

### 📝 Các Bước Deploy:

#### **Bước 1: Tạo GitHub Repository**

```bash
# Khởi tạo Git (nếu chưa)
cd "c:\Users\CFKJ\Documents\BI虂nh vinfast"
git init

# Thêm .gitignore
echo "node_modules/" > .gitignore
echo ".next/" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.log" >> .gitignore

# Commit code
git add .
git commit -m "Initial commit - VinFast Wallet System"

# Tạo repo trên GitHub rồi push
git remote add origin https://github.com/YOUR_USERNAME/vinfast-wallet.git
git branch -M main
git push -u origin main
```

#### **Bước 2: Setup Environment Variables**

Tạo file `.env.local` (KHÔNG commit file này):
```env
# Supabase Config
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Banker Password (optional - có thể hardcode)
BANKER_PASSWORD=123123ok@
```

#### **Bước 3: Deploy trên Vercel**

1. **Đăng ký Vercel:**
   - Truy cập: https://vercel.com
   - Đăng nhập bằng GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Chọn repository `vinfast-wallet`
   - Framework: **Next.js** (tự detect)

3. **Configure Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   ```
   
4. **Deploy:**
   - Click "Deploy"
   - Đợi 2-3 phút
   - ✅ Done! Website live tại: `https://vinfast-wallet.vercel.app`

---

## 4️⃣ BẢO VẸ DỮ LIỆU {#dữ-liệu}

### ✅ Dữ Liệu KHÔNG BỊ MẤT vì:

#### 1. **Database Độc Lập**
```
┌─────────────┐         ┌──────────────────┐
│   Vercel    │ ──────► │  Supabase Cloud  │
│  (Website)  │ Connect │   (Database)     │
└─────────────┘         └──────────────────┘
     ↓                          ↓
  Deploy mới              Dữ liệu giữ nguyên
  Code thay đổi           Users vẫn còn
                          Transactions vẫn còn
                          Bank cards vẫn còn
```

#### 2. **Supabase Tự Động Backup**
- Supabase tự động backup database hàng ngày
- Có thể restore nếu có sự cố

#### 3. **Row Level Security**
- Đã enable RLS trong schema
- Dữ liệu được bảo vệ

### 🔒 Bảo Mật Production

**⚠️ Trong Production NÊN:**

1. **Hash Password:**
```typescript
// Thay vì lưu plaintext:
password: "mypassword123"

// Nên hash:
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **Ẩn Password trong Banker:**
```typescript
// Không hiển thị password
// Chỉ cho phép reset password
```

3. **Thêm Authentication:**
```typescript
// Dùng JWT tokens
// Session management
// Rate limiting
```

---

## 5️⃣ SAU KHI DEPLOY {#sau-deploy}

### ✅ Kiểm Tra Website

**1. Test Banker Dashboard:**
```
https://your-site.vercel.app/banker
Password: 123123ok@
```

**2. Verify Dữ Liệu:**
- [ ] Danh sách users hiển thị đầy đủ
- [ ] Thẻ ngân hàng hiển thị
- [ ] Password hiển thị (nếu có)
- [ ] Transaction requests hoạt động
- [ ] Có thể chỉnh sửa user info

**3. Test User Wallet:**
```
https://your-site.vercel.app/wallet
```
- [ ] Đăng nhập với user cũ
- [ ] Số dư hiển thị đúng
- [ ] Lịch sử giao dịch còn

### 🔄 Update Code Sau Deploy

**Mỗi lần thay đổi code:**
```bash
# 1. Commit changes
git add .
git commit -m "Update: [mô tả thay đổi]"
git push

# 2. Vercel tự động deploy lại!
# Không cần làm gì thêm
```

**Dữ liệu vẫn an toàn** vì database không thay đổi!

### 📊 Monitor

**1. Vercel Analytics:**
- Xem số lượng visitors
- Performance metrics
- Error logs

**2. Supabase Dashboard:**
- Monitor database queries
- Check storage usage
- View API logs

---

## 🆘 XỬ LÝ SỰ CỐ

### ❌ Nếu Website Bị Lỗi:

**1. Check Vercel Logs:**
```
Vercel Dashboard → Your Project → Deployments → View Logs
```

**2. Rollback Deploy:**
```
Deployments → Previous deployment → Promote to Production
```

**3. Database Vẫn An Toàn:**
- Dữ liệu trên Supabase KHÔNG thay đổi
- Website lỗi ≠ Database lỗi

### 💾 Backup Thủ Công (Khuyến nghị)

**Export Database:**
```sql
-- Backup users
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;

-- Backup transaction_requests
COPY (SELECT * FROM transaction_requests) TO STDOUT WITH CSV HEADER;
```

**Hoặc dùng Supabase Studio:**
```
Database → Backup → Create Backup
```

---

## 📞 SUPPORT & RESOURCES

### 📚 Tài Liệu:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment

### 🛠️ Tools:
- **Vercel CLI:**
  ```bash
  npm i -g vercel
  vercel login
  vercel
  ```

- **Supabase CLI:**
  ```bash
  npm i -g supabase
  supabase login
  ```

### 🐛 Debug:
- Check browser console: F12
- Check Vercel logs
- Check Supabase logs

---

## ✅ TÓM TẮT

### 🎯 Các Bước Deploy:

1. ✅ **Chạy migration SQL** (thêm cột password)
2. ✅ **Push code lên GitHub**
3. ✅ **Deploy trên Vercel** (import từ GitHub)
4. ✅ **Set environment variables** (Supabase keys)
5. ✅ **Test website** (banker + wallet)

### 🛡️ Dữ Liệu An Toàn:

| Loại Dữ Liệu | Vị Trí Lưu | Deploy Có Ảnh Hưởng? |
|---------------|------------|----------------------|
| Users | Supabase | ❌ KHÔNG |
| Transactions | Supabase | ❌ KHÔNG |
| Bank Cards | Supabase | ❌ KHÔNG |
| Passwords | Supabase | ❌ KHÔNG |
| Website Code | Vercel | ✅ CÓ (code mới) |

### 🎉 Kết Quả:

```
✅ Website live: https://your-site.vercel.app
✅ Dữ liệu người dùng giữ nguyên
✅ Banker có thể truy cập: /banker
✅ Users có thể đăng nhập: /wallet
✅ Tất cả thông tin còn nguyên
```

---

**🚀 SẴN SÀNG DEPLOY? HÃY BẮT ĐẦU TỪ BƯỚC 1!**

Có câu hỏi? Hỏi anh trước khi deploy nhé!
