# Hướng dẫn tích hợp Ví Yadea vào Website

## 📁 Cấu trúc Files

```
components/
  └── WalletApp.tsx          # Component ví chính (đã tạo)
  
app/
  └── wallet/
      └── page.tsx           # Trang ví độc lập (giữ nguyên)
```

## 🔧 Cách tích hợp

### Option 1: Sử dụng trang ví độc lập (Đơn giản nhất)

Thêm link vào website chính:

```tsx
// Trong trang chủ hoặc menu
<a href="/wallet" className="wallet-button">
  Mở Ví Yadea 💰
</a>
```

### Option 2: Nhúng ví vào trang (Modal/Popup)

1. **Cài đặt trong trang chủ:**

```tsx
'use client';
import { useState } from 'react';

export default function HomePage() {
  const [showWallet, setShowWallet] = useState(false);

  return (
    <>
      {/* Nội dung website của anh */}
      <button onClick={() => setShowWallet(true)}>
        Mở Ví
      </button>

      {/* Modal ví */}
      {showWallet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            height: '90vh',
            background: '#0f172a',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Nút đóng */}
            <button
              onClick={() => setShowWallet(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 10000,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            
            {/* Nhúng iframe ví */}
            <iframe
              src="/wallet"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

### Option 3: Tích hợp sâu (Component)

⚠️ **Chưa hoàn chỉnh** - Cần copy toàn bộ components từ `app/wallet/page.tsx` sang các file riêng.

## 🎯 Khuyến nghị

**→ Sử dụng Option 1 hoặc Option 2** vì:
- ✅ Đơn giản, dễ bảo trì
- ✅ Không ảnh hưởng đến code hiện tại
- ✅ Ví hoạt động độc lập, ổn định
- ✅ Dễ cập nhật sau này

## 📝 Ví dụ tích hợp vào trang chủ

```tsx
// app/page.tsx
'use client';
import { useState } from 'react';

export default function Home() {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <header>
        <nav>
          <a href="/">Trang chủ</a>
          <a href="/about">Giới thiệu</a>
          <button onClick={() => setShowWalletModal(true)}>
            💰 Ví điện tử
          </button>
        </nav>
      </header>

      {/* Content website */}
      <main>
        <h1>THƯƠNG HIỆU YD</h1>
        <p>Thương Hiệu YD hướng đến giải pháp di chuyển xanh...</p>
        
        {/* Nút mở ví nhanh */}
        <div className="wallet-quick-access">
          <button 
            onClick={() => setShowWalletModal(true)}
            className="btn-wallet-big"
          >
            <span>💰</span>
            <span>Mở Ví Yadea</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <h3>HỆ THỐNG CỬA HÀNG</h3>
        <p>Đang cập nhật...</p>
        
        <h3>KÊNH MUA HÀNG ONLINE</h3>
        <ul>
          <li><a href="#">Website chính thức</a></li>
          <li><a href="#">Shopee</a></li>
          <li><a href="#">Lazada</a></li>
        </ul>
        
        <h3>CƠ HỘI HỢP TÁC</h3>
        <p>Email: contact@thuonghieuyd.vn</p>
        <p>Hotline: 0822 699 299</p>
      </footer>

      {/* Modal Ví */}
      {showWalletModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-button"
              onClick={() => setShowWalletModal(false)}
            >
              ✕
            </button>
            <iframe
              src="/wallet"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .wallet-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .wallet-modal-content {
          width: 100%;
          max-width: 480px;
          height: 90vh;
          background: #0f172a;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        
        .btn-wallet-big {
          padding: 16px 32px;
          font-size: 18px;
          background: linear-gradient(135deg, #1d4ed8, #38bdf8);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
```

## 🚀 Triển khai

1. **Giữ nguyên ví hiện tại:** `/wallet` vẫn hoạt động độc lập
2. **Tích hợp vào trang chủ:** Dùng modal/popup để mở ví
3. **Website chính:** Giữ các phần THƯƠNG HIỆU YD, CỬA HÀNG, LIÊN HỆ...
4. **Ví tách biệt:** Chỉ quản lý tiền, VIP, giao dịch

## 📱 Responsive

Ví đã được tối ưu cho mobile, khi nhúng vào website sẽ tự động adapt:
- Desktop: Hiển thị dạng modal 480px
- Mobile: Hiển thị fullscreen
