# EVBike - Hệ Thống Website Bán Xe Điện Thông Minh

Website bán xe điện thông minh với thiết kế hiện đại, responsive và đầy đủ tính năng, được xây dựng với Next.js 14, TypeScript và Tailwind CSS.

## ✨ Tính Năng

### 🏠 Trang Chủ
- **Hero Banner**: Slider tự động với 3 slide giới thiệu sản phẩm
- **Sản Phẩm Nổi Bật**: Grid hiển thị các sản phẩm hot
- **Features Section**: 3 tính năng nổi bật (Công nghệ, Bảo hành, Giá cả)
- **CTA Section**: Call-to-action đăng ký lái thử

### 🛍️ Trang Sản Phẩm
- **Bộ lọc sản phẩm**:
  - Lọc theo danh mục (Xe Máy Điện, Xe Đạp Điện, Cao Cấp)
  - Lọc theo mức giá (5 khoảng giá khác nhau)
  - Lọc theo tính năng (Pin Lithium, Màn hình LCD, App, Chống nước)
- **Sắp xếp sản phẩm**: Theo giá, tên
- **Product Card**: Hiển thị ảnh, tên, giá, màu sắc, badge
- **Responsive Grid**: 1 cột (mobile) → 2 cột (tablet) → 3 cột (desktop)

### 📱 Components

#### Header
- **Top Bar**: Hotline, email, links nhanh
- **Main Navigation**: Logo, menu chính, search, CTA button
- **Dropdown Menu**: Menu sản phẩm với submenu
- **Mobile Menu**: Hamburger menu responsive
- **Search Bar**: Thanh tìm kiếm có thể toggle

#### Footer
- **4 cột thông tin**: Công ty, Sản phẩm, Về chúng tôi, Hỗ trợ
- **Stats Section**: 4 chỉ số (200+ cửa hàng, 50K+ khách hàng, 15+ năm, 100% chính hãng)
- **Social Media**: Facebook, Instagram, YouTube, TikTok
- **Responsive**: 1 cột (mobile) → 2 cột (tablet) → 4 cột (desktop)

#### HeroBanner
- **Auto Slider**: Tự động chuyển slide sau 5 giây
- **Navigation**: Nút Previous/Next, dots indicator
- **Responsive**: Tối ưu cho mobile, tablet, desktop
- **CTA Buttons**: 2 buttons với gradient background

#### ProductCard
- **Color Selector**: Chọn màu sắc sản phẩm
- **Price Display**: Hiển thị giá, giá gốc (nếu có sale)
- **Badge**: "Mới", "Sale", "Phiên Bản Đặc Biệt"
- **Quick View**: Button xem nhanh khi hover
- **Wishlist**: Thêm vào danh sách yêu thích
- **Hover Effects**: Animation mượt mà

### 📄 Trang Liên Hệ
- **Contact Form**: Form liên hệ với validation
- **Thông tin liên lạc**: Địa chỉ, điện thoại, email, giờ làm việc
- **Social Links**: Links đến mạng xã hội
- **Info Cards**: Design đẹp với icons

### ℹ️ Trang Giới Thiệu
- **Câu chuyện công ty**: Story section
- **Giá trị cốt lõi**: 3 giá trị (Chất lượng, Bền vững, Khách hàng)
- **Stats**: Thống kê ấn tượng
- **Sứ mệnh & Tầm nhìn**: Vision & mission

## 🚀 Công Nghệ Sử Dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Inter (Google Fonts với Vietnamese support)
- **Icons**: SVG icons tùy chỉnh

## 📦 Cài Đặt

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục dự án
cd "BI虂nh vinfast"

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Start production server
npm start
```

## 🌐 Truy Cập

- **Development**: http://localhost:3000
- **Production**: Deploy lên Vercel, Netlify hoặc hosting khác

## 📁 Cấu Trúc Thư Mục

```
├── app/
│   ├── about/              # Trang giới thiệu
│   ├── contact/            # Trang liên hệ
│   ├── products/           # Trang danh sách sản phẩm
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout với Header & Footer
│   └── page.tsx            # Trang chủ
├── components/
│   ├── Header.tsx          # Component Header
│   ├── Footer.tsx          # Component Footer
│   ├── HeroBanner.tsx      # Component Hero Banner
│   └── ProductCard.tsx     # Component Product Card
├── public/
│   └── images/             # Thư mục chứa hình ảnh
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🎨 Thiết Kế

### Màu Sắc Chính
- **Primary**: Blue (#2563EB)
- **Secondary**: Purple (#9333EA)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Font Family**: Inter (Vietnamese support)
- **Heading**: Bold, 2xl-4xl
- **Body**: Regular, base-lg

### Breakpoints (Tailwind)
- **sm**: 640px (Mobile)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px (Large Desktop)

## ✅ Các Trang Đã Hoàn Thành

- ✅ Trang chủ (Home Page)
- ✅ Trang sản phẩm (Products Page)
- ✅ Trang liên hệ (Contact Page)
- ✅ Trang giới thiệu (About Page)
- ✅ Header & Footer Components
- ✅ HeroBanner Component
- ✅ ProductCard Component

## 🔜 Tính Năng Có Thể Mở Rộng

- 📄 Trang chi tiết sản phẩm
- 🛒 Giỏ hàng & Checkout
- 🔐 Đăng nhập/Đăng ký
- 📝 Trang tin tức/Blog
- 🗺️ Store Locator với Google Maps
- 🔍 Tìm kiếm nâng cao
- ⭐ Đánh giá sản phẩm
- 💬 Live chat support
- 📱 PWA (Progressive Web App)
- 🌐 Đa ngôn ngữ (i18n)

## 🎯 SEO & Performance

- ✅ Semantic HTML
- ✅ Meta tags (title, description, keywords)
- ✅ Responsive images
- ✅ Optimized loading
- ✅ Mobile-first design
- ✅ Fast page load

## 📱 Responsive Design

Website được thiết kế responsive hoàn toàn:

- **Mobile (< 768px)**: 1 cột, hamburger menu, touch-friendly
- **Tablet (768px - 1024px)**: 2 cột, simplified layout
- **Desktop (> 1024px)**: Full layout với tất cả tính năng

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📝 License

MIT License - Tự do sử dụng cho dự án cá nhân và thương mại.

## 📞 Liên Hệ

- **Website**: https://evbike.vn
- **Email**: support@evbike.vn
- **Hotline**: 1900 636 803

---

**Lưu ý**: Đây là template website demo. Hãy thay thế nội dung, hình ảnh và thông tin liên lạc bằng thông tin thực tế của doanh nghiệp bạn.

## 🖼️ Thêm Hình Ảnh

Để website hoạt động đầy đủ, bạn cần thêm hình ảnh vào thư mục `public/images/`:

- `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` (Hero banner images)
- `product-1.jpg` đến `product-8.jpg` (Product images)
- Kích thước đề xuất: 1200x800px (hero), 800x600px (products)

## 🔧 Tùy Chỉnh

### Thay đổi màu sắc
Chỉnh sửa file `tailwind.config.ts` để thay đổi color palette.

### Thay đổi sản phẩm
Chỉnh sửa data trong các file:
- `app/page.tsx` (sản phẩm trang chủ)
- `app/products/page.tsx` (tất cả sản phẩm)

### Thay đổi thông tin liên lạc
Chỉnh sửa các component:
- `components/Header.tsx`
- `components/Footer.tsx`
- `app/contact/page.tsx`
