import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

// VinFast Electric Bikes - Yadea Style
const featuredProducts = [
  {
    id: 1,
    name: 'VinFast Vekoo Premium',
    price: '42,900,000',
    originalPrice: '45,900,000',
    image: '/images/engwe-t14.jpg',
    badge: 'MỚI',
    colors: ['Đen Bóng', 'Xanh Ngọc', 'Đỏ Cherry'],
    description: 'PHONG CÁCH HIỆN ĐẠI - CÔNG NGHỆ THÔNG MINH'
  },
  {
    id: 2,
    name: 'VinFast Velax Sport',
    price: '35,990,000',
    image: '/images/engwe-t14.jpg',
    badge: 'BÁN CHẠY',
    colors: ['Trắng Ngọc Trai', 'Xám Titan'],
    description: 'LÁI THÔNG MINH - HÀNH TRÌNH THƯ GIÃN'
  },
  {
    id: 3,
    name: 'VinFast Oris Retro',
    price: '28,490,000',
    image: '/images/engwe-t14.jpg',
    colors: ['Hồng Anh Đào', 'Xanh Huyền Bí', 'Be Vintage'],
    description: 'PHONG CÁCH RETRO ĐỘC ĐÁO'
  },
  {
    id: 4,
    name: 'VinFast X-Sky Mini',
    price: '16,990,000',
    originalPrice: '18,990,000',
    image: '/images/engwe-t14.jpg',
    badge: 'GIẢM GIÁ',
    colors: ['Trắng', 'Đen', 'Xanh Dương', 'Xám'],
    description: 'NHỎ GỌN - LINH HOẠT'
  }
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Banner - Yadea Style */}
        <section className="relative h-[600px] bg-gradient-to-r from-green-600 to-green-400">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-4">
            <div className="text-white max-w-2xl">
              <h1 className="text-6xl font-bold mb-4">VinFast Vekoo</h1>
              <p className="text-2xl mb-8">TIÊN PHONG - THÔNG MINH - HIỆN ĐẠI</p>
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
                ĐĂNG KÝ LÁI THỬ
              </button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">SẢN PHẨM NỔI BẬT</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-12"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group">
                  <div className="relative h-64 bg-gray-200">
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                        {product.badge}
                      </span>
                    )}
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">{product.originalPrice} VND</span>
                      )}
                      <span className="text-2xl font-bold text-green-600">{product.price} VND</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                      CHỌN MUA SẢN PHẨM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Figures - Environmental Impact */}
        <section className="py-16 px-4 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">45,508,797</div>
                <div className="text-lg">SỐ DẶM TÍCH LŨY (km)</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">206,762,230</div>
                <div className="text-lg">GIẢM THIỂU KHÍ CO₂ (kg)</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">~2,275,441</div>
                <div className="text-lg">LÀM SẠCH KHÔNG KHÍ (cây)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Locator & Support */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">CỬA HÀNG VINFAST</h3>
              <p className="text-gray-600 mb-6">VinFast có hơn 200+ Cửa hàng chuyên doanh và Trung tâm bảo hành trên toàn quốc.</p>
              <button className="text-green-600 font-bold hover:underline">Xem danh sách →</button>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">TRUNG TÂM HỖ TRỢ</h3>
              <p className="text-gray-600 mb-6">VinFast cam kết mang đến cho khách hàng những chính sách & dịch vụ chất lượng nhất.</p>
              <button className="text-green-600 font-bold hover:underline">Tìm hiểu thêm →</button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-green-600 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">SẴN SÀNG TRẢI NGHIỆM?</h2>
          <p className="text-xl mb-8">Hotline CSKH: 1900 636 803</p>
          <button className="bg-white text-green-600 px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
            ĐĂNG KÝ LÁI THỬ NGAY
          </button>
        </section>
      </main>
      <Footer />
    </>
  )
}
