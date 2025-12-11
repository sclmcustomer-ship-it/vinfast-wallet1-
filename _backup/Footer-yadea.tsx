'use client';

import Link from 'next/link';

export default function Footer() {
  const productLinks = [
    { name: 'VinFast Vekoo', href: '/products/vekoo' },
    { name: 'VinFast Velax', href: '/products/velax' },
    { name: 'VinFast Oris', href: '/products/oris' },
    { name: 'VinFast Voltguard', href: '/products/voltguard' },
    { name: 'VinFast Ossy', href: '/products/ossy' },
  ];

  const aboutLinks = [
    { name: 'Về VinFast', href: '/about' },
    { name: 'Cửa Hàng', href: '/stores' },
    { name: 'Công Nghệ', href: '/technology' },
    { name: 'Tin Tức', href: '/news' },
    { name: 'Tuyển Dụng', href: '/careers' },
  ];

  const supportLinks = [
    { name: 'Hỗ Trợ & Bảo Hành', href: '/support' },
    { name: 'Phương Thức Thanh Toán', href: '/payment' },
    { name: 'Phương Thức Vận Chuyển', href: '/shipping' },
    { name: 'Chính Sách Đổi Trả', href: '/return-policy' },
    { name: 'Chính Sách Bảo Mật', href: '/privacy' },
    { name: 'Cơ Hội Hợp Tác', href: '/partnership' },
    { name: 'Liên Hệ', href: '/contact' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="text-3xl font-bold text-white mb-6">VinFast</div>
            <p className="text-sm mb-4 leading-relaxed">
              CÔNG TY TNHH ELECTRIC MOTORCYCLE VINFAST VIỆT NAM
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Mã Số Thuế: 2400866767
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Địa Chỉ: Lô O1-2, O1-3, O1-5, O1-6, O1-7 Khu công nghiệp Quang Châu, 
              Phường Nếnh, Tỉnh Bắc Ninh, Việt Nam.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">SẢN PHẨM MỚI</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm hover:text-green-400 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">VỀ CHÚNG TÔI</h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm hover:text-green-400 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">HỖ TRỢ</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm hover:text-green-400 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">THEO DÕI VINFAST</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.youtube.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">THÔNG TIN LIÊN HỆ</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">📞</span>
                  <span>CSKH: 1900 636 803</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">☎️</span>
                  <span>Liên Hệ Hợp Tác: (+84) 204 6299 288</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✉️</span>
                  <span>Email: market@vinfast.com.vn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2025 – Bản quyền thuộc về Công ty TNHH Electric Motorcycle VinFast Việt Nam.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="http://online.gov.vn" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                <span className="text-xs">🏛️ Đã đăng ký Bộ Công Thương</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
