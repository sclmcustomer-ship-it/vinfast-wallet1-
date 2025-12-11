'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-[1.3fr,1fr] gap-8 items-center">
            {/* Hero Text */}
            <div>
              <p className="text-xs uppercase tracking-widest text-green-700 font-semibold mb-2">
                XE ĐIỆN THƯƠNG HIỆU YD
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Phong cách hiện đại,{' '}
                <span className="text-green-600">di chuyển thông minh</span>
              </h1>
              <p className="text-gray-600 mb-6 max-w-xl">
                Thương Hiệu YD mang đến giải pháp di chuyển xanh, tối ưu chi phí,
                vận hành mạnh mẽ và an toàn cho hành trình trong thành phố.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link 
                  href="#products"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition"
                >
                  Xem dòng xe nổi bật
                </Link>
                <Link 
                  href="#test-ride"
                  className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full font-semibold transition"
                >
                  Đăng ký lái thử
                </Link>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Quãng đường dài, tiết kiệm chi phí
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Bảo hành pin & động cơ theo tiêu chuẩn
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Hệ thống cửa hàng & trạm bảo hành toàn quốc
                </li>
              </ul>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-md aspect-[4/3] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center text-center p-6">
                <div>
                  <p className="font-semibold text-gray-700">HÌNH XE / BANNER YD</p>
                  <p className="text-xs text-gray-500 mt-2">(thay bằng ảnh thật sau)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SẢN PHẨM MỚI */}
      <section className="py-12 md:py-16" id="products">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">SẢN PHẨM MỚI THƯƠNG HIỆU YD</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveCategory('scooter')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === 'scooter'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Xe máy điện
              </button>
              <button
                onClick={() => setActiveCategory('ebike')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === 'ebike'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Xe đạp trợ lực
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Card 1 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH YD CITY PRO
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-1">Mới</p>
                <h3 className="text-xl font-bold mb-2">YD City Pro</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Thiết kế nhỏ gọn, linh hoạt trong mọi ngõ phố.
                </p>
                <p className="text-lg font-bold mb-3">Từ 18.990.000 đ</p>
                <Link 
                  href="/products/city-pro"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Chọn mua sản phẩm →
                </Link>
              </div>
            </article>

            {/* Product Card 2 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH YD SPORT MAX
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-1">Mới</p>
                <h3 className="text-xl font-bold mb-2">YD Sport Max</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Động cơ mạnh mẽ, phong cách thể thao nổi bật.
                </p>
                <p className="text-lg font-bold mb-3">Từ 25.490.000 đ</p>
                <Link 
                  href="/products/sport-max"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Chọn mua sản phẩm →
                </Link>
              </div>
            </article>

            {/* Product Card 3 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH YD FAMILY E
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-1">Mới</p>
                <h3 className="text-xl font-bold mb-2">YD Family E</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Êm ái, an toàn, phù hợp cho cả gia đình.
                </p>
                <p className="text-lg font-bold mb-3">Từ 21.990.000 đ</p>
                <Link 
                  href="/products/family-e"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Chọn mua sản phẩm →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* XE MÁY ĐIỆN - HORIZONTAL CARDS */}
      <section className="py-12 md:py-16 bg-gray-50" id="e-scooter">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">XE MÁY ĐIỆN THƯƠNG HIỆU YD</h2>
          
          <div className="space-y-6">
            {/* Horizontal Card 1 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition">
              <div className="md:w-5/12 h-64 md:h-auto bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH YD CITY PRO
              </div>
              <div className="md:w-7/12 p-6 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-2">Dòng City</p>
                <h3 className="text-2xl font-bold mb-3">YD City Pro</h3>
                <p className="text-gray-600 mb-4">
                  Tối ưu quãng đường, tiết kiệm điện năng, dễ dàng di chuyển trong đô thị.
                </p>
                <p className="text-xl font-bold mb-4">Từ 18.990.000 đ</p>
                <Link 
                  href="/products/city-pro"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Chọn mua sản phẩm →
                </Link>
              </div>
            </article>

            {/* Horizontal Card 2 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition">
              <div className="md:w-5/12 h-64 md:h-auto bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH YD SPORT MAX
              </div>
              <div className="md:w-7/12 p-6 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-2">Dòng Sport</p>
                <h3 className="text-2xl font-bold mb-3">YD Sport Max</h3>
                <p className="text-gray-600 mb-4">
                  Khung sườn chắc chắn, tăng tốc mạnh mẽ, phù hợp phong cách cá tính.
                </p>
                <p className="text-xl font-bold mb-4">Từ 27.990.000 đ</p>
                <Link 
                  href="/products/sport-max"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Chọn mua sản phẩm →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* XE ĐẠP TRỢ LỰC */}
      <section className="py-12 md:py-16" id="e-bike">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">XE ĐẠP TRỢ LỰC YD</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* E-Bike Card 1 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH E-BIKE CITY
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-1">Thành phố</p>
                <h3 className="text-xl font-bold mb-2">YD E-Bike City</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nhẹ, gọn, phù hợp di chuyển hằng ngày trong nội thành.
                </p>
                <p className="text-lg font-bold mb-3">Từ 12.990.000 đ</p>
                <Link 
                  href="/products/ebike-city"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Xem chi tiết →
                </Link>
              </div>
            </article>

            {/* E-Bike Card 2 */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                ẢNH E-BIKE TOURING
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold mb-1">Đường dài</p>
                <h3 className="text-xl font-bold mb-2">YD E-Bike Touring</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Thiết kế tối ưu cho quãng đường xa và chuyến đi cuối tuần.
                </p>
                <p className="text-lg font-bold mb-3">Từ 15.490.000 đ</p>
                <Link 
                  href="/products/ebike-touring"
                  className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
                >
                  Xem chi tiết →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CÔNG NGHỆ */}
      <section className="py-12 md:py-16 bg-gray-50" id="tech">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">CÔNG NGHỆ NỔI BẬT TRÊN XE YD</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-3">Hệ thống pin thông minh</h3>
              <p className="text-gray-600">
                Quản lý pin tối ưu tuổi thọ, đảm bảo an toàn và hiệu suất ổn định.
              </p>
            </article>

            <article className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-3">Động cơ mạnh mẽ, êm ái</h3>
              <p className="text-gray-600">
                Tăng tốc ổn định, tiếng ồn thấp, phù hợp di chuyển trong đô thị.
              </p>
            </article>

            <article className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-3">Kết nối & theo dõi</h3>
              <p className="text-gray-600">
                Theo dõi quãng đường, trạng thái pin, lịch bảo dưỡng gợi ý qua ứng dụng.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ĐĂNG KÝ LÁI THỬ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-600 to-green-800 text-white" id="test-ride">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">ĐĂNG KÝ LÁI THỬ XE YD</h2>
              <p className="text-green-50 leading-relaxed">
                Trải nghiệm thực tế trước khi quyết định. Đăng ký ngay, đội ngũ Thương Hiệu YD
                sẽ liên hệ để sắp xếp lịch lái thử phù hợp.
              </p>
            </div>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Họ và tên"
                required
                className="w-full px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                required
                className="w-full px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="text"
                placeholder="Khu vực / Tỉnh thành"
                className="w-full px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-white text-green-700 rounded-full font-bold hover:bg-yellow-400 hover:text-green-900 transition"
              >
                Gửi đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HỖ TRỢ & BẢO HÀNH */}
      <section className="py-12 md:py-16" id="support">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">HỖ TRỢ & BẢO HÀNH THƯƠNG HIỆU YD</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Trung tâm bảo hành</h3>
              <p className="text-gray-600">
                Hệ thống điểm tiếp nhận bảo hành, sửa chữa theo tiêu chuẩn, sẵn sàng hỗ trợ khi
                xe cần được kiểm tra và bảo dưỡng.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Hotline CSKH</h3>
              <p className="text-gray-900 font-semibold">📞 0822 699 299</p>
              <p className="text-gray-900 font-semibold">📞 0944 699 299</p>
              <p className="text-gray-600 mt-2 text-sm">
                Thời gian hỗ trợ: 8:00 – 21:00 hằng ngày (trừ ngày lễ, tết).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
