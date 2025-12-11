'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const productCategories = [
    { name: 'Xe Máy Điện', href: '/products/xe-may-dien' },
    { name: 'Xe Gắn Máy Điện', href: '/products/xe-gan-may-dien' },
    { name: 'Sản Phẩm Mới', href: '/products/new' },
    { name: 'Bán Chạy Nhất', href: '/products/best-seller' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Phone & Links */}
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <a href="tel:1900636803" className="hover:text-green-100 transition flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              CSKH: 1900 636 803
            </a>
            <a href="mailto:market@vinfast.com.vn" className="hidden md:flex items-center hover:text-green-100 transition">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              market@vinfast.com.vn
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/stores" className="hover:text-green-100 transition">Cửa Hàng</Link>
            <Link href="/about" className="hover:text-green-100 transition">Về Chúng Tôi</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-3xl font-bold text-green-600">
              VinFast
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium transition py-2">
                <span>Sản Phẩm</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl rounded-lg py-4 border border-gray-100">
                  {productCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/technology" className="text-gray-700 hover:text-green-600 font-medium transition">
              Công Nghệ
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-green-600 font-medium transition">
              Tin Tức
            </Link>
            <Link href="/stores" className="text-gray-700 hover:text-green-600 font-medium transition">
              Cửa Hàng
            </Link>
            <Link href="/support" className="text-gray-700 hover:text-green-600 font-medium transition">
              Hỗ Trợ
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition">
              Liên Hệ
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-green-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link 
              href="/test-drive" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Lái Thử
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link href="/products" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Sản Phẩm
            </Link>
            <Link href="/technology" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Công Nghệ
            </Link>
            <Link href="/news" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Tin Tức
            </Link>
            <Link href="/stores" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Cửa Hàng
            </Link>
            <Link href="/support" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Hỗ Trợ
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
              Liên Hệ
            </Link>
            <Link 
              href="/test-drive" 
              className="block bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-center hover:bg-green-700 transition"
            >
              Đăng Ký Lái Thử
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
