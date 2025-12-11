'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 py-3 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 min-w-[170px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-extrabold text-base">
              YD
            </div>
            <div className="flex flex-col leading-tight">
              <strong className="text-sm">Thương Hiệu YD</strong>
              <small className="text-[11px] text-gray-600">Xe điện thông minh</small>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 flex-1">
            {/* Xe máy điện Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('scooter')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
                Xe máy điện
              </button>
              {activeDropdown === 'scooter' && (
                <div className="absolute left-0 top-full mt-2 bg-white shadow-xl rounded-lg p-5 grid grid-cols-3 gap-4 min-w-[540px] z-50">
                  <div>
                    <h4 className="text-xs uppercase font-bold mb-2">Dòng nổi bật</h4>
                    <Link href="/products/city-pro" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD City Pro</Link>
                    <Link href="/products/urban-s" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Urban S</Link>
                    <Link href="/products/lite" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Lite</Link>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold mb-2">Dòng pin Lithium</h4>
                    <Link href="/products/lithium-x" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Lithium X</Link>
                    <Link href="/products/lithium-max" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Lithium Max</Link>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold mb-2">Dòng cao cấp</h4>
                    <Link href="/products/premium" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Premium</Link>
                    <Link href="/products/signature" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Signature</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Xe đạp trợ lực Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('ebike')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
                Xe đạp trợ lực
              </button>
              {activeDropdown === 'ebike' && (
                <div className="absolute left-0 top-full mt-2 bg-white shadow-xl rounded-lg p-5 grid grid-cols-2 gap-4 min-w-[360px] z-50">
                  <div>
                    <h4 className="text-xs uppercase font-bold mb-2">Dòng thành phố</h4>
                    <Link href="/products/ebike-city" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD E-Bike City</Link>
                    <Link href="/products/ebike-compact" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD E-Bike Compact</Link>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold mb-2">Dòng đường dài</h4>
                    <Link href="/products/touring" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Touring</Link>
                    <Link href="/products/trek" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Trek</Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="#tech" className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
              Công nghệ
            </Link>
            <Link href="#support" className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
              Hỗ trợ & bảo hành
            </Link>
            <Link href="#e-scooter" className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
              Xe máy điện
            </Link>
            <Link href="#e-bike" className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
              Xe đạp trợ lực
            </Link>
            <Link href="#stores" className="px-3 py-2 text-gray-700 hover:text-green-600 transition">
              Cửa hàng
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link 
              href="#online"
              className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:border-green-600 hover:text-green-600 transition"
            >
              Mua hàng online
            </Link>
            <a 
              href="tel:0822699299"
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              ☎ 0822 699 299
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden ml-auto text-2xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t py-4 space-y-2">
            <div>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'scooter-mobile' ? null : 'scooter-mobile')}
                className="w-full text-left px-3 py-2 text-gray-700 hover:text-green-600"
              >
                Xe máy điện {activeDropdown === 'scooter-mobile' ? '▲' : '▼'}
              </button>
              {activeDropdown === 'scooter-mobile' && (
                <div className="pl-6 py-2 space-y-1">
                  <Link href="/products/city-pro" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD City Pro</Link>
                  <Link href="/products/urban-s" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Urban S</Link>
                  <Link href="/products/lite" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Lite</Link>
                </div>
              )}
            </div>

            <div>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'ebike-mobile' ? null : 'ebike-mobile')}
                className="w-full text-left px-3 py-2 text-gray-700 hover:text-green-600"
              >
                Xe đạp trợ lực {activeDropdown === 'ebike-mobile' ? '▲' : '▼'}
              </button>
              {activeDropdown === 'ebike-mobile' && (
                <div className="pl-6 py-2 space-y-1">
                  <Link href="/products/ebike-city" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD E-Bike City</Link>
                  <Link href="/products/touring" className="block text-sm text-gray-600 hover:text-green-600 py-1">YD Touring</Link>
                </div>
              )}
            </div>

            <Link href="#tech" className="block px-3 py-2 text-gray-700 hover:text-green-600">Công nghệ</Link>
            <Link href="#support" className="block px-3 py-2 text-gray-700 hover:text-green-600">Hỗ trợ & bảo hành</Link>
            <Link href="#stores" className="block px-3 py-2 text-gray-700 hover:text-green-600">Cửa hàng</Link>
            
            <div className="pt-3 border-t">
              <Link 
                href="#online"
                className="block text-center px-4 py-2 text-sm border border-gray-300 rounded-full hover:border-green-600 hover:text-green-600 mb-2"
              >
                Mua hàng online
              </Link>
              <a 
                href="tel:0822699299"
                className="block text-center text-sm font-semibold text-green-700"
              >
                ☎ 0822 699 299
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
