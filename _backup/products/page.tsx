'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

const allProducts = [
  {
    id: '1',
    name: 'EVBike Velax - Xe Máy Điện Thông Minh',
    price: 29990000,
    originalPrice: 32990000,
    image: '/images/product-1.jpg',
    colors: [
      { name: 'Đỏ', code: '#EF4444' },
      { name: 'Xanh', code: '#3B82F6' },
      { name: 'Đen', code: '#000000' },
    ],
    badge: 'Mới',
    category: 'Xe Máy Điện',
    slug: 'evbike-velax',
  },
  {
    id: '2',
    name: 'EVBike Oris - Phong Cách Retro',
    price: 23490000,
    image: '/images/product-2.jpg',
    colors: [
      { name: 'Hồng', code: '#EC4899' },
      { name: 'Xanh Lam', code: '#06B6D4' },
      { name: 'Trắng', code: '#FFFFFF' },
    ],
    category: 'Xe Máy Điện',
    slug: 'evbike-oris',
  },
  {
    id: '3',
    name: 'EVBike X-Sky - Nhỏ Gọn Linh Hoạt',
    price: 10990000,
    originalPrice: 11990000,
    image: '/images/product-3.jpg',
    colors: [
      { name: 'Trắng Đỏ', code: '#FF6B6B' },
      { name: 'Xám', code: '#6B7280' },
      { name: 'Xanh', code: '#10B981' },
    ],
    badge: 'Sale',
    category: 'Xe Máy Điện',
    slug: 'evbike-x-sky',
  },
  {
    id: '4',
    name: 'EVBike i8 Vintage - Cổ Điển',
    price: 12990000,
    originalPrice: 14490000,
    image: '/images/product-4.jpg',
    colors: [
      { name: 'Xanh Lá', code: '#22C55E' },
      { name: 'Nâu Cam', code: '#F97316' },
      { name: 'Trắng Sữa', code: '#FEF3C7' },
    ],
    category: 'Xe Gắn Máy Điện',
    slug: 'evbike-i8-vintage',
  },
  {
    id: '5',
    name: 'EVBike Ossy - Thông Minh Gia Đình',
    price: 21990000,
    image: '/images/product-5.jpg',
    colors: [
      { name: 'Xanh Dương', code: '#3B82F6' },
      { name: 'Đỏ', code: '#EF4444' },
      { name: 'Trắng', code: '#F3F4F6' },
    ],
    category: 'Xe Máy Điện',
    slug: 'evbike-ossy',
  },
  {
    id: '6',
    name: 'EVBike Ocean - Cổ Điển Thanh Lịch',
    price: 16990000,
    image: '/images/product-6.jpg',
    colors: [
      { name: 'Xanh Cyan', code: '#06B6D4' },
      { name: 'Hồng', code: '#EC4899' },
      { name: 'Be', code: '#D4B896' },
    ],
    category: 'Xe Máy Điện',
    slug: 'evbike-ocean',
  },
  {
    id: '7',
    name: 'EVBike Vekoo - Soobin Edition',
    price: 27990000,
    image: '/images/product-7.jpg',
    colors: [
      { name: 'Xanh', code: '#3B82F6' },
      { name: 'Đen', code: '#000000' },
    ],
    badge: 'Phiên Bản Đặc Biệt',
    category: 'Xe Máy Điện',
    slug: 'evbike-vekoo',
  },
  {
    id: '8',
    name: 'EVBike Voltguard U50 - Cao Cấp',
    price: 35990000,
    image: '/images/product-8.jpg',
    colors: [
      { name: 'Trắng', code: '#FFFFFF' },
      { name: 'Đỏ', code: '#DC2626' },
      { name: 'Đen', code: '#1F2937' },
    ],
    badge: 'Mới',
    category: 'Xe Máy Điện',
    slug: 'evbike-voltguard-u50',
  },
];

const categories = [
  { id: 'all', name: 'Tất Cả' },
  { id: 'scooter', name: 'Xe Máy Điện' },
  { id: 'bike', name: 'Xe Đạp Điện' },
  { id: 'premium', name: 'Dòng Cao Cấp' },
];

const priceRanges = [
  { id: 'all', name: 'Tất Cả Mức Giá', min: 0, max: Infinity },
  { id: 'under15', name: 'Dưới 15 triệu', min: 0, max: 15000000 },
  { id: '15to25', name: '15 - 25 triệu', min: 15000000, max: 25000000 },
  { id: '25to35', name: '25 - 35 triệu', min: 25000000, max: 35000000 },
  { id: 'over35', name: 'Trên 35 triệu', min: 35000000, max: Infinity },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Filter products
  let filteredProducts = allProducts.filter((product) => {
    const priceRange = priceRanges.find((r) => r.id === selectedPriceRange);
    return (
      (selectedCategory === 'all' || product.category.includes(selectedCategory)) &&
      product.price >= (priceRange?.min || 0) &&
      product.price <= (priceRange?.max || Infinity)
    );
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sản Phẩm</h1>
          <p className="text-lg text-white/90">
            Khám phá bộ sưu tập xe điện thông minh của chúng tôi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Danh Mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mức Giá</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedPriceRange === range.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tính Năng</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pin Lithium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Màn Hình LCD</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Kết Nối App</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Chống Nước</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600">
                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  <option value="default">Mặc Định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="mt-2 text-gray-600">
                  Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
