import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Sample product data
const featuredProducts = [
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
];

export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-lg text-gray-600">
            Khám phá dòng xe điện thông minh với công nghệ tiên tiến
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Xem Tất Cả Sản Phẩm
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Cam kết mang đến trải nghiệm tốt nhất cho khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Công Nghệ Hiện Đại
              </h3>
              <p className="text-gray-600">
                Pin Lithium thế hệ mới, quãng đường di chuyển xa, sạc nhanh
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bảo Hành Toàn Diện
              </h3>
              <p className="text-gray-600">
                Bảo hành chính hãng, hệ thống bảo hành rộng khắp cả nước
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Giá Cả Hợp Lý
              </h3>
              <p className="text-gray-600">
                Chính sách giá tốt nhất, nhiều chương trình khuyến mãi hấp dẫn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Đăng Ký Lái Thử Ngay
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Trải nghiệm xe điện thông minh hoàn toàn miễn phí
          </p>
          <Link
            href="/test-drive"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-lg transition-colors shadow-xl"
          >
            Đăng Ký Ngay
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
