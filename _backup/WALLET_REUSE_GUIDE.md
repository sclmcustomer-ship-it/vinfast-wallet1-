# 🎯 HƯỚNG DẪN TÁI SỬ DỤNG HỆ THỐNG VÍ CHO WEBSITE MỸ PHẨM

## 📁 CẤU TRÚC FILE CẦN SAO CHÉP

```
my-phẩm-shop/                    ← Project mới
├── .env.local                   ← COPY từ VinFast
├── .env.production              ← COPY từ VinFast
├── package.json                 ← COPY và sửa name
├── tsconfig.json               ← COPY nguyên
├── next.config.js              ← COPY nguyên
├── lib/
│   └── supabase.ts             ← COPY nguyên (kết nối DB)
├── app/
│   ├── layout.tsx              ← Tạo mới (thay logo/tên)
│   ├── globals.css             ← COPY nguyên
│   ├── wallet/
│   │   └── page.tsx            ← COPY nguyên (Ví người dùng)
│   ├── banker/
│   │   └── page.tsx            ← COPY nguyên (Admin)
│   └── page.tsx                ← Tạo mới (trang chủ mỹ phẩm)
└── public/
    └── images/                 ← Thêm ảnh mỹ phẩm mới
```

---

## 🔥 BƯỚC 1: TẠO PROJECT MỚI

```bash
# Tạo folder mới
mkdir "my-pham-shop"
cd "my-pham-shop"

# Init Next.js project
npx create-next-app@14.2.33 . --typescript --app --no-src-dir
```

---

## 📋 BƯỚC 2: COPY CÁC FILE WALLET

### A. Environment Variables (Dùng chung Supabase)

**Copy nguyên từ VinFast:**
```
.env.local
.env.production
```

**⚠️ QUAN TRỌNG:** Cùng dùng 1 database Supabase nên không cần thay đổi gì!

---

### B. Supabase Connection

**File cần copy:**
```
lib/supabase.ts
```

**Nội dung:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### C. Wallet & Banker Pages

**Copy nguyên 2 folder này:**
```
app/wallet/          ← Toàn bộ folder
app/banker/          ← Toàn bộ folder
```

**Kết quả:**
- `/wallet` → Trang ví người dùng (đăng ký, nạp, rút tiền)
- `/banker` → Trang quản trị (duyệt giao dịch, khóa user)

---

## 🎨 BƯỚC 3: TÙY CHỈNH GIAO DIỆN

### A. Logo & Branding

**Sửa trong `app/layout.tsx`:**

```typescript
// BEFORE (VinFast)
<title>VinFast Wallet</title>

// AFTER (Mỹ phẩm)
<title>Beauty Shop Wallet</title>
```

**Sửa trong `app/wallet/page.tsx`:**

```typescript
// Tìm dòng:
🚗 VinFast Wallet

// Thay bằng:
💄 Beauty Shop Wallet
```

---

### B. Trang chủ mới (Landing Page)

**Tạo file `app/page.tsx`:**

