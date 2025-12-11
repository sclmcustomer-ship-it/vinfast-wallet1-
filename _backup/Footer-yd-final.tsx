'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">THƯƠNG HIỆU YD</h4>
            <p className="text-sm leading-relaxed">
              Thương Hiệu YD hướng đến giải pháp di chuyển xanh, an toàn và tiết kiệm,
              đồng hành cùng người dùng trong mọi hành trình.
            </p>
          </div>

          {/* Store Locations */}
          <div id="stores">
            <h4 className="text-white font-bold text-base mb-4">HỆ THỐNG CỬA HÀNG</h4>
            <p className="text-sm">
              Đang cập nhật danh sách cửa hàng & đại lý trên toàn quốc.
            </p>
          </div>

          {/* Online Shopping */}
          <div id="online">
            <h4 className="text-white font-bold text-base mb-4">KÊNH MUA HÀNG ONLINE</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm hover:text-white transition">
                Website chính thức
              </Link>
              <a 
                href="https://shopee.vn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm hover:text-white transition"
              >
                Shopee
              </a>
              <a 
                href="https://lazada.vn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm hover:text-white transition"
              >
                Lazada
              </a>
            </div>
          </div>

          {/* Partnership */}
          <div id="partner">
            <h4 className="text-white font-bold text-base mb-4">CƠ HỘI HỢP TÁC</h4>
            <p className="text-sm mb-2">Liên hệ hợp tác phân phối, đại lý:</p>
            <p className="text-sm font-semibold mb-1">Email: contact@thuonghieuyd.vn</p>
            <p className="text-sm font-semibold">Hotline: 0822 699 299</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Thương Hiệu YD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
