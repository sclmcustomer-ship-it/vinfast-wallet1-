'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type TabKey = "personal" | "vip" | "wallet";

type WalletMode = "overview" | "deposit" | "withdraw" | "history" | "linkBank";

type AuthMode = "login" | "register";

interface BankCard {
  id: string;
  displayName: string;
  value: string;
  isDefault?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  date: string;
  read: boolean;
}

interface UserData {
  id: string;
  fullName: string;
  emailOrPhone: string;
  password: string; // Lưu mật khẩu để xác thực
  transactionPassword: string; // Mật khẩu giao dịch
  balance: number;
  vipLevel: number;
  vipPoints: number;
  linkedBanks: BankCard[];
  kycStatus: string;
  isLocked: boolean; // Trạng thái khóa tài khoản
  transactionHistory: Transaction[];
  createdAt: string;
  lastLogin: string;
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("wallet");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Kiểm tra URL parameter để set authMode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'register') {
        setAuthMode('register');
      } else if (mode === 'login') {
        setAuthMode('login');
      }
    }
  }, []);
  
  // Thông báo từ VinFast
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Số tiền chờ xử lý (từ transaction_requests)
  const [pendingAmount, setPendingAmount] = useState(0);
  
  // Dữ liệu người dùng - khởi tạo trống cho tài khoản mới
  const [userData, setUserData] = useState<UserData>({
    id: "",
    fullName: "",
    emailOrPhone: "",
    password: "",
    transactionPassword: "",
    balance: 0,
    vipLevel: 0,
    vipPoints: 0,
    linkedBanks: [],
    kycStatus: "Chưa xác minh",
    isLocked: false,
    transactionHistory: [],
    createdAt: "",
    lastLogin: ""
  });

  // Tự động đăng nhập khi load trang (persistent login)
  useEffect(() => {
    const loadSession = async () => {
      const savedSession = localStorage.getItem("vinfast_user_session");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          
          // ✅ Load user từ Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.userId)
            .single();
          
          if (user && !error) {
            const convertedUser: UserData = {
              id: user.id,
              fullName: user.full_name,
              emailOrPhone: user.email_or_phone,
              password: user.linked_banks?.[0]?.password || "",
              transactionPassword: user.linked_banks?.[0]?.transactionPassword || "",
              balance: parseFloat(user.balance) || 0,
              vipLevel: user.vip_level || 0,
              vipPoints: 0,
              linkedBanks: user.linked_banks || [],
              kycStatus: user.kyc_status || 'Chưa xác minh',
              isLocked: user.is_locked || false,
              transactionHistory: user.transaction_history || [],
              createdAt: user.created_at,
              lastLogin: user.last_login
            };
            setUserData(convertedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
      }
    };
    
    loadSession();
  }, []);

  // Đồng bộ trạng thái giao dịch từ VinFast (polling mỗi 2 giây - realtime)
  useEffect(() => {
    if (!isAuthenticated || !userData.id) return;

    const syncTransactionStatus = async () => {
      // ✅ Load user từ Supabase
      const { data: currentUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (currentUser && !error) {
        const convertedUser: UserData = {
          id: currentUser.id,
          fullName: currentUser.full_name,
          emailOrPhone: currentUser.email_or_phone,
          password: currentUser.linked_banks?.[0]?.password || "",
          transactionPassword: currentUser.linked_banks?.[0]?.transactionPassword || "",
          balance: parseFloat(currentUser.balance) || 0,
          vipLevel: currentUser.vip_level || 0,
          vipPoints: 0,
          linkedBanks: currentUser.linked_banks || [],
          kycStatus: currentUser.kyc_status || 'Chưa xác minh',
          isLocked: currentUser.is_locked || false,
          transactionHistory: currentUser.transaction_history || [],
          createdAt: currentUser.created_at,
          lastLogin: currentUser.last_login
        };
        
        // So sánh và cập nhật nếu có thay đổi
        if (JSON.stringify(convertedUser) !== JSON.stringify(userData)) {
          setUserData(convertedUser);
        }
      }
      
      // ✅ Tính số tiền chờ xử lý (Chờ duyệt)
      const { data: pendingRequests } = await supabase
        .from('transaction_requests')
        .select('amount, type')
        .eq('user_id', userData.id)
        .eq('status', 'Chờ duyệt');
      
      if (pendingRequests && pendingRequests.length > 0) {
        // Tính tổng: Nạp tiền (+), Rút tiền đã trừ rồi nên không tính
        const total = pendingRequests.reduce((sum, req) => {
          if (req.type === 'Nạp tiền') {
            return sum + parseFloat(req.amount);
          }
          // Rút tiền đã trừ balance rồi, chỉ hiển thị số đang chờ
          if (req.type === 'Rút tiền') {
            return sum + parseFloat(req.amount);
          }
          return sum;
        }, 0);
        setPendingAmount(total);
      } else {
        setPendingAmount(0);
      }
    };

    // Sync ngay lập tức khi mount
    syncTransactionStatus();

    // Polling mỗi 2 giây để đồng bộ realtime với VinFast
    const interval = setInterval(syncTransactionStatus, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userData.id]);

  // Đồng bộ thông báo từ VinFast (polling mỗi 2 giây - realtime)
  useEffect(() => {
    if (!isAuthenticated || !userData.id) return;

    const syncNotifications = async () => {
      // ✅ Load notifications từ Supabase
      const { data: currentUser } = await supabase
        .from('users')
        .select('notifications')
        .eq('id', userData.id)
        .single();
      
      const savedNotifications = currentUser?.notifications || [];
      if (!savedNotifications || savedNotifications.length === 0) return;

      const userNotifications = savedNotifications.filter((n: any) => n.userId === userData.id);
      
      if (JSON.stringify(userNotifications) !== JSON.stringify(notifications)) {
        setNotifications(userNotifications);
        
        // Đếm thông báo chưa đọc
        const unread = userNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    };

    // Sync ngay lập tức
    syncNotifications();

    // Polling mỗi 3 giây để đồng bộ realtime (notifications không cần update quá nhanh)
    const interval = setInterval(syncNotifications, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userData.id, notifications]);

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalSection userData={userData} />;
      case "vip":
        return <VipSection userData={userData} />;
      case "wallet":
      default:
        return <WalletSection 
          userData={userData} 
          setUserData={setUserData}
          notifications={notifications}
          setNotifications={setNotifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={unreadCount}
          pendingAmount={pendingAmount}
          setIsAuthenticated={setIsAuthenticated}
        />;
    }
  };

  const titleByTab: Record<TabKey, string> = {
    personal: "Hồ sơ tài khoản VinFast",
    vip: "Trung tâm hạng VIP",
    wallet: "Ví VinFast",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background:
          "radial-gradient(circle at top, #0b2a6f 0%, #020617 55%, #000 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ 
        width: "100%", 
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}>
        {!isAuthenticated ? (
          <AuthScreen
            mode={authMode}
            onModeChange={setAuthMode}
            onAuthenticated={(data) => {
              setUserData(data);
              setIsAuthenticated(true);
              // Lưu session để duy trì đăng nhập
              localStorage.setItem("vinfast_user_session", JSON.stringify({ userId: data.id }));
            }}
          />
        ) : (
          <>
            {/* Header with logo and title */}
            <div style={{ 
              textAlign: "center", 
              padding: "16px 20px",
              background: "rgba(15,23,42,0.8)",
              borderBottom: "1px solid rgba(148,163,184,0.2)",
              flexShrink: 0,
            }}>
              <img 
                src="https://vinfastat-hcm.com/wp-content/uploads/2023/06/Logo_of_VinFast_3D_Banner.svg-1.png" 
                alt="VinFast Logo" 
                style={{ 
                  height: "40px", 
                  margin: "0 auto 8px",
                  display: "block"
                }} 
              />
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                {titleByTab[activeTab]}
              </h2>
            </div>

            {/* Nội dung chính thay đổi theo tab - có thể scroll */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "20px",
              WebkitOverflowScrolling: "touch",
            }}>
              {renderContent()}
            </div>

            {/* Thanh điều hướng dưới: 3 phím tắt FIXED - Không co giãn */}
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 0,
                padding: "8px 0",
                background: "rgba(15,23,42,0.98)",
                borderTop: "1px solid rgba(148,163,184,0.3)",
                flexShrink: 0,
                position: "sticky",
                bottom: 0,
                boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <NavButton
                label="VIP"
                icon="💎"
                active={activeTab === "vip"}
                onClick={() => setActiveTab("vip")}
              />
              <NavButton
                label="Ví"
                icon="💰"
                active={activeTab === "wallet"}
                onClick={() => setActiveTab("wallet")}
              />
              <NavButton
                label="Cá nhân"
                icon="👤"
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/*** COMPONENT: Auth trước khi vào app */
interface AuthScreenProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (userData: UserData) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  mode,
  onModeChange,
  onAuthenticated,
}) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [showConfirmTransactionPassword, setShowConfirmTransactionPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState("");

  const isLogin = mode === "login";
  
  // Debug: Log khi mode thay đổi
  console.log("🔍 Current mode:", mode, "| isLogin:", isLogin);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  // Validate email or phone
  const validateEmailOrPhone = (input: string) => {
    return validateEmail(input) || validatePhone(input);
  };

  const handleSubmit = async () => {
    if (isLogin) {
      // Validate login
      if (!emailOrPhone || !password) {
        alert("⚠️ VinFast thông báo\n\nVui lòng nhập đầy đủ thông tin đăng nhập!");
        return;
      }
      
      // ✅ ĐĂNG NHẬP QUA SUPABASE
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('email_or_phone', emailOrPhone)
          .single();
        
        if (error || !users) {
          alert("⚠️ VinFast thông báo\n\nTài khoản không tồn tại! Vui lòng đăng ký tài khoản mới.");
          return;
        }
        
        // Lấy password từ linked_banks JSONB
        const storedPassword = users.linked_banks?.[0]?.password;
        if (storedPassword !== password) {
          alert("⚠️ VinFast thông báo\n\nMật khẩu không đúng! Vui lòng kiểm tra lại.");
          return;
        }
        
        // Đăng nhập thành công - cập nhật last_login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', users.id);
        
        // Convert sang UserData format
        const existingUser: UserData = {
          id: users.id,
          fullName: users.full_name,
          emailOrPhone: users.email_or_phone,
          password: storedPassword || '',
          transactionPassword: users.linked_banks?.[0]?.transactionPassword || '',
          balance: Number(users.balance),
          vipLevel: users.vip_level,
          vipPoints: 0,
          linkedBanks: users.linked_banks || [],
          kycStatus: users.kyc_status,
          isLocked: users.is_locked || false,
          transactionHistory: users.transaction_history || [],
          createdAt: users.created_at,
          lastLogin: users.last_login
        };
        
        onAuthenticated(existingUser);
      } catch (err) {
        alert("⚠️ Lỗi kết nối! Vui lòng kiểm tra internet.");
        console.error(err);
      }
    } else {
      // Validate register
      if (!fullName || !emailOrPhone || !password || !confirmPassword || !transactionPassword || !confirmTransactionPassword) {
        alert("⚠️ VinFast thông báo\n\nVui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }
      
      // VALIDATE EMAIL/PHONE FORMAT
      if (!validateEmailOrPhone(emailOrPhone)) {
        alert("⚠️ VinFast thông báo\n\nEmail hoặc số điện thoại không đúng định dạng!\n\nEmail: example@gmail.com\nSố điện thoại: 0xxxxxxxxx (10 số, bắt đầu bằng 03, 05, 07, 08, 09)");
        return;
      }
      
      // Kiểm tra tài khoản đã tồn tại
      const savedUsersCheck = localStorage.getItem("vinfast_users");
      const existingUsers = savedUsersCheck ? JSON.parse(savedUsersCheck) : [];
      const userExists = existingUsers.find((u: UserData) => u.emailOrPhone === emailOrPhone);
      
      if (userExists) {
        alert("⚠️ VinFast thông báo\n\nEmail/Số điện thoại này đã được đăng ký! Vui lòng đăng nhập hoặc sử dụng thông tin khác.");
        return;
      }
      
      if (password !== confirmPassword) {
        alert("⚠️ VinFast thông báo\n\nMật khẩu đăng nhập xác nhận không khớp!");
        return;
      }
      if (password.length < 6) {
        alert("⚠️ VinFast thông báo\n\nMật khẩu đăng nhập phải có ít nhất 6 ký tự!");
        return;
      }
      if (transactionPassword !== confirmTransactionPassword) {
        alert("⚠️ VinFast thông báo\n\nMật khẩu giao dịch xác nhận không khớp!");
        return;
      }
      if (transactionPassword.length < 6) {
        alert("⚠️ VinFast thông báo\n\nMật khẩu giao dịch phải có ít nhất 6 ký tự!");
        return;
      }
      
      // ✅ ĐĂNG KÝ QUA SUPABASE
      try {
        // Kiểm tra email/phone đã tồn tại chưa
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email_or_phone', emailOrPhone)
          .single();
        
        if (existing) {
          alert("⚠️ VinFast thông báo\n\nEmail/Số điện thoại này đã được đăng ký! Vui lòng đăng nhập hoặc sử dụng thông tin khác.");
          return;
        }
        
        const userId = `VF-${Date.now()}`;
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: userId,
            full_name: fullName,
            email_or_phone: emailOrPhone,
            balance: 0,
            vip_level: 0,
            kyc_status: 'Chưa xác minh',
            linked_banks: [{ password: password, transactionPassword: transactionPassword }],
            transaction_history: [],
            notifications: [],
            created_at: now,
            last_login: now
          }])
          .select()
          .single();
        
        if (error || !data) {
          alert("⚠️ Lỗi đăng ký! Vui lòng thử lại.");
          console.error(error);
          return;
        }
        
        // Convert sang UserData format
        const newUserData: UserData = {
          id: data.id,
          fullName: data.full_name,
          emailOrPhone: data.email_or_phone,
          password: password,
          transactionPassword: transactionPassword,
          balance: 0,
          vipLevel: 0,
          vipPoints: 0,
          linkedBanks: data.linked_banks || [],
          kycStatus: 'Chưa xác minh',
          isLocked: false,
          transactionHistory: [],
          createdAt: data.created_at,
          lastLogin: data.last_login
        };
        
        alert("✅ VinFast thông báo\n\nChúc mừng bạn đã đăng ký thành công!");
        onAuthenticated(newUserData);
      } catch (err) {
        alert("⚠️ Lỗi kết nối! Vui lòng kiểm tra internet.");
        console.error(err);
      }
    }
  };

  return (
    <div
      style={{
        borderRadius: 24,
        padding: 20,
        background: "rgba(15,23,42,0.96)",
        border: "1px solid rgba(148,163,184,0.7)",
        boxShadow: "0 18px 45px rgba(15,23,42,0.9)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img 
          src="https://vinfastat-hcm.com/wp-content/uploads/2023/06/Logo_of_VinFast_3D_Banner.svg-1.png" 
          alt="VinFast Logo" 
          style={{ 
            height: "60px", 
            margin: "0 auto 12px",
            display: "block"
          }} 
        />
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Xe Đạp điện trợ lực
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Đăng nhập để sử dụng ví VinFast & trung tâm VIP
        </div>
      </div>

      {/* Toggle login / register */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 14,
          padding: 3,
          borderRadius: 999,
          background: "rgba(15,23,42,1)",
          border: "1px solid rgba(51,65,85,1)",
        }}
      >
        <button
          onClick={() => onModeChange("login")}
          style={{
            borderRadius: 999,
            border: "none",
            padding: "6px 0",
            fontSize: 12,
            cursor: "pointer",
            background: isLogin
              ? "linear-gradient(135deg,#1d4ed8,#38bdf8)"
              : "transparent",
            color: isLogin ? "#f9fafb" : "#e5e7eb",
          }}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => {
            console.log("✅ NÚT ĐĂNG KÝ ĐƯỢC BẤM!");
            onModeChange("register");
          }}
          style={{
            borderRadius: 999,
            border: "none",
            padding: "6px 0",
            fontSize: 12,
            cursor: "pointer",
            background: !isLogin
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "transparent",
            color: !isLogin ? "#0b1120" : "#e5e7eb",
          }}
        >
          Đăng ký
        </button>
      </div>

      <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
        {!isLogin && (
          <div style={{ display: "grid", gap: 4 }}>
            <label style={{ opacity: 0.85 }}>Họ và tên</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ tên đầy đủ"
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
                fontSize: 13,
              }}
            />
          </div>
        )}

        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ opacity: 0.85 }}>Email hoặc số điện thoại</label>
          <input
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="VD: demo@vinfast.com / 0888 888 888"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ opacity: 0.85 }}>Mật khẩu</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              style={{
                padding: "8px 36px 8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
                fontSize: 13,
                width: "100%",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                padding: "4px 8px",
                color: "#9ca3af",
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div style={{ display: "grid", gap: 4 }}>
            <label style={{ opacity: 0.85 }}>Nhập lại mật khẩu đăng nhập</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                style={{
                  padding: "8px 36px 8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.8)",
                  background: "rgba(15,23,42,0.9)",
                  color: "#e5e7eb",
                  fontSize: 13,
                  width: "100%",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  padding: "4px 8px",
                  color: "#9ca3af",
                }}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        )}

        {!isLogin && (
          <>
            <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
              <label style={{ opacity: 0.85 }}>Mật khẩu giao dịch (dùng để rút tiền)</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showTransactionPassword ? "text" : "password"}
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  placeholder="Nhập mật khẩu giao dịch"
                  style={{
                    padding: "8px 36px 8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.8)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                    fontSize: 13,
                    width: "100%",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: "4px 8px",
                    color: "#9ca3af",
                  }}
                >
                  {showTransactionPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              <label style={{ opacity: 0.85 }}>Nhập lại mật khẩu giao dịch</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmTransactionPassword ? "text" : "password"}
                  value={confirmTransactionPassword}
                  onChange={(e) => setConfirmTransactionPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu giao dịch"
                  style={{
                    padding: "8px 36px 8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.8)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                    fontSize: 13,
                    width: "100%",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmTransactionPassword(!showConfirmTransactionPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: "4px 8px",
                    color: "#9ca3af",
                  }}
                >
                  {showConfirmTransactionPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isLogin && (
        <button
          style={{
            marginTop: 8,
            border: "none",
            background: "transparent",
            color: "#38bdf8",
            fontSize: 11,
            textAlign: "right",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Quên mật khẩu?
        </button>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "10px 12px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          background: isLogin
            ? "linear-gradient(135deg,#1d4ed8,#38bdf8)"
            : "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#f9fafb",
        }}
      >
        {isLogin ? "Đăng nhập" : "Tạo tài khoản mới"}
      </button>

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          opacity: 0.75,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Bằng việc tiếp tục, bạn đồng ý với Quy chế hoạt động & Chính sách bảo
        mật của VinFast.
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a
          href="/"
          style={{
            fontSize: 11,
            color: "#38bdf8",
            textDecoration: "none",
          }}
        >
          ← Quay lại trang chủ
        </a>
      </div>
    </div>
  );
};

/*** COMPONENT: Nút nav 3 mục dưới cùng */
interface NavButtonProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({
  label,
  icon,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "10px 8px",
        border: "none",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 600,
        background: active
          ? "linear-gradient(135deg,#1d4ed8,#38bdf8)"
          : "transparent",
        color: active ? "#ffffff" : "#94a3b8",
        transition: "all 0.2s ease",
        minHeight: 64,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "#e2e8f0";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "#94a3b8";
        }
      }}
    >
      <span style={{ 
        fontSize: 24, 
        lineHeight: 1,
        display: "block",
      }}>{icon}</span>
      <span style={{ 
        lineHeight: 1,
        letterSpacing: "0.3px",
      }}>{label}</span>
    </button>
  );
};