```typescript
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          💄 Beauty Shop
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>
          Hệ thống mua sắm mỹ phẩm trực tuyến
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link 
            href="/wallet" 
            style={{
              padding: '15px 30px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            💳 Mở Ví
          </Link>
          
          <Link 
            href="/banker" 
            style={{
              padding: '15px 30px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              border: '2px solid white',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            🔐 Quản trị
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 BƯỚC 4: DEPENDENCIES

**Copy `package.json` và cài đặt:**

```bash
npm install @supabase/supabase-js
npm install
```

**Hoặc cài thủ công:**
```json
{
  "dependencies": {
    "next": "14.2.33",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

---

## 🗄️ BƯỚC 5: DATABASE (Dùng chung)

**⚠️ KHÔNG CẦN TẠO MỚI!**

Cùng dùng Supabase database của VinFast:
- URL: `https://sjrmdmudpttfsdwqirab.supabase.co`
- Tables: `users`, `transaction_requests`

**Lợi ích:**
- ✅ User có thể dùng 1 tài khoản cho cả 2 website
- ✅ Số dư ví đồng bộ giữa 2 site
- ✅ Banker quản lý tất cả users từ 1 chỗ

---

## 🚀 BƯỚC 6: CHẠY THỬ

```bash
npm run dev
```

**Test:**
1. Mở http://localhost:3000 → Thấy trang chủ mỹ phẩm
2. Click "Mở Ví" → Vào `/wallet` (giống VinFast)
3. Đăng ký tài khoản → Lưu vào Supabase
4. Nạp/Rút tiền → Gửi request
5. Mở `/banker` → Duyệt giao dịch

---

## 🎨 BƯỚC 7: TÙY CHỈNH NÂNG CAO (Optional)

### A. Thay đổi màu sắc chủ đạo

**Trong `app/wallet/page.tsx`, tìm và thay:**

```typescript
// VinFast colors (xanh dương)
background: "linear-gradient(135deg,#1d4ed8,#38bdf8)"

// Beauty Shop colors (tím hồng)
background: "linear-gradient(135deg,#667eea,#764ba2)"
```

---

### B. Thay logo VIP

**Thay file ảnh:**
```
public/images/logo-vip0.jpg  → logo-vip-beauty-0.jpg
public/images/logo-vip1.jpg  → logo-vip-beauty-1.jpg
...
```

**Sửa path trong code:**
```typescript
// app/wallet/page.tsx, tìm:
src={`/images/logo-vip${userData.vipLevel}.jpg`}

// Thay bằng:
src={`/images/logo-vip-beauty-${userData.vipLevel}.jpg`}
```

---

### C. Đổi tên VIP levels

**Trong `app/wallet/page.tsx`, tìm array `vipLevels`:**

```typescript
// BEFORE (VinFast)
const vipLevels = [
  { level: 0, name: "Bạc", icon: "🥈" },
  { level: 1, name: "Vàng", icon: "🥇" },
  { level: 2, name: "Bạch Kim", icon: "💎" },
  { level: 3, name: "Kim Cương", icon: "💎" }
];

// AFTER (Beauty)
const vipLevels = [
  { level: 0, name: "Bronze Beauty", icon: "💄" },
  { level: 1, name: "Silver Beauty", icon: "✨" },
  { level: 2, name: "Gold Beauty", icon: "👑" },
  { level: 3, name: "Diamond Beauty", icon: "💎" }
];
```

---

## 🔗 BƯỚC 8: THÊM TÍNH NĂNG MỸ PHẨM

Bạn có thể thêm:

### A. Trang sản phẩm

**Tạo `app/products/page.tsx`:**
```typescript
export default function ProductsPage() {
  // Hiển thị danh sách mỹ phẩm
  // User click "Mua" → Trừ tiền từ wallet
}
```

### B. Giỏ hàng

**Tạo `app/cart/page.tsx`:**
```typescript
export default function CartPage() {
  // Tính tổng giá
  // Thanh toán bằng số dư wallet
}
```

---

## 📊 CÁCH PHÂN BIỆT 2 WEBSITE

Nếu muốn phân biệt user từ website nào, có thể:

### Option 1: Thêm cột `source` vào database

```sql
ALTER TABLE users ADD COLUMN source TEXT DEFAULT 'vinfast';
```

**Khi đăng ký:**
```typescript
// VinFast website
source: 'vinfast'

// Beauty website  
source: 'beauty'
```

### Option 2: Dùng metadata trong JSONB

```typescript
// Khi insert user
linked_banks: [{
  password: password,
  transactionPassword: transactionPassword,
  source: 'beauty' // ← Thêm này
}]
```

---

## ✅ CHECKLIST DEPLOY MỸ PHẨM WEBSITE

- [ ] Copy folder `lib/`
- [ ] Copy folder `app/wallet/`
- [ ] Copy folder `app/banker/`
- [ ] Copy `.env.local` và `.env.production`
- [ ] Tạo `app/page.tsx` mới (landing page)
- [ ] Sửa title/logo thành "Beauty Shop"
- [ ] Thay màu sắc chủ đạo (tím hồng)
- [ ] Thêm ảnh mỹ phẩm vào `public/images/`
- [ ] `npm install @supabase/supabase-js`
- [ ] `npm run build`
- [ ] Test wallet hoạt động
- [ ] Test banker duyệt giao dịch
- [ ] Deploy lên Netlify

---

## 🎯 KẾT QUẢ CUỐI CÙNG

Bạn sẽ có:
- ✅ **2 websites riêng biệt** (VinFast + Beauty)
- ✅ **1 hệ thống ví dùng chung** (users, balance, transactions)
- ✅ **1 banker quản lý tất cả**
- ✅ User đăng ký 1 lần → Dùng được cả 2 website

---

## 💡 GỢI Ý MỞ RỘNG

1. **Multi-merchant**: Thêm cột `merchant` để phân biệt shop
2. **Commission**: Mỗi shop có % hoa hồng khác nhau
3. **Cross-promotion**: User mua VinFast xe được giảm giá mỹ phẩm
4. **Loyalty points**: VIP level áp dụng cho cả 2 shop

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Supabase connection failed"
→ Kiểm tra `.env.local` đã copy đúng chưa

### Lỗi: "Module not found: @supabase/supabase-js"
→ Chạy `npm install @supabase/supabase-js`

### Wallet không hiển thị đúng
→ Đảm bảo `app/wallet/page.tsx` được copy nguyên vẹn

### Banker không thấy users
→ Kiểm tra Supabase URL có đúng không

---

**🎉 Hoàn tất!** Bạn đã có hệ thống ví tái sử dụng cho nhiều website!
