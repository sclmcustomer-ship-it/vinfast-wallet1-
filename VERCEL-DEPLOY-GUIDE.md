# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL (TỪNG BƯỚC)

## ✅ Bước 1: Mở Vercel

1. Mở trình duyệt
2. Vào địa chỉ: **https://vercel.com**
3. Click nút **"Sign Up"** hoặc **"Login"**

## ✅ Bước 2: Đăng nhập bằng GitHub

1. Chọn **"Continue with GitHub"**
2. Nhập tài khoản GitHub của anh
3. Cho phép Vercel truy cập GitHub (nếu được hỏi)

## ✅ Bước 3: Import Project

1. Sau khi đăng nhập, click nút **"Add New..."** (góc trên bên phải)
2. Chọn **"Project"**
3. Tìm repository: **vinfast-wallet1-**
4. Click **"Import"** bên cạnh repository đó

## ✅ Bước 4: Cấu hình Project

### Configure Project:
1. **Project Name:** để mặc định hoặc đổi thành `yadea-wallet`
2. **Framework Preset:** Next.js (tự động nhận diện)
3. **Root Directory:** để trống (mặc định)
4. **Build and Output Settings:** để mặc định

### Environment Variables (QUAN TRỌNG!):
1. Click **"Environment Variables"** để mở rộng
2. Thêm 2 biến sau:

**Biến 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: (Copy từ file .env.local của anh)

**Biến 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: (Copy từ file .env.local của anh)

### Lấy thông tin từ file .env.local:
```
Mở file: .env.local
Copy 2 giá trị:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Bước 5: Deploy

1. Sau khi điền đầy đủ Environment Variables
2. Click nút **"Deploy"** (màu đen, ở góc dưới)
3. Chờ 2-3 phút để Vercel build và deploy

## 🎉 Bước 6: Hoàn tất!

Sau khi deploy thành công:
1. Vercel sẽ cho anh 1 link: `https://yadea-wallet.vercel.app` (hoặc tên khác)
2. Click vào link để xem ví
3. Trang sẽ tự động redirect về `/wallet`

## 🔧 Thiết lập tự động deploy

Từ giờ, mỗi khi anh push code lên GitHub:
- Vercel sẽ tự động build và deploy
- Không cần làm gì thêm!

## 📱 Test Website

1. Mở link Vercel cho anh
2. Kiểm tra:
   - ✅ Tự động vào ví
   - ✅ Đăng ký/Đăng nhập hoạt động
   - ✅ Nạp/rút tiền hoạt động
   - ✅ Responsive trên mobile

## 🌐 Tùy chỉnh Domain (Nếu anh có domain riêng)

1. Vào Project Settings
2. Click "Domains"
3. Add domain của anh
4. Follow hướng dẫn cấu hình DNS

## ❓ Nếu gặp lỗi

### Lỗi: Build failed
- Kiểm tra Environment Variables có đủ không
- Xem Build Logs để tìm lỗi cụ thể

### Lỗi: Cannot connect to Supabase
- Kiểm tra lại SUPABASE_URL và SUPABASE_ANON_KEY
- Đảm bảo không có khoảng trắng thừa

### Lỗi: Page not found
- Đợi vài phút sau khi deploy
- Clear cache trình duyệt (Ctrl + Shift + R)

## 📞 Liên hệ

Nếu anh gặp bất kỳ vấn đề gì, chụp màn hình lỗi và cho em biết nhé!

---

## 🎯 TÓM TẮT NHANH:

1. ➡️ Vào: https://vercel.com
2. ➡️ Login GitHub
3. ➡️ Import project: vinfast-wallet1-
4. ➡️ Thêm 2 Environment Variables (Supabase)
5. ➡️ Click Deploy
6. ✅ Xong!

**Link sau khi deploy sẽ có dạng:** `https://ten-project.vercel.app`
