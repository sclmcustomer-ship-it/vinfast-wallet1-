'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  balance: number;
  phone?: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  note?: string;
}

export default function WalletPageYD() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserData({
          id: profile.id,
          email: profile.email || '',
          fullName: profile.full_name || '',
          balance: profile.balance || 0,
          phone: profile.phone
        });
      }

      // Load transactions
      const { data: txData } = await supabase
        .from('transaction_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txData) {
        setTransactions(txData);
      }
    } catch (err) {
      console.error('Load user data error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        setIsAuthenticated(true);
        await loadUserData(data.user.id);
        setSuccess('🎉 Đăng nhập thành công!');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // 2. Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
              phone: phone,
              balance: 0,
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) throw profileError;

        setSuccess('✅ Đăng ký thành công! Đang đăng nhập...');
        
        // Auto login after register
        setTimeout(() => {
          setAuthMode('login');
          setSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userData) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    try {
      const { error: txError } = await supabase
        .from('transaction_requests')
        .insert([
          {
            user_id: userData.id,
            type: 'deposit',
            amount: depositAmount,
            status: 'pending',
            note: note || 'Nạp tiền vào ví',
            created_at: new Date().toISOString(),
          },
        ]);

      if (txError) throw txError;

      setSuccess('✅ Yêu cầu nạp tiền đã được gửi! Vui lòng chờ xác nhận.');
      setAmount('');
      setNote('');
      await loadUserData(userData.id);
    } catch (err: any) {
      setError(err.message || 'Nạp tiền thất bại');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userData) return;

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    if (withdrawAmount > userData.balance) {
      setError('Số dư không đủ');
      return;
    }

    try {
      const { error: txError } = await supabase
        .from('transaction_requests')
        .insert([
          {
            user_id: userData.id,
            type: 'withdraw',
            amount: withdrawAmount,
            status: 'pending',
            note: note || 'Rút tiền từ ví',
            created_at: new Date().toISOString(),
          },
        ]);

      if (txError) throw txError;

      setSuccess('✅ Yêu cầu rút tiền đã được gửi! Vui lòng chờ xác nhận.');
      setAmount('');
      setNote('');
      await loadUserData(userData.id);
    } catch (err: any) {
      setError(err.message || 'Rút tiền thất bại');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserData(null);
    setTransactions([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏍️</div>
          <p className="text-lg font-semibold text-gray-700">Đang tải...</p>
        </div>
      </div>
    );
  }

  // AUTH SCREEN - Login/Register
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Back to Home */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
          >
            <span>←</span>
            <span>Về trang chủ</span>
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                YD
              </div>
            </div>
            <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Ví Điện Tử YD
            </h1>
            <p className="text-gray-600">Quản lý tài chính thông minh, an toàn</p>
          </div>

          {/* Auth Tabs */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                {success}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔒 Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Đăng nhập →
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="0912 345 678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔒 Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Đăng ký tài khoản →
                </button>
              </form>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-xs text-gray-600 font-semibold">Bảo mật cao</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-xs text-gray-600 font-semibold">Giao dịch nhanh</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <p className="text-xs text-gray-600 font-semibold">Miễn phí</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WALLET DASHBOARD - After Login
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-green-100">
              ← Trang chủ
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold">Ví YD</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm opacity-90">Xin chào,</p>
              <p className="font-bold">{userData?.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-1">Số dư khả dụng</p>
              <h2 className="text-4xl font-extrabold">{formatCurrency(userData?.balance || 0)}</h2>
            </div>
            <div className="text-6xl opacity-20">💳</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('deposit')}
              className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition"
            >
              ⬆️ Nạp tiền
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition"
            >
              ⬇️ Rút tiền
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Tổng quan', icon: '📊' },
            { key: 'deposit', label: '⬆️ Nạp tiền', icon: '⬆️' },
            { key: 'withdraw', label: '⬇️ Rút tiền', icon: '⬇️' },
            { key: 'history', label: '📜 Lịch sử', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white shadow-lg text-green-600'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
              {success}
            </div>
          )}

          {activeTab === 'overview' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">📊 Tổng quan tài khoản</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-sm text-gray-600 mb-1">Số dư hiện tại</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(userData?.balance || 0)}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-sm font-semibold text-blue-600">{userData?.email}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-sm text-gray-600 mb-1">Điện thoại</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {userData?.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-lg mb-4">📜 Giao dịch gần đây</h4>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có giao dịch nào</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {tx.type === 'deposit' ? '⬆️' : '⬇️'}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {tx.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.type === 'deposit' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p
                            className={`text-xs ${
                              tx.status === 'completed'
                                ? 'text-green-600'
                                : tx.status === 'pending'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {tx.status === 'completed'
                              ? '✓ Hoàn thành'
                              : tx.status === 'pending'
                              ? '⏳ Chờ duyệt'
                              : '✗ Từ chối'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">⬆️ Nạp tiền vào ví</h3>
              <form onSubmit={handleDeposit} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💵 Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="10000"
                    step="1000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="100,000"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[50000, 100000, 200000, 500000, 1000000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="px-4 py-2 bg-gray-100 hover:bg-green-100 rounded-lg text-sm font-semibold transition"
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    rows={3}
                    placeholder="Mô tả giao dịch..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Gửi yêu cầu nạp tiền →
                </button>
                <p className="text-xs text-gray-500 text-center">
                  💡 Yêu cầu sẽ được xử lý bởi Banker trong vòng 24h
                </p>
              </form>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">⬇️ Rút tiền từ ví</h3>
              <form onSubmit={handleWithdraw} className="max-w-md space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 mb-4">
                  ⚠️ Số dư khả dụng: <span className="font-bold">{formatCurrency(userData?.balance || 0)}</span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💵 Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="10000"
                    max={userData?.balance || 0}
                    step="1000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    placeholder="100,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition"
                    rows={3}
                    placeholder="Lý do rút tiền..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Gửi yêu cầu rút tiền →
                </button>
                <p className="text-xs text-gray-500 text-center">
                  💡 Yêu cầu sẽ được xử lý bởi Banker trong vòng 24h
                </p>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">📜 Lịch sử giao dịch</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tx.type === 'deposit'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          <span className="text-2xl">{tx.type === 'deposit' ? '⬆️' : '⬇️'}</span>
                        </div>
                        <div>
                          <p className="font-bold">
                            {tx.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(tx.created_at)}</p>
                          {tx.note && <p className="text-xs text-gray-400 mt-1">{tx.note}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.status === 'completed'
                            ? '✓ Hoàn thành'
                            : tx.status === 'pending'
                            ? '⏳ Chờ duyệt'
                            : '✗ Từ chối'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