/*** TAB 1: Cá nhân */
interface PersonalSectionProps {
  userData: UserData;
}

const PersonalSection: React.FC<PersonalSectionProps> = ({ userData }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingDevices, setIsManagingDevices] = useState(false);
  
  const [editName, setEditName] = useState(userData.fullName);
  const [editEmail, setEditEmail] = useState(userData.emailOrPhone);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Lấy chữ cái đầu của tên
  const initials = userData.fullName 
    ? userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : "VF";
  
  // Tạo ID từ email/phone
  const userId = userData.emailOrPhone 
    ? `VF-${Math.abs(userData.emailOrPhone.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`.substring(0, 13)
    : "VF-000000000";
  
  const vipLevels = [
    { level: 0, image: "/images/logo-vip0.jpg" },
    { level: 1, image: "/images/logo-vip1.jpg" },
    { level: 2, image: "/images/logo-vip2.jpg" },
    { level: 3, image: "/images/logo-vip3.jpg" },
    { level: 4, image: "/images/logo-vip4.jpg" },
    { level: 5, image: "/images/logo-vip5.jpg" },
    { level: 6, image: "/images/logo-vip6.jpg" },
    { level: 7, image: "/images/logo-vip7.jpg" },
    { level: 8, image: "/images/logo-vip8.jpg" },
  ];
  
  const handleSaveProfile = () => {
    if (!editName || !editEmail) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    // Cập nhật thông tin trong localStorage
    const savedUsers = localStorage.getItem("vinfast_users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const updatedUsers = users.map((u: UserData) => {
      if (u.id === userData.id) {
        return { ...u, fullName: editName, emailOrPhone: editEmail };
      }
      return u;
    });
    localStorage.setItem("vinfast_users", JSON.stringify(updatedUsers));
    
    alert("Cập nhật thông tin thành công! Vui lòng đăng nhập lại để thấy thay đổi.");
    setIsEditingProfile(false);
  };
  
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    
    alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
    setIsChangingPassword(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };
  
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Card thông tin cơ bản với VIP background */}
      <div
        style={{
          borderRadius: 24,
          padding: 18,
          backgroundImage: `url(${vipLevels[userData.vipLevel].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "2px solid rgba(250,204,21,0.6)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.8)",
          position: "relative",
          minHeight: "200px",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 24,
            zIndex: 1,
          }}
        />
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                border: "3px solid rgba(255,255,255,0.3)",
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                {userData.fullName || "Tài khoản mới"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, color: "#fff" }}>ID: {userId}</div>
            </div>
          </div>

          <div style={{ fontSize: 13, display: "grid", gap: 6, color: "#fff" }}>
            <div>
              <span style={{ opacity: 0.8 }}>📧 </span>
              <span>{userData.emailOrPhone || "Chưa cập nhật"}</span>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>💰 Số dư: </span>
              <span style={{ fontWeight: 700 }}>₫{userData.balance.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>💎 VIP Level {userData.vipLevel} • </span>
              <span>{userData.vipPoints.toLocaleString()} điểm</span>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>✅ KYC: </span>
              <span style={{ 
                fontWeight: 600,
                color: userData.kycStatus === "Đã xác minh" ? "#4ade80" : "#fbbf24" 
              }}>
                {userData.kycStatus}
              </span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
              Lần đăng nhập: {userData.lastLogin}
            </div>
          </div>
        </div>
      </div>

      {/* Cài đặt tài khoản */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Cài đặt tài khoản
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <QuickRow 
            label="Chỉnh sửa thông tin cá nhân" 
            action="Cập nhật"
            onClick={() => setIsEditingProfile(true)}
          />
          <QuickRow 
            label="Đổi mật khẩu đăng nhập" 
            action="Đổi"
            onClick={() => setIsChangingPassword(true)}
          />
          <QuickRow 
            label="Quản lý thiết bị đang đăng nhập" 
            action="Xem"
            onClick={() => setIsManagingDevices(true)}
          />
        </div>
      </div>
      
      {/* Modal: Chỉnh sửa thông tin */}
      {isEditingProfile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsEditingProfile(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 16,
              padding: 20,
              maxWidth: 400,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#e5e7eb" }}>
              Chỉnh sửa thông tin cá nhân
            </h3>
            
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 4 }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 4 }}>
                  Email/Số điện thoại
                </label>
                <input
                  type="text"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsEditingProfile(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#1d4ed8,#38bdf8)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Đổi mật khẩu */}
      {isChangingPassword && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsChangingPassword(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 16,
              padding: 20,
              maxWidth: 400,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#e5e7eb" }}>
              Đổi mật khẩu đăng nhập
            </h3>
            
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 4 }}>
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 4 }}>
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 4 }}>
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsChangingPassword(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Quản lý thiết bị */}
      {isManagingDevices && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsManagingDevices(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 16,
              padding: 20,
              maxWidth: 400,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#e5e7eb" }}>
              Thiết bị đang đăng nhập
            </h3>
            
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.3)",
                background: "rgba(30,41,59,0.3)",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>💻</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>
                    Thiết bị hiện tại
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    {navigator.userAgent.includes("Windows") ? "Windows PC" : 
                     navigator.userAgent.includes("Mac") ? "MacBook" : "Thiết bị khác"}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>
                Đăng nhập: {userData.lastLogin}
              </div>
              <div
                style={{
                  marginTop: 8,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.2)",
                  color: "#4ade80",
                  fontSize: 10,
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                • Đang hoạt động
              </div>
            </div>
            
            <div style={{ fontSize: 11, opacity: 0.6, textAlign: "center", marginTop: 12 }}>
              Tính năng quản lý nhiều thiết bị sẽ được cập nhật sớm
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button
                onClick={() => setIsManagingDevices(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/*** TAB 2: VIP */
interface VipSectionProps {
  userData: UserData;
}

const VipSection: React.FC<VipSectionProps> = ({ userData }) => {
  const currentVipLevel = userData.vipLevel; // Lấy từ userData
  const vipLevels = [
    { level: 0, name: "VIP LVL 0", image: "/images/logo-vip0.jpg", pointsRequired: 0 },
    { level: 1, name: "VIP LVL 1", image: "/images/logo-vip1.jpg", pointsRequired: 10000 },
    { level: 2, name: "VIP LVL 2", image: "/images/logo-vip2.jpg", pointsRequired: 25000 },
    { level: 3, name: "VIP LVL 3", image: "/images/logo-vip3.jpg", pointsRequired: 50000 },
    { level: 4, name: "VIP LVL 4", image: "/images/logo-vip4.jpg", pointsRequired: 100000 },
    { level: 5, name: "VIP LVL 5", image: "/images/logo-vip5.jpg", pointsRequired: 200000 },
    { level: 6, name: "VIP LVL 6", image: "/images/logo-vip6.jpg", pointsRequired: 500000 },
    { level: 7, name: "VIP LVL 7", image: "/images/logo-vip7.jpg", pointsRequired: 1000000 },
    { level: 8, name: "VIP LVL 8", image: "/images/logo-vip8.jpg", pointsRequired: 2000000 },
  ];
  
  // Tính toán điểm cần để lên level tiếp theo
  const nextLevel = currentVipLevel < 8 ? currentVipLevel + 1 : 8;
  const pointsToNextLevel = vipLevels[nextLevel].pointsRequired - userData.vipPoints;
  const progressPercent = currentVipLevel < 8 
    ? Math.min((userData.vipPoints / vipLevels[nextLevel].pointsRequired) * 100, 100)
    : 100;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Thẻ VIP chính với background image */}
      <div
        style={{
          borderRadius: 24,
          padding: 18,
          backgroundImage: `url(${vipLevels[currentVipLevel].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "2px solid rgba(250,204,21,0.9)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.8)",
          position: "relative",
          minHeight: "180px",
        }}
      >
        {/* Overlay để text dễ đọc */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 24,
            zIndex: 1,
          }}
        />
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 11, opacity: 0.95, color: "#fff" }}>Hạng hiện tại</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{vipLevels[currentVipLevel].name.toUpperCase()}</div>
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(34,197,94,0.9)",
                fontSize: 11,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Đã kích hoạt
            </div>
          </div>

          <div style={{ fontSize: 12, marginBottom: 8, color: "#fff" }}>
            Điểm VIP hiện có: <strong>{userData.vipPoints.toLocaleString()}</strong>
          </div>
          {currentVipLevel < 8 ? (
            <div style={{ fontSize: 11, opacity: 0.95, marginBottom: 8, color: "#fff" }}>
              Còn <strong>{pointsToNextLevel.toLocaleString()}</strong> điểm nữa để lên hạng <strong>{vipLevels[nextLevel].name}</strong>.
            </div>
          ) : (
            <div style={{ fontSize: 11, opacity: 0.95, marginBottom: 8, color: "#fff" }}>
              🎉 Bạn đã đạt cấp độ VIP cao nhất!
            </div>
          )}

          {/* Thanh tiến trình */}
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.3)",
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg,#22c55e,#16a34a)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Danh sách tất cả cấp bậc VIP */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          Tất cả cấp bậc VIP
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {vipLevels.map((vip) => (
            <div
              key={vip.level}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 10px",
                borderRadius: 12,
                background: vip.level === currentVipLevel 
                  ? "rgba(34,197,94,0.2)" 
                  : "rgba(51,65,85,0.3)",
                border: vip.level === currentVipLevel 
                  ? "1px solid rgba(34,197,94,0.5)" 
                  : "1px solid rgba(51,65,85,0.5)",
              }}
            >
              <img 
                src={vip.image} 
                alt={vip.name}
                style={{
                  width: "60px",
                  height: "auto",
                  borderRadius: 8,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {vip.name}
                  {vip.level === currentVipLevel && (
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: 10, 
                      color: "#22c55e",
                      fontWeight: 700,
                    }}>
                      • Cấp hiện tại
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                  {vip.level === 0 && "Cấp độ khởi đầu"}
                  {vip.level === 1 && "Ưu đãi cơ bản"}
                  {vip.level === 2 && "Hỗ trợ ưu tiên"}
                  {vip.level === 3 && "Tăng hoa hồng 5%"}
                  {vip.level === 4 && "Tăng hoa hồng 10%"}
                  {vip.level === 5 && "Chuyên viên riêng"}
                  {vip.level === 6 && "Ưu đãi đặc biệt"}
                  {vip.level === 7 && "Sự kiện độc quyền"}
                  {vip.level === 8 && "Đối tác chiến lược"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Đặc quyền VIP */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Đặc quyền nổi bật
        </div>
        <ul style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 4 }}>
          <li>Đường dây chăm sóc riêng cho đối tác VIP.</li>
          <li>Tham gia sự kiện / ưu đãi nội bộ VinFast.</li>
        </ul>

        <button
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            background: "linear-gradient(135deg,#d4af37,#f97316)",
            color: "#111827",
          }}
        >
          Xem chi tiết ưu đãi
        </button>
      </div>
    </div>
  );
};

