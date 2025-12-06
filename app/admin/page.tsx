'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f5f7fb' }}>
      {/* Header */}
      <header style={{ background: '#003366', color: 'white', padding: '15px 30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚙️ Admin Dashboard - Xe Đạp VinFast</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>👁️ Xem trang khách</a>
            <button style={{ padding: '8px 16px', background: '#f9b000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '20px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setActiveTab('overview')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'overview' ? '#003366' : 'transparent', color: activeTab === 'overview' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              📊 Tổng quan
            </button>
            <button onClick={() => setActiveTab('products')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'products' ? '#003366' : 'transparent', color: activeTab === 'products' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🚲 Quản lý sản phẩm
            </button>
            <button onClick={() => setActiveTab('users')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'users' ? '#003366' : 'transparent', color: activeTab === 'users' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              👥 Quản lý người dùng
            </button>
            <button onClick={() => setActiveTab('wallet')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'wallet' ? '#003366' : 'transparent', color: activeTab === 'wallet' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              💰 Quản lý ví
            </button>
            <button onClick={() => setActiveTab('notifications')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'notifications' ? '#003366' : 'transparent', color: activeTab === 'notifications' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🔔 Gửi thông báo
            </button>
            <button onClick={() => setActiveTab('content')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'content' ? '#003366' : 'transparent', color: activeTab === 'content' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              📝 Chỉnh sửa nội dung
            </button>
            <button onClick={() => setActiveTab('images')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'images' ? '#003366' : 'transparent', color: activeTab === 'images' ? 'white' : '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🖼️ Quản lý hình ảnh
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '30px' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Tổng quan hệ thống</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>Tổng người dùng</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>1,234</div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '5px' }}>↗ +12% so với tháng trước</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>Đơn hàng hôm nay</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>45</div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '5px' }}>↗ +8% so với hôm qua</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>Doanh thu tháng này</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>456M VNĐ</div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '5px' }}>↗ +23% so với tháng trước</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>Thông báo chờ</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>8</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>Cần xử lý</div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Hoạt động gần đây</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontWeight: '600' }}>Đơn hàng mới #1234</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Nguyễn Văn A đã đặt mua xe Model B - 5 phút trước</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontWeight: '600' }}>Người dùng mới đăng ký</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Trần Thị B vừa tạo tài khoản - 12 phút trước</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontWeight: '600' }}>Yêu cầu rút tiền</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Lê Văn C yêu cầu rút 5.000.000 VNĐ - 25 phút trước</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#111827' }}>Quản lý sản phẩm</h2>
                <button style={{ padding: '10px 20px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  + Thêm sản phẩm mới
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Sản phẩm</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Giá</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Trạng thái</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Xe máy điện Model A</td>
                      <td style={{ padding: '12px' }}>15.900.000 VNĐ</td>
                      <td style={{ padding: '12px' }}><span style={{ padding: '4px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontSize: '0.85rem' }}>Đang bán</span></td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ padding: '6px 12px', marginRight: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                        <button style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Xe máy điện Model B</td>
                      <td style={{ padding: '12px' }}>18.000.000 VNĐ</td>
                      <td style={{ padding: '12px' }}><span style={{ padding: '4px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontSize: '0.85rem' }}>Đang bán</span></td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ padding: '6px 12px', marginRight: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                        <button style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Quản lý người dùng</h2>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <input type="text" placeholder="🔍 Tìm kiếm người dùng..." style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px' }} />
                <p style={{ color: '#6b7280' }}>Danh sách người dùng sẽ hiển thị ở đây...</p>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Quản lý ví & giao dịch</h2>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Yêu cầu nạp/rút tiền đang chờ</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Nguyễn Văn A - Nạp tiền</div>
                      <div style={{ fontSize: '0.9rem', color: '#92400e' }}>Số tiền: 10.000.000 VNĐ</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Duyệt</button>
                      <button style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Từ chối</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Gửi thông báo</h2>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tiêu đề thông báo</label>
                  <input type="text" placeholder="Nhập tiêu đề..." style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Nội dung</label>
                  <textarea placeholder="Nhập nội dung thông báo..." rows={5} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}></textarea>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Gửi tới</label>
                  <select style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <option>Tất cả người dùng</option>
                    <option>Người dùng VIP</option>
                    <option>Người dùng mới</option>
                  </select>
                </div>
                <button style={{ padding: '12px 24px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  📤 Gửi thông báo
                </button>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Chỉnh sửa nội dung trang</h2>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', marginBottom: '15px' }}>Chỉnh sửa văn bản hiển thị trên trang khách hàng</p>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tiêu đề Hero</label>
                  <input type="text" defaultValue="Mua xe máy điện nhận ưu đãi linh hoạt" style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Mô tả ngắn</label>
                  <textarea defaultValue="Di chuyển êm ái trong thành phố, chi phí sử dụng thấp..." rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}></textarea>
                </div>
                <button style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  💾 Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#111827' }}>Quản lý hình ảnh</h2>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <button style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
                  📁 Upload hình ảnh mới
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '2px dashed #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
                    Ảnh sản phẩm 1
                  </div>
                  <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '2px dashed #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
                    Ảnh sản phẩm 2
                  </div>
                  <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '2px dashed #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
                    Ảnh banner
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