/*** TAB 3: Ví (ví điện tử) */
interface WalletSectionProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  unreadCount: number;
  pendingAmount: number;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletSection: React.FC<WalletSectionProps> = ({ 
  userData, 
  setUserData, 
  notifications, 
  setNotifications,
  showNotifications, 
  setShowNotifications,
  unreadCount,
  pendingAmount,
  setIsAuthenticated
}) => {
  const [mode, setMode] = useState<WalletMode>("overview");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawPassword, setWithdrawPassword] = useState<string>("");
  const [linkedBanks, setLinkedBanks] = useState<BankCard[]>(userData.linkedBanks);
  const [withdrawBank, setWithdrawBank] = useState<string>(
    userData.linkedBanks.find(b => b.isDefault)?.id || userData.linkedBanks[0]?.id || ""
  );

  const [newBankName, setNewBankName] = useState<string>("");
  const [newBankNumber, setNewBankNumber] = useState<string>("");
  const [newBankHolder, setNewBankHolder] = useState<string>("");

  const hasBank = linkedBanks.length > 0;
  const defaultBank =
    linkedBanks.find((b) => b.isDefault) || linkedBanks[0] || null;

  const [modeHistory, setModeHistory] = useState<"recent" | "full">("recent");

  // Đồng bộ linkedBanks khi userData thay đổi (sau khi login hoặc refresh)
  useEffect(() => {
    setLinkedBanks(userData.linkedBanks);
    const defaultBankId = userData.linkedBanks.find(b => b.isDefault)?.id || userData.linkedBanks[0]?.id || "";
    if (defaultBankId) {
      setWithdrawBank(defaultBankId);
    }
  }, [userData.linkedBanks]);

  // Màn liên kết / quản lý thẻ ngân hàng
  if (mode === "linkBank") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.7)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            Liên kết / quản lý thẻ ngân hàng
          </div>

          <div style={{ fontSize: 12, marginBottom: 10 }}>
            Thẻ đang liên kết:
          </div>
          {hasBank ? (
            <div
              style={{
                borderRadius: 10,
                border: "1px solid rgba(51,65,85,0.9)",
                padding: 10,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {linkedBanks.map((card) => (
                <div
                  key={card.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                  }}
                >
                  <span>
                    {card.displayName}
                    {card.isDefault && (
                      <span style={{ color: "#4ade80", marginLeft: 6 }}>
                        (Mặc định)
                      </span>
                    )}
                  </span>
                  {!card.isDefault && (
                    <button
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.7)",
                        background: "transparent",
                        color: "#e5e7eb",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        const updatedBanks = linkedBanks.map((b) => ({
                          ...b,
                          isDefault: b.id === card.id,
                        }));
                        
                        setLinkedBanks(updatedBanks);
                        
                        // ✅ Cập nhật vào Supabase
                        const { error } = await supabase
                          .from('users')
                          .update({ linked_banks: updatedBanks })
                          .eq('id', userData.id);
                        
                        if (error) {
                          alert("❌ Lỗi khi cập nhật thẻ mặc định: " + error.message);
                          return;
                        }
                        
                        // Cập nhật userData local
                        const newUserData = { ...userData, linkedBanks: updatedBanks };
                        setUserData(newUserData);
                        
                        setWithdrawBank(card.id);
                      }}
                    >
                      Đặt mặc định
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: 12,
                padding: 10,
                borderRadius: 10,
                border: "1px dashed rgba(148,163,184,0.7)",
                marginBottom: 12,
              }}
            >
              Chưa có thẻ nào được liên kết.
            </div>
          )}

          <div
            style={{
              fontSize: 12,
              marginBottom: 8,
              marginTop: 4,
            }}
          >
            Thêm thẻ mới
          </div>
          <label style={{ fontSize: 11, opacity: 0.85 }}>Ngân hàng</label>
          <input
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            placeholder="VD: Techcombank"
            style={{
              marginTop: 4,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />

          <label
            style={{ fontSize: 11, opacity: 0.85, marginTop: 8 }}
          >
            Số tài khoản
          </label>
          <input
            value={newBankNumber}
            onChange={(e) => setNewBankNumber(e.target.value)}
            placeholder="Nhập số tài khoản"
            style={{
              marginTop: 4,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />

          <label
            style={{ fontSize: 11, opacity: 0.85, marginTop: 8 }}
          >
            Tên chủ tài khoản
          </label>
          <input
            value={newBankHolder}
            onChange={(e) => setNewBankHolder(e.target.value)}
            placeholder="VD: NGUYEN VAN A"
            style={{
              marginTop: 4,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              onClick={() => setMode("overview")}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                if (!newBankName || !newBankNumber || !newBankHolder) {
                  alert("⚠️ VinFast thông báo\n\nVui lòng điền đầy đủ thông tin thẻ ngân hàng!");
                  return;
                }
                const id = `${newBankName}-${newBankNumber}`;
                const newCard: BankCard = {
                  id,
                  value: newBankNumber,
                  displayName: `${newBankName} - ${newBankNumber}`,
                };
                
                const updatedBanks = [...userData.linkedBanks, newCard];
                
                // ✅ Cập nhật vào Supabase
                const { error } = await supabase
                  .from('users')
                  .update({ linked_banks: updatedBanks })
                  .eq('id', userData.id);
                
                if (error) {
                  alert("❌ Lỗi khi thêm thẻ: " + error.message);
                  return;
                }
                
                // Cập nhật state local
                setLinkedBanks(updatedBanks);
                const newUserData = { ...userData, linkedBanks: updatedBanks };
                setUserData(newUserData);
                
                setWithdrawBank(id);
                setNewBankName("");
                setNewBankNumber("");
                setNewBankHolder("");
                alert("✅ VinFast thông báo\n\nLiên kết thẻ thành công!");
                setMode("overview");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#f9fafb",
              }}
            >
              Lưu thẻ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "deposit") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.7)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            Nạp tiền vào ví
          </div>
          <label style={{ fontSize: 12, opacity: 0.85 }}>Số tiền muốn nạp</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Nhập số tiền (VD: 5.000.000)"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.9,
              lineHeight: 1.5,
            }}
          >
            Sau khi nhập số tiền, nhấn
            <strong> Tiếp tục</strong> để chuyển sang giao diện
            <strong> CSKH</strong> hỗ trợ nạp tiền và xác nhận giao dịch.
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setMode("overview")}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                // ✅ Kiểm tra tài khoản bị khóa
                if (userData.isLocked) {
                  alert("🔒 VinFast thông báo\n\nTài khoản của bạn đã bị khóa!\n\nVui lòng liên hệ CSKH để được hỗ trợ.");
                  return;
                }
                
                if (!depositAmount || parseFloat(depositAmount) <= 0) {
                  alert("⚠️ VinFast thông báo\n\nVui lòng nhập số tiền hợp lệ!");
                  return;
                }
                
                // Tạo yêu cầu nạp tiền và gửi đến VinFast
                const amount = parseFloat(depositAmount);
                const now = new Date().toISOString();
                const requestId = `DEP-${Date.now()}`;
                
                const depositRequest = {
                  id: requestId,
                  user_id: userData.id,
                  user_name: userData.fullName,
                  type: "Nạp tiền",
                  amount: amount,
                  bank_info: null,
                  status: "Chờ duyệt",
                  created_at: now
                };
                
                // ✅ Lưu yêu cầu vào Supabase
                const { error } = await supabase
                  .from('transaction_requests')
                  .insert([depositRequest]);
                
                if (error) {
                  alert("❌ Lỗi khi gửi yêu cầu: " + error.message);
                  return;
                }
                
                alert(`✅ VinFast - Yêu cầu nạp tiền thành công!\n\nSố tiền: ₫${amount.toLocaleString()}\nTrạng thái: Đang chờ VinFast xử lý\n\n⏳ Chúng tôi sẽ xác nhận ngay khi nhận được thanh toán của bạn.`);
                setDepositAmount("");
                setMode("overview");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                background:
                  "linear-gradient(135deg,#1d4ed8,#38bdf8)",
                color: "#f9fafb",
              }}
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "withdraw") {
    const effectiveWithdrawBank =
      withdrawBank || defaultBank?.id || linkedBanks[0]?.id || "";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.7)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            Rút tiền về ngân hàng
          </div>

          {!hasBank && (
            <div
              style={{
                fontSize: 12,
                padding: 10,
                borderRadius: 10,
                border: "1px dashed rgba(248,113,113,0.9)",
                background: "rgba(127,29,29,0.3)",
                marginBottom: 10,
              }}
            >
              Bạn chưa liên kết thẻ ngân hàng. Vui lòng liên kết thẻ trước khi
              thực hiện rút tiền.
            </div>
          )}

          <label style={{ fontSize: 12, opacity: 0.85 }}>Số tiền muốn rút</label>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Nhập số tiền (VD: 3.000.000)"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
            disabled={!hasBank}
          />

          <label
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.85,
            }}
          >
            Mật khẩu rút tiền
          </label>
          <input
            type="password"
            value={withdrawPassword}
            onChange={(e) => setWithdrawPassword(e.target.value)}
            placeholder="Nhập mật khẩu giao dịch"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
            disabled={!hasBank}
          />

          <label
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.85,
            }}
          >
            Chọn thẻ ngân hàng đã liên kết
          </label>
          <select
            value={effectiveWithdrawBank}
            onChange={(e) => setWithdrawBank(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.9)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
            disabled={!hasBank}
          >
            {linkedBanks.map((card) => (
              <option key={card.id} value={card.id}>
                {card.displayName}
              </option>
            ))}
          </select>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setMode("linkBank")}
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Quản lý thẻ
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setMode("overview")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  // ✅ Kiểm tra tài khoản bị khóa
                  if (userData.isLocked) {
                    alert("🔒 VinFast thông báo\n\nTài khoản của bạn đã bị khóa!\n\nVui lòng liên hệ CSKH để được hỗ trợ.");
                    return;
                  }
                  
                  if (!hasBank) return;
                  if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                    alert("Vui lòng nhập số tiền hợp lệ!");
                    return;
                  }
                  if (!withdrawPassword) {
                    alert("Vui lòng nhập mật khẩu giao dịch!");
                    return;
                  }
                  
                  // KIỂM TRA MẬT KHẨU GIAO DỊCH
                  if (withdrawPassword !== userData.transactionPassword) {
                    alert("Mật khẩu giao dịch không đúng! Vui lòng kiểm tra lại.");
                    return;
                  }
                  
                  const amount = parseFloat(withdrawAmount);
                  
                  // Kiểm tra số dư
                  if (amount > userData.balance) {
                    alert("Số dư không đủ để rút!");
                    return;
                  }
                  
                  // TRỪ TIỀN NGAY KHI GỬI YÊU CẦU
                  const newBalance = userData.balance - amount;
                  
                  const selectedBank = linkedBanks.find(b => b.id === effectiveWithdrawBank);
                  const now = new Date().toLocaleString('vi-VN');
                  const requestId = `WD-${Date.now()}`;
                  
                  const withdrawRequest = {
                    id: requestId,
                    user_id: userData.id,
                    user_name: userData.fullName,
                    type: "Rút tiền",
                    amount: amount,
                    bank_info: selectedBank?.displayName || "",
                    status: "Chờ duyệt",
                    created_at: new Date().toISOString()
                  };
                  
                  // ✅ Lưu yêu cầu vào Supabase
                  const { error: requestError } = await supabase
                    .from('transaction_requests')
                    .insert([withdrawRequest]);
                  
                  if (requestError) {
                    alert("❌ Lỗi khi gửi yêu cầu: " + requestError.message);
                    return;
                  }
                  
                  // Cập nhật số dư user (trừ tiền ngay)
                  const newTransaction = {
                    id: requestId,
                    type: "Rút tiền",
                    amount: amount,
                    date: now,
                    status: "Chờ duyệt"
                  };
                  
                  const updatedHistory = [newTransaction, ...userData.transactionHistory];
                  
                  // ✅ Cập nhật balance và transaction history trong Supabase
                  const { error: updateError } = await supabase
                    .from('users')
                    .update({ 
                      balance: newBalance,
                      transaction_history: updatedHistory
                    })
                    .eq('id', userData.id);
                  
                  if (updateError) {
                    alert("❌ Lỗi khi cập nhật số dư: " + updateError.message);
                    return;
                  }
                  
                  // Cập nhật local state
                  const updatedUserData = {
                    ...userData,
                    balance: newBalance,
                    transactionHistory: updatedHistory
                  };
                  
                  setUserData(updatedUserData);
                  
                  alert(`✅ VinFast - Yêu cầu rút tiền thành công!\n\nSố tiền: ₫${amount.toLocaleString()}\nTrạng thái: Đang chờ VinFast xử lý\n\n⏳ Chúng tôi sẽ chuyển tiền vào tài khoản của bạn trong vòng 24h. Nếu có vấn đề, số tiền sẽ được hoàn lại vào ví.`);
                  setWithdrawAmount("");
                  setWithdrawPassword("");
                  setMode("overview");
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  background: hasBank
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : "rgba(51,65,85,0.5)",
                  color: "#f9fafb",
                }}
                disabled={!hasBank}
              >
                Xác nhận rút
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mặc định: giao diện tổng quan ví + lịch sử
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%", position: "relative" }}>
      {/* Notification Panel */}
      {showNotifications && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowNotifications(false)}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 20,
              padding: 20,
              maxWidth: 420,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, color: "#e5e7eb" }}>
                🔔 Thông báo
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {notifications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94a3b8",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14 }}>Chưa có thông báo nào</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: notif.read ? "rgba(51,65,85,0.3)" : "rgba(59,130,246,0.1)",
                      border: `1px solid ${
                        notif.type === "success"
                          ? "rgba(34,197,94,0.3)"
                          : notif.type === "error"
                          ? "rgba(239,68,68,0.3)"
                          : notif.type === "warning"
                          ? "rgba(245,158,11,0.3)"
                          : "rgba(148,163,184,0.3)"
                      }`,
                    }}
                    onClick={async () => {
                      // Đánh dấu đã đọc
                      const updatedNotifications = notifications.map(n =>
                        n.id === notif.id ? { ...n, read: true } : n
                      );
                      setNotifications(updatedNotifications);
                      
                      // ✅ Cập nhật vào Supabase
                      const { data: currentUser } = await supabase
                        .from('users')
                        .select('notifications')
                        .eq('id', userData.id)
                        .single();
                      
                      const allNotifs = currentUser?.notifications || [];
                      const updated = allNotifs.map((n: Notification) =>
                        n.id === notif.id ? { ...n, read: true } : n
                      );
                      
                      await supabase
                        .from('users')
                        .update({ notifications: updated })
                        .eq('id', userData.id);
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#e5e7eb" }}>
                        {notif.title}
                      </div>
                      {!notif.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#3b82f6",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      {notif.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet card */}
      <div
        style={{
          borderRadius: 20,
          padding: 16,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1d4ed8 40%, #38bdf8 100%)",
          border: "1px solid rgba(148,163,184,0.7)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.9)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Account name + bell + logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{userData.fullName || "Tài khoản mới"}</div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: unreadCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(15,23,42,0.7)",
              borderRadius: 999,
              border: unreadCount > 0 ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(148,163,184,0.7)",
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#e5e7eb",
              position: "relative",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#ef4444",
                  color: "white",
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: "2px 5px",
                  minWidth: 16,
                  textAlign: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              if (confirm("Bạn có chắc muốn đăng xuất?")) {
                localStorage.removeItem("vinfast_user_session");
                setIsAuthenticated(false);
                setUserData({
                  id: "",
                  fullName: "",
                  emailOrPhone: "",
                  password: "",
                  transactionPassword: "",
                  balance: 0,
                  vipLevel: 0,
                  vipPoints: 0,
                  linkedBanks: [],
                  kycStatus: "Chưa xác minh",
                  isLocked: false,
                  transactionHistory: [],
                  createdAt: "",
                  lastLogin: ""
                });
              }
            }}
            style={{
              background: "rgba(239,68,68,0.2)",
              borderRadius: 999,
              border: "1px solid rgba(239,68,68,0.5)",
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#e5e7eb",
              fontSize: 16,
            }}
            title="Đăng xuất"
          >
            🚪
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.8 }}>Tổng số dư</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>
          ₫{userData.balance.toLocaleString()}
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            fontSize: 12,
          }}
        >
          <StatBox label="Khả dụng" value={`₫${userData.balance.toLocaleString()}`} />
          <StatBox 
            label="Đang chờ xử lý" 
            value={`₫${pendingAmount.toLocaleString()}`}
            color={pendingAmount > 0 ? "#f59e0b" : undefined}
          />
          <StatBox label="Tạm khóa" value="₫0" />
          <StatBox label="Tích lũy nạp" value={`₫${userData.balance.toLocaleString()}`} />
        </div>
      </div>

      {/* Liên kết ngân hàng */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(51,65,85,0.9)",
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Liên kết ngân hàng</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>
              {defaultBank
                ? `Thẻ mặc định: ${defaultBank.displayName}`
                : "Chưa liên kết thẻ nào"}
            </div>
          </div>
          <button
            onClick={() => setMode("linkBank")}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Quản lý
          </button>
        </div>
        <div style={{ fontSize: 11, opacity: 0.8 }}>
          Thẻ ngân hàng dùng để rút tiền và hoàn tiền sẽ được ưu tiên theo thẻ
          mặc định.
        </div>
      </div>

      {/* Buttons row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          width: "100%",
        }}
      >
        <PrimaryIconButton
          label="Nạp tiền"
          icon="➕"
          onClick={() => setMode("deposit")}
        />
        <PrimaryIconButton
          label="Rút tiền"
          icon="⬇️"
          onClick={() => setMode("withdraw")}
        />
        <PrimaryIconButton
          label="Lịch sử"
          icon="📜"
          onClick={() => setMode("history")}
        />
      </div>

      {/* Recent transactions / lịch sử */}
      <div
        style={{
          borderRadius: 18,
          padding: 16,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {mode === "history" ? "Lịch sử giao dịch" : "Giao dịch gần đây"}
          </span>
          {userData.transactionHistory.length > 3 && (
            <button
              onClick={() =>
                setModeHistory((prev) => (prev === "recent" ? "full" : "recent"))
              }
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              {modeHistory === "recent" ? "Xem tất cả" : "Xem gần đây"}
            </button>
          )}
        </div>

        {userData.transactionHistory.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div>Chưa có giao dịch nào</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
              Lịch sử nạp/rút tiền sẽ hiển thị tại đây
            </div>
          </div>
        ) : (
          <>
            {(modeHistory === "recent"
              ? userData.transactionHistory.slice(0, 3)
              : userData.transactionHistory
            ).map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(51,65,85,0.5)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#e5e7eb", marginBottom: 2 }}>
                    {tx.type}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {tx.date}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: tx.type === "Nạp tiền" ? "#22c55e" : "#f59e0b",
                      marginBottom: 2,
                    }}
                  >
                    {tx.type === "Nạp tiền" ? "+" : "-"}₫{tx.amount.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 999,
                      display: "inline-block",
                      background:
                        tx.status === "Thành công"
                          ? "rgba(34,197,94,0.2)"
                          : tx.status === "Chờ duyệt"
                          ? "rgba(245,158,11,0.2)"
                          : "rgba(239,68,68,0.2)",
                      color:
                        tx.status === "Thành công"
                          ? "#22c55e"
                          : tx.status === "Chờ duyệt"
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

/*** Sub components dùng lại */
const StatBox: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div
    style={{
      padding: 10,
      borderRadius: 12,
      background: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(148,163,184,0.6)",
    }}
  >
    <div style={{ opacity: 0.7 }}>{label}</div>
    <div style={{ fontWeight: 600, color: color || "#e5e7eb" }}>{value}</div>
  </div>
);

interface PrimaryIconButtonProps {
  label: string;
  icon: string;
  onClick?: () => void;
}

const PrimaryIconButton: React.FC<PrimaryIconButtonProps> = ({
  label,
  icon,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "12px 8px",
      borderRadius: 16,
      background: "rgba(15,23,42,0.9)",
      border: "1px solid rgba(148,163,184,0.6)",
      color: "#e5e7eb",
      cursor: "pointer",
      fontSize: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
    }}
  >
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const QuickRow: React.FC<{ label: string; action: string; onClick?: () => void }> = ({ label, action, onClick }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>{label}</span>
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.6)",
        background: "transparent",
        color: "#e5e7eb",
        fontSize: 11,
        cursor: "pointer",
      }}
    >
      {action}
    </button>
  </div>
);
