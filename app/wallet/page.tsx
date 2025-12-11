'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Global styles for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes coinSpin {
      0%, 100% { transform: rotateY(0deg) scale(1); }
      25% { transform: rotateY(90deg) scale(0.9); }
      50% { transform: rotateY(180deg) scale(1); }
      75% { transform: rotateY(270deg) scale(0.9); }
    }
    @keyframes hourglassFlip {
      0%, 45% { transform: rotate(0deg); }
      50%, 95% { transform: rotate(180deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes statShine {
      0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      50% { transform: translate(0%, 0%) scale(1.2); opacity: 1; }
    }
    @keyframes gradientMove {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(20%, 10%); }
      50% { transform: translate(-20%, 5%); }
      75% { transform: translate(10%, -10%); }
    }
    @keyframes breathe {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.8; }
    }
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
      50% { filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor); }
    }
    @keyframes rotate360 {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);
}

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
  
  // Thông báo từ Yadea
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
      const savedSession = localStorage.getItem("Yadea_user_session");
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

  // Đồng bộ trạng thái giao dịch từ Yadea (polling mỗi 2 giây - realtime)
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

    // Polling mỗi 2 giây để đồng bộ realtime với Yadea
    const interval = setInterval(syncTransactionStatus, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated, userData.id]);

  // Đồng bộ thông báo từ Yadea (polling mỗi 2 giây - realtime)
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
    personal: "Hồ sơ tài khoản Yadea",
    vip: "Trung tâm hạng VIP",
    wallet: "Ví Yadea",
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
              localStorage.setItem("Yadea_user_session", JSON.stringify({ userId: data.id }));
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
                src="https://Yadeaat-hcm.com/wp-content/uploads/2023/06/Logo_of_Yadea_3D_Banner.svg-1.png" 
                alt="Yadea Logo" 
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
                iconType="vip"
                active={activeTab === "vip"}
                onClick={() => setActiveTab("vip")}
              />
              <NavButton
                label="Ví"
                iconType="wallet"
                active={activeTab === "wallet"}
                onClick={() => setActiveTab("wallet")}
              />
              <NavButton
                label="Cá nhân"
                iconType="profile"
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
        alert("⚠️ Yadea thông báo\n\nVui lòng nhập đầy đủ thông tin đăng nhập!");
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
          alert("⚠️ Yadea thông báo\n\nTài khoản không tồn tại! Vui lòng đăng ký tài khoản mới.");
          return;
        }
        
        // Lấy password từ linked_banks JSONB
        const storedPassword = users.linked_banks?.[0]?.password;
        if (storedPassword !== password) {
          alert("⚠️ Yadea thông báo\n\nMật khẩu không đúng! Vui lòng kiểm tra lại.");
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
        alert("⚠️ Yadea thông báo\n\nVui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }
      
      // VALIDATE EMAIL/PHONE FORMAT
      if (!validateEmailOrPhone(emailOrPhone)) {
        alert("⚠️ Yadea thông báo\n\nEmail hoặc số điện thoại không đúng định dạng!\n\nEmail: example@gmail.com\nSố điện thoại: 0xxxxxxxxx (10 số, bắt đầu bằng 03, 05, 07, 08, 09)");
        return;
      }
      
      // Kiểm tra tài khoản đã tồn tại
      const savedUsersCheck = localStorage.getItem("Yadea_users");
      const existingUsers = savedUsersCheck ? JSON.parse(savedUsersCheck) : [];
      const userExists = existingUsers.find((u: UserData) => u.emailOrPhone === emailOrPhone);
      
      if (userExists) {
        alert("⚠️ Yadea thông báo\n\nEmail/Số điện thoại này đã được đăng ký! Vui lòng đăng nhập hoặc sử dụng thông tin khác.");
        return;
      }
      
      if (password !== confirmPassword) {
        alert("⚠️ Yadea thông báo\n\nMật khẩu đăng nhập xác nhận không khớp!");
        return;
      }
      if (password.length < 6) {
        alert("⚠️ Yadea thông báo\n\nMật khẩu đăng nhập phải có ít nhất 6 ký tự!");
        return;
      }
      if (transactionPassword !== confirmTransactionPassword) {
        alert("⚠️ Yadea thông báo\n\nMật khẩu giao dịch xác nhận không khớp!");
        return;
      }
      if (transactionPassword.length < 6) {
        alert("⚠️ Yadea thông báo\n\nMật khẩu giao dịch phải có ít nhất 6 ký tự!");
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
          alert("⚠️ Yadea thông báo\n\nEmail/Số điện thoại này đã được đăng ký! Vui lòng đăng nhập hoặc sử dụng thông tin khác.");
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
        
        alert("✅ Yadea thông báo\n\nChúc mừng bạn đã đăng ký thành công!");
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
          src="https://Yadeaat-hcm.com/wp-content/uploads/2023/06/Logo_of_Yadea_3D_Banner.svg-1.png" 
          alt="Yadea Logo" 
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
          Đăng nhập để sử dụng ví Yadea & trung tâm VIP
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
            placeholder="VD: demo@Yadea.com / 0888 888 888"
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
        mật của Yadea.
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
  iconType: 'vip' | 'wallet' | 'profile';
  active?: boolean;
  onClick?: () => void;
}

// Custom Navigation Icons với hiệu ứng động SIÊU ĐẸP
const NavIcon: React.FC<{ type: 'vip' | 'wallet' | 'profile', active: boolean }> = ({ type, active }) => {
  const icons = {
    vip: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="vipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={active ? "#fbbf24" : "#94a3b8"} />
            <stop offset="50%" stopColor={active ? "#f59e0b" : "#64748b"} />
            <stop offset="100%" stopColor={active ? "#d97706" : "#475569"} />
          </linearGradient>
          <filter id="vipGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{
          animation: active ? 'pulse 2s ease-in-out infinite, float 3s ease-in-out infinite' : 'none',
          transformOrigin: 'center'
        }}>
          {/* Animated outer rings */}
          {active && (
            <>
              <circle cx="16" cy="16" r="14" stroke="url(#vipGrad)" strokeWidth="2" fill="none" opacity="0.5">
                <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="stroke-width" values="2;0.5;2" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="16" cy="16" r="15" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.4">
                <animate attributeName="r" values="15;20;15" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
              </circle>
            </>
          )}
          
          {/* Rotating diamond star */}
          <g style={{
            animation: active ? 'rotate360 20s linear infinite' : 'none',
            transformOrigin: 'center'
          }}>
            <path d="M16 4L20 12L28 14L22 20L24 28L16 24L8 28L10 20L4 14L12 12L16 4Z" 
                  fill="url(#vipGrad)" 
                  filter={active ? "url(#vipGlow)" : "none"}
                  opacity={active ? "1" : "0.6"}/>
            <path d="M16 8L18 14L24 15L20 19L21 25L16 22L11 25L12 19L8 15L14 14L16 8Z" 
                  fill="#fff" 
                  opacity={active ? "0.9" : "0.3"}/>
          </g>
          
          {/* Center sparkle */}
          <circle cx="16" cy="16" r="2" fill="#fff" opacity={active ? "1" : "0.6"}>
            {active && <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite"/>}
          </circle>
          
          {/* 4 corner sparkles khi active */}
          {active && (
            <>
              <circle cx="16" cy="6" r="1.5" fill="#fbbf24">
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" begin="0s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="26" cy="16" r="1.5" fill="#fbbf24">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="16" cy="26" r="1.5" fill="#fbbf24">
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" begin="1s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="6" cy="16" r="1.5" fill="#fbbf24">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="1.5s" repeatCount="indefinite"/>
                <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
              </circle>
            </>
          )}
        </g>
      </svg>
    ),
    wallet: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={active ? "#10b981" : "#94a3b8"} />
            <stop offset="50%" stopColor={active ? "#059669" : "#64748b"} />
            <stop offset="100%" stopColor={active ? "#047857" : "#475569"} />
          </linearGradient>
          <filter id="walletGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="walletShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0"/>
            <stop offset="50%" stopColor="#fff" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g style={{
          animation: active ? 'pulse 2s ease-in-out infinite, float 3s ease-in-out infinite 0.5s' : 'none',
          transformOrigin: 'center'
        }}>
          {/* Animated border rings */}
          {active && (
            <>
              <rect x="1" y="5" width="30" height="22" rx="4" 
                    stroke="url(#walletGrad)" strokeWidth="2" fill="none" opacity="0.5">
                <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
              </rect>
              <rect x="0" y="4" width="32" height="24" rx="5" 
                    stroke="#10b981" strokeWidth="1" fill="none" opacity="0.3">
                <animate attributeName="stroke-width" values="1;2;1" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
              </rect>
            </>
          )}
          
          {/* Main wallet card */}
          <rect x="4" y="8" width="24" height="16" rx="3" 
                fill="url(#walletGrad)" 
                filter={active ? "url(#walletGlow)" : "none"}
                opacity={active ? "0.95" : "0.6"}/>
          
          {/* Card border */}
          <rect x="4" y="8" width="24" height="16" rx="3" 
                stroke={active ? "#fff" : "#64748b"} 
                strokeWidth="1.5" 
                fill="none"
                opacity={active ? "0.4" : "0.3"}/>
          
          {/* Animated shine effect */}
          {active && (
            <rect x="4" y="8" width="4" height="16" fill="url(#walletShine)" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="20 0"
                dur="3s"
                repeatCount="indefinite"/>
            </rect>
          )}
          
          {/* Card chip with glow */}
          <rect x="8" y="12" width="6" height="5" rx="1" 
                fill={active ? "#fbbf24" : "#64748b"} 
                opacity={active ? "0.9" : "0.5"}>
            {active && <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>}
          </rect>
          
          {/* Wallet button */}
          <circle cx="22" cy="16" r="3" 
                  fill={active ? "#fff" : "#94a3b8"} 
                  opacity={active ? "0.95" : "0.4"}>
            {active && (
              <animate attributeName="r" values="3;3.5;3" dur="1.5s" repeatCount="indefinite"/>
            )}
          </circle>
          <circle cx="22" cy="16" r="1.5" fill="url(#walletGrad)" opacity={active ? "1" : "0.6"}/>
          
          {/* Money symbol */}
          <text x="22" y="17.5" fontSize="4" fontWeight="bold" fill="#fff" textAnchor="middle" opacity={active ? "1" : "0.5"}>¥</text>
        </g>
      </svg>
    ),
    profile: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={active ? "#3b82f6" : "#94a3b8"} />
            <stop offset="50%" stopColor={active ? "#8b5cf6" : "#64748b"} />
            <stop offset="100%" stopColor={active ? "#ec4899" : "#475569"} />
          </linearGradient>
          <filter id="profileGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="profileAura">
            <stop offset="0%" stopColor={active ? "#8b5cf6" : "#64748b"} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={active ? "#ec4899" : "#475569"} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{
          animation: active ? 'pulse 2s ease-in-out infinite, float 3s ease-in-out infinite 1s' : 'none',
          transformOrigin: 'center'
        }}>
          {/* Animated aura rings */}
          {active && (
            <>
              <circle cx="16" cy="16" r="13" stroke="url(#profileGrad)" strokeWidth="2" fill="none" opacity="0.5">
                <animate attributeName="r" values="13;17;13" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="stroke-width" values="2;0.5;2" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="16" cy="16" r="14" stroke="#ec4899" strokeWidth="1.5" fill="none" opacity="0.4">
                <animate attributeName="r" values="14;19;14" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
              </circle>
              {/* Aura glow background */}
              <circle cx="16" cy="16" r="12" fill="url(#profileAura)" opacity="0.3">
                <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
            </>
          )}
          
          {/* Head */}
          <circle cx="16" cy="12" r="5" 
                  fill="url(#profileGrad)" 
                  filter={active ? "url(#profileGlow)" : "none"}
                  opacity={active ? "1" : "0.6"}>
            {active && <animate attributeName="r" values="5;5.3;5" dur="2s" repeatCount="indefinite"/>}
          </circle>
          
          {/* Head highlight */}
          <circle cx="14.5" cy="10.5" r="1.5" fill="#fff" opacity={active ? "0.7" : "0.3"}/>
          
          {/* Body */}
          <path d="M8 26C8 21 11 18 16 18C21 18 24 21 24 26" 
                stroke="url(#profileGrad)" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none"
                filter={active ? "url(#profileGlow)" : "none"}
                opacity={active ? "1" : "0.6"}>
            {active && (
              <animate attributeName="stroke-width" values="4;4.5;4" dur="2s" repeatCount="indefinite"/>
            )}
          </path>
          
          {/* Decorative dots */}
          {active && (
            <>
              <circle cx="16" cy="6" r="1" fill="#3b82f6">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="22" cy="10" r="1" fill="#8b5cf6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="10" cy="10" r="1" fill="#ec4899">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="1s" repeatCount="indefinite"/>
              </circle>
            </>
          )}
        </g>
      </svg>
    ),
  };
  return icons[type];
};

const NavButton: React.FC<NavButtonProps> = ({
  label,
  iconType,
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
      <div style={{ 
        fontSize: 24, 
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <NavIcon type={iconType} active={active || false} />
      </div>
      <span style={{ 
        lineHeight: 1,
        letterSpacing: "0.3px",
      }}>{label}</span>
    </button>
  );
};

/*** TAB 1: Cá nhân - Hoàn chỉnh với đầy đủ tính năng ví điện tử */
interface PersonalSectionProps {
  userData: UserData;
}

const PersonalSection: React.FC<PersonalSectionProps> = ({ userData }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingCards, setIsManagingCards] = useState(false);
  const [isViewingLimits, setIsViewingLimits] = useState(false);
  const [isViewingReferral, setIsViewingReferral] = useState(false);
  
  const [editName, setEditName] = useState(userData.fullName);
  const [editEmail, setEditEmail] = useState(userData.emailOrPhone);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Biometric & 2FA
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  // Transaction settings
  const [isDailyLimitEnabled, setIsDailyLimitEnabled] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(50000000); // 50 triệu VNĐ
  const [isAutoTopupEnabled, setIsAutoTopupEnabled] = useState(false);
  
  // Lấy chữ cái đầu của tên
  const initials = userData.fullName 
    ? userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : "YD";
  
  // Tạo ID từ email/phone
  const userId = userData.emailOrPhone 
    ? `YD-${Math.abs(userData.emailOrPhone.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`.substring(0, 13)
    : "YD-000000000";
  
  // Referral code
  const referralCode = userId.replace("YD-", "REF");
  
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
    const savedUsers = localStorage.getItem("Yadea_users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const updatedUsers = users.map((u: UserData) => {
      if (u.id === userData.id) {
        return { ...u, fullName: editName, emailOrPhone: editEmail };
      }
      return u;
    });
    localStorage.setItem("Yadea_users", JSON.stringify(updatedUsers));
    
    alert("✅ Cập nhật thông tin thành công! Vui lòng đăng nhập lại để thấy thay đổi.");
    setIsEditingProfile(false);
  };
  
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("❌ Mật khẩu mới không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      alert("⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    
    // Update password in localStorage
    const savedUsers = localStorage.getItem("Yadea_users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const updatedUsers = users.map((u: UserData) => {
      if (u.id === userData.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    localStorage.setItem("Yadea_users", JSON.stringify(updatedUsers));
    
    alert("✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
    setIsChangingPassword(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };
  
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    alert(`✅ Đã sao chép mã giới thiệu: ${referralCode}`);
  };
  
  const handleToggleBiometric = () => {
    setIsBiometricEnabled(!isBiometricEnabled);
    alert(isBiometricEnabled 
      ? "❌ Đã tắt xác thực sinh trắc học" 
      : "✅ Đã bật xác thực sinh trắc học"
    );
  };
  
  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    alert(is2FAEnabled 
      ? "❌ Đã tắt xác thực 2 yếu tố" 
      : "✅ Đã bật xác thực 2 yếu tố - Mã OTP sẽ được gửi qua email"
    );
  };
  
  return (
    <div style={{ display: "grid", gap: 14, paddingBottom: 20 }}>
      {/* Card thông tin cơ bản với VIP background */}
      <div
        style={{
          borderRadius: 24,
          padding: 20,
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
            background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(15,23,42,0.85))",
            borderRadius: 24,
            zIndex: 1,
          }}
        />
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "grid",
                placeItems: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                border: "3px solid rgba(255,255,255,0.4)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                {userData.fullName || "Tài khoản Yadea"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, color: "#fbbf24", fontWeight: 600 }}>
                ID: {userId}
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: 13, 
            display: "grid", 
            gap: 7, 
            color: "#fff",
            background: "rgba(0,0,0,0.3)",
            padding: 12,
            borderRadius: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>📧</span>
              <span>{userData.emailOrPhone || "Chưa cập nhật"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>💰</span>
              <span>Số dư: </span>
              <span style={{ fontWeight: 700, color: "#4ade80" }}>₫{userData.balance.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>💎</span>
              <span>VIP Level {userData.vipLevel} • {userData.vipPoints.toLocaleString()} điểm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>✅</span>
              <span>KYC: </span>
              <span style={{ 
                fontWeight: 600,
                color: userData.kycStatus === "Đã xác minh" ? "#4ade80" : "#fbbf24" 
              }}>
                {userData.kycStatus}
              </span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🕐</span>
              <span>Lần đăng nhập: {userData.lastLogin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid - 6 mục chính */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}>
        <MenuCard 
          icon="👤" 
          label="Thông tin" 
          color="#3b82f6"
          onClick={() => setIsEditingProfile(true)}
        />
        <MenuCard 
          icon="🔒" 
          label="Bảo mật" 
          color="#10b981"
          onClick={() => setActiveMenu("security")}
        />
        <MenuCard 
          icon="💳" 
          label="Thẻ ngân hàng" 
          color="#f59e0b"
          onClick={() => setIsManagingCards(true)}
        />
        <MenuCard 
          icon="📊" 
          label="Hạn mức" 
          color="#8b5cf6"
          onClick={() => setIsViewingLimits(true)}
        />
        <MenuCard 
          icon="🎁" 
          label="Giới thiệu" 
          color="#ec4899"
          onClick={() => setIsViewingReferral(true)}
        />
        <MenuCard 
          icon="⚙️" 
          label="Cài đặt" 
          color="#64748b"
          onClick={() => setActiveMenu("settings")}
        />
      </div>

      {/* Security Menu */}
      {activeMenu === "security" && (
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(16,185,129,0.4)",
            boxShadow: "0 8px 20px rgba(16,185,129,0.2)",
          }}
        >
          <div style={{ 
            fontSize: 15, 
            fontWeight: 600, 
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>🔒</span>
            <span>Bảo mật tài khoản</span>
          </div>
          <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
            <SecurityRow 
              icon="🔑"
              label="Đổi mật khẩu đăng nhập" 
              action="Đổi"
              onClick={() => {
                setIsChangingPassword(true);
                setActiveMenu(null);
              }}
            />
            <SecurityRow 
              icon="👆"
              label="Xác thực sinh trắc học" 
              action={isBiometricEnabled ? "BẬT" : "TẮT"}
              actionColor={isBiometricEnabled ? "#22c55e" : "#64748b"}
              onClick={handleToggleBiometric}
            />
            <SecurityRow 
              icon="📱"
              label="Xác thực 2 yếu tố (2FA)" 
              action={is2FAEnabled ? "BẬT" : "TẮT"}
              actionColor={is2FAEnabled ? "#22c55e" : "#64748b"}
              onClick={handleToggle2FA}
            />
            <SecurityRow 
              icon="💻"
              label="Quản lý thiết bị" 
              action="Xem"
              onClick={() => {
                alert("💻 Thiết bị hiện tại: " + (navigator.userAgent.includes("Windows") ? "Windows PC" : "Thiết bị khác") + "\n\n✅ Đang hoạt động");
                setActiveMenu(null);
              }}
            />
            <SecurityRow 
              icon="📜"
              label="Nhật ký hoạt động" 
              action="Xem"
              onClick={() => {
                alert("📜 Nhật ký hoạt động:\n\n" +
                      `🕐 ${userData.lastLogin} - Đăng nhập thành công\n` +
                      "💰 Giao dịch gần nhất đã được ghi nhận\n" +
                      "🔒 Không phát hiện hoạt động bất thường");
                setActiveMenu(null);
              }}
            />
          </div>
          <button
            onClick={() => setActiveMenu(null)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "rgba(100,116,139,0.3)",
              color: "#e5e7eb",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      )}

      {/* Settings Menu */}
      {activeMenu === "settings" && (
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(100,116,139,0.4)",
          }}
        >
          <div style={{ 
            fontSize: 15, 
            fontWeight: 600, 
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>⚙️</span>
            <span>Cài đặt ứng dụng</span>
          </div>
          <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
            <SettingRow 
              icon="🔔"
              label="Thông báo push" 
              enabled={true}
              onToggle={() => alert("🔔 Tính năng thông báo đang được phát triển")}
            />
            <SettingRow 
              icon="📧"
              label="Thông báo email" 
              enabled={true}
              onToggle={() => alert("📧 Tính năng thông báo email đang hoạt động")}
            />
            <SettingRow 
              icon="💰"
              label="Tự động nạp tiền khi thấp" 
              enabled={isAutoTopupEnabled}
              onToggle={() => {
                setIsAutoTopupEnabled(!isAutoTopupEnabled);
                alert(isAutoTopupEnabled 
                  ? "❌ Đã tắt tự động nạp tiền" 
                  : "✅ Đã bật tự động nạp tiền khi số dư < 100,000₫"
                );
              }}
            />
            <SecurityRow 
              icon="🌐"
              label="Ngôn ngữ" 
              action="Tiếng Việt"
              onClick={() => alert("🌐 Hiện tại chỉ hỗ trợ Tiếng Việt")}
            />
            <SecurityRow 
              icon="🎨"
              label="Giao diện" 
              action="Tối"
              onClick={() => alert("🎨 Giao diện tối đang được sử dụng")}
            />
          </div>
          <button
            onClick={() => setActiveMenu(null)}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "rgba(100,116,139,0.3)",
              color: "#e5e7eb",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      )}

      {/* Thống kê sử dụng */}
      <div
        style={{
          borderRadius: 18,
          padding: 16,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          📊 Thống kê hoạt động
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          fontSize: 12,
        }}>
          <StatCard 
            label="Tổng nạp"
            value={`₫${(userData.balance * 2.5).toLocaleString()}`}
            icon="💵"
            color="#22c55e"
          />
          <StatCard 
            label="Tổng rút"
            value={`₫${(userData.balance * 1.2).toLocaleString()}`}
            icon="💸"
            color="#f59e0b"
          />
          <StatCard 
            label="Giao dịch"
            value="47 lần"
            icon="📝"
            color="#3b82f6"
          />
          <StatCard 
            label="Điểm VIP"
            value={userData.vipPoints.toLocaleString()}
            icon="💎"
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Hỗ trợ & Liên hệ */}
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          📞 Hỗ trợ khách hàng
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <QuickRow 
            label="Hotline hỗ trợ 24/7" 
            action="Gọi"
            onClick={() => alert("📞 Hotline: 1900-xxxx\n\n✅ Hỗ trợ 24/7 mọi vấn đề về tài khoản và giao dịch")}
          />
          <QuickRow 
            label="Email hỗ trợ" 
            action="Gửi"
            onClick={() => alert("📧 Email: support@yadea.vn\n\nChúng tôi sẽ phản hồi trong vòng 24h")}
          />
          <QuickRow 
            label="Trung tâm trợ giúp" 
            action="Xem"
            onClick={() => alert("❓ Trung tâm trợ giúp:\n\n• Hướng dẫn sử dụng\n• Câu hỏi thường gặp\n• Chính sách bảo mật\n• Điều khoản sử dụng")}
          />
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={() => {
          if (confirm("🚪 Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("Yadea_user_session");
            window.location.reload();
          }
        }}
        style={{
          padding: "14px",
          borderRadius: 14,
          border: "1px solid rgba(239,68,68,0.4)",
          background: "rgba(239,68,68,0.1)",
          color: "#ef4444",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span>🚪</span>
        <span>Đăng xuất</span>
      </button>
      
      {/* Modal: Chỉnh sửa thông tin */}
      {isEditingProfile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
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
              borderRadius: 18,
              padding: 22,
              maxWidth: 420,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 18px 0", fontSize: 17, color: "#e5e7eb", fontWeight: 600 }}>
              👤 Chỉnh sửa thông tin cá nhân
            </h3>
            
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Email/Số điện thoại
                </label>
                <input
                  type="text"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Nhập email hoặc số điện thoại"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Số điện thoại phụ (tuỳ chọn)
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Nhập số điện thoại phụ"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Địa chỉ (tuỳ chọn)
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Nhập địa chỉ của bạn"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                    resize: "none",
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsEditingProfile(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#1d4ed8,#38bdf8)",
                  color: "#fff",
                  fontSize: 13,
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
            background: "rgba(0,0,0,0.85)",
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
              borderRadius: 18,
              padding: 22,
              maxWidth: 420,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 18px 0", fontSize: 17, color: "#e5e7eb", fontWeight: 600 }}>
              🔑 Đổi mật khẩu đăng nhập
            </h3>
            
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 12, opacity: 0.8, display: "block", marginBottom: 6 }}>
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.3)",
                    background: "rgba(30,41,59,0.5)",
                    color: "#e5e7eb",
                    fontSize: 14,
                  }}
                />
              </div>
              
              <div style={{ 
                fontSize: 11, 
                opacity: 0.7, 
                background: "rgba(59,130,246,0.1)",
                padding: 10,
                borderRadius: 8,
                border: "1px solid rgba(59,130,246,0.2)",
              }}>
                💡 Mật khẩu mạnh nên có: Chữ hoa, chữ thường, số và ký tự đặc biệt
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsChangingPassword(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontSize: 13,
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
      
      {/* Modal: Quản lý thẻ ngân hàng */}
      {isManagingCards && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsManagingCards(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 18,
              padding: 22,
              maxWidth: 420,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 18px 0", fontSize: 17, color: "#e5e7eb", fontWeight: 600 }}>
              💳 Thẻ ngân hàng đã liên kết
            </h3>
            
            {/* Example card */}
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.3)",
                background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>🏦</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>
                    Vietcombank
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    **** **** **** 4589
                  </div>
                </div>
              </div>
              <div style={{ 
                fontSize: 10, 
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(34,197,94,0.2)",
                color: "#4ade80",
                fontWeight: 600,
                display: "inline-block",
              }}>
                • Thẻ chính
              </div>
            </div>
            
            <button
              onClick={() => alert("➕ Tính năng thêm thẻ mới sẽ được cập nhật sớm")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1px dashed rgba(148,163,184,0.4)",
                background: "rgba(30,41,59,0.3)",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 14,
              }}
            >
              ➕ Thêm thẻ mới
            </button>
            
            <div style={{ fontSize: 11, opacity: 0.6, textAlign: "center", marginBottom: 14 }}>
              Thông tin thẻ được mã hóa và bảo mật tuyệt đối
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setIsManagingCards(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Hạn mức giao dịch */}
      {isViewingLimits && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsViewingLimits(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 18,
              padding: 22,
              maxWidth: 420,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 18px 0", fontSize: 17, color: "#e5e7eb", fontWeight: 600 }}>
              📊 Hạn mức giao dịch
            </h3>
            
            <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
              <LimitCard 
                label="Hạn mức nạp tiền/ngày"
                current="₫0"
                max="₫100,000,000"
                percentage={0}
                color="#22c55e"
              />
              <LimitCard 
                label="Hạn mức rút tiền/ngày"
                current="₫0"
                max="₫50,000,000"
                percentage={0}
                color="#f59e0b"
              />
              <LimitCard 
                label="Hạn mức chuyển tiền/ngày"
                current="₫0"
                max="₫200,000,000"
                percentage={0}
                color="#3b82f6"
              />
            </div>
            
            <div style={{ 
              fontSize: 11, 
              opacity: 0.7, 
              background: "rgba(139,92,246,0.1)",
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(139,92,246,0.2)",
              marginBottom: 14,
            }}>
              💎 Nâng cấp VIP để tăng hạn mức giao dịch
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setIsViewingLimits(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Giới thiệu bạn bè */}
      {isViewingReferral && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
            padding: 20,
          }}
          onClick={() => setIsViewingReferral(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,23,42,0.98)",
              borderRadius: 18,
              padding: 22,
              maxWidth: 420,
              width: "100%",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ margin: "0 0 18px 0", fontSize: 17, color: "#e5e7eb", fontWeight: 600 }}>
              🎁 Giới thiệu bạn bè
            </h3>
            
            <div style={{ 
              padding: 16,
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(236,72,153,0.4)",
              marginBottom: 16,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                Mã giới thiệu của bạn
              </div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: "#ec4899",
                letterSpacing: 2,
                marginBottom: 12,
              }}>
                {referralCode}
              </div>
              <button
                onClick={handleCopyReferral}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#ec4899,#8b5cf6)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📋 Sao chép mã
              </button>
            </div>
            
            <div style={{ 
              fontSize: 13, 
              background: "rgba(30,41,59,0.5)",
              padding: 14,
              borderRadius: 10,
              marginBottom: 14,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>🎉 Ưu đãi giới thiệu:</div>
              <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>
                • Bạn được: <strong style={{ color: "#22c55e" }}>100,000₫</strong> + <strong style={{ color: "#8b5cf6" }}>500 điểm VIP</strong><br/>
                • Bạn bè được: <strong style={{ color: "#22c55e" }}>50,000₫</strong> khi nạp lần đầu<br/>
                • Không giới hạn số lượng người giới thiệu
              </div>
            </div>
            
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 14,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ec4899" }}>0</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Đã mời</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>₫0</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Đã nhận</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#8b5cf6" }}>0</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Điểm thưởng</div>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setIsViewingReferral(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 13,
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

// Helper Components
const MenuCard: React.FC<{ icon: string; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "16px 12px",
      borderRadius: 14,
      background: `linear-gradient(135deg, ${color}15, ${color}08)`,
      border: `1px solid ${color}40`,
      color: "#e5e7eb",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = `0 8px 20px ${color}30`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <span style={{ fontSize: 28 }}>{icon}</span>
    <span style={{ letterSpacing: "0.2px" }}>{label}</span>
  </button>
);

const SecurityRow: React.FC<{ icon: string; label: string; action: string; actionColor?: string; onClick: () => void }> = ({ icon, label, action, actionColor, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 12px",
      borderRadius: 10,
      background: "rgba(30,41,59,0.4)",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(30,41,59,0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(30,41,59,0.4)";
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </div>
    <button
      style={{
        padding: "5px 12px",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.3)",
        background: "transparent",
        color: actionColor || "#e5e7eb",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {action}
    </button>
  </div>
);

const SettingRow: React.FC<{ icon: string; label: string; enabled: boolean; onToggle: () => void }> = ({ icon, label, enabled, onToggle }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 12px",
      borderRadius: 10,
      background: "rgba(30,41,59,0.4)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </div>
    <button
      onClick={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: enabled ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(100,116,139,0.5)",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 2,
        left: enabled ? 22 : 2,
        transition: "all 0.3s ease",
      }} />
    </button>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div style={{
    padding: 12,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1px solid ${color}30`,
  }}>
    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
  </div>
);

const LimitCard: React.FC<{ label: string; current: string; max: string; percentage: number; color: string }> = ({ label, current, max, percentage, color }) => (
  <div style={{
    padding: 14,
    borderRadius: 12,
    background: "rgba(30,41,59,0.5)",
    border: "1px solid rgba(148,163,184,0.2)",
  }}>
    <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>{label}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{current}</span>
      <span style={{ fontSize: 11, opacity: 0.6 }}>/ {max}</span>
    </div>
    <div style={{ 
      height: 6, 
      borderRadius: 999, 
      background: "rgba(100,116,139,0.3)",
      overflow: "hidden",
    }}>
      <div style={{ 
        height: "100%", 
        width: `${percentage}%`, 
        background: color,
        transition: "width 0.5s ease",
      }} />
    </div>
  </div>
);

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
          <li>Tham gia sự kiện / ưu đãi nội bộ Yadea.</li>
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
                  alert("⚠️ Yadea thông báo\n\nVui lòng điền đầy đủ thông tin thẻ ngân hàng!");
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
                alert("✅ Yadea thông báo\n\nLiên kết thẻ thành công!");
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
                  alert("🔒 Yadea thông báo\n\nTài khoản của bạn đã bị khóa!\n\nVui lòng liên hệ CSKH để được hỗ trợ.");
                  return;
                }
                
                if (!depositAmount || parseFloat(depositAmount) <= 0) {
                  alert("⚠️ Yadea thông báo\n\nVui lòng nhập số tiền hợp lệ!");
                  return;
                }
                
                // Tạo yêu cầu nạp tiền và gửi đến Yadea
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
                
                alert(`✅ Yadea - Yêu cầu nạp tiền thành công!\n\nSố tiền: ₫${amount.toLocaleString()}\nTrạng thái: Đang chờ Yadea xử lý\n\n⏳ Chúng tôi sẽ xác nhận ngay khi nhận được thanh toán của bạn.`);
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
                    alert("🔒 Yadea thông báo\n\nTài khoản của bạn đã bị khóa!\n\nVui lòng liên hệ CSKH để được hỗ trợ.");
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
                  
                  alert(`✅ Yadea - Yêu cầu rút tiền thành công!\n\nSố tiền: ₫${amount.toLocaleString()}\nTrạng thái: Đang chờ Yadea xử lý\n\n⏳ Chúng tôi sẽ chuyển tiền vào tài khoản của bạn trong vòng 24h. Nếu có vấn đề, số tiền sẽ được hoàn lại vào ví.`);
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
                localStorage.removeItem("Yadea_user_session");
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
          <StatBox 
            label="Khả dụng" 
            value={`₫${userData.balance.toLocaleString()}`} 
            iconType="balance"
            color="#10b981"
          />
          <StatBox 
            label="Đang chờ xử lý" 
            value={`₫${pendingAmount.toLocaleString()}`}
            iconType="pending"
            color={pendingAmount > 0 ? "#3b82f6" : "#64748b"}
          />
          <StatBox 
            label="Tạm khóa" 
            value="₫0" 
            iconType="locked"
            color="#ef4444"
          />
          <StatBox 
            label="Tích lũy nạp" 
            value={`₫${userData.balance.toLocaleString()}`} 
            iconType="deposit"
            color="#fbbf24"
          />
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
          iconType="deposit"
          onClick={() => setMode("deposit")}
        />
        <PrimaryIconButton
          label="Rút tiền"
          iconType="withdraw"
          onClick={() => setMode("withdraw")}
        />
        <PrimaryIconButton
          label="Lịch sử"
          iconType="history"
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

// Premium Icon Component cho Stats
const StatIcon: React.FC<{ type: 'balance' | 'deposit' | 'locked' | 'pending' }> = ({ type }) => {
  const icons = {
    balance: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="balanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="balanceGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect x="4" y="8" width="24" height="16" rx="3" fill="url(#balanceGrad)" filter="url(#balanceGlow)" opacity="0.3"/>
        <rect x="4" y="8" width="24" height="16" rx="3" stroke="url(#balanceGrad)" strokeWidth="2" fill="none"/>
        <circle cx="16" cy="16" r="4" fill="url(#balanceGrad)"/>
        <circle cx="10" cy="16" r="1.5" fill="#10b981" opacity="0.6"/>
        <circle cx="22" cy="16" r="1.5" fill="#10b981" opacity="0.6"/>
        <path d="M8 8L8 6C8 4.89543 8.89543 4 10 4L22 4C23.1046 4 24 4.89543 24 6L24 8" stroke="url(#balanceGrad)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    deposit: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="depositGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="depositGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="16" cy="16" r="12" fill="url(#depositGrad)" filter="url(#depositGlow)" opacity="0.2"/>
        <circle cx="16" cy="16" r="11" stroke="url(#depositGrad)" strokeWidth="2" fill="none"/>
        <g style={{animation: 'coinSpin 2s ease-in-out infinite'}}>
          <circle cx="16" cy="16" r="8" fill="url(#depositGrad)"/>
          <text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">¥</text>
        </g>
        <path d="M12 8L16 4L20 8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
        </path>
      </svg>
    ),
    locked: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="lockGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect x="8" y="14" width="16" height="12" rx="2" fill="url(#lockGrad)" filter="url(#lockGlow)" opacity="0.3"/>
        <rect x="8" y="14" width="16" height="12" rx="2" stroke="url(#lockGrad)" strokeWidth="2" fill="none"/>
        <path d="M12 14V10C12 7.79086 13.7909 6 16 6C18.2091 6 20 7.79086 20 10V14" stroke="url(#lockGrad)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="20" r="2" fill="#fff"/>
        <rect x="15" y="20" width="2" height="3" rx="1" fill="#fff"/>
        <g opacity="0.6">
          <circle cx="12" cy="10" r="1" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="20" cy="10" r="1" fill="#ef4444">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    ),
    pending: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="pendingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="pendingGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{animation: 'hourglassFlip 3s ease-in-out infinite'}}>
          <path d="M10 4h12M10 28h12M12 4v3c0 2 2 3 4 4 2 1 4 2 4 4v6c0 2-2 3-4 4-2 1-4 2-4 4v3M10 4h12v0c0 0-1 1-2 2l-3 3c-1 1-1 2 0 3l3 3c1 1 2 2 2 2v0H10v0c0 0 1-1 2-2l3-3c1-1 1-2 0-3l-3-3c-1-1-2-2-2-2v0z" 
                stroke="url(#pendingGrad)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M12 8c0 0 2 2 4 3s4 1 4 1" stroke="url(#pendingGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.5">
            <animate attributeName="d" 
              values="M12 8c0 0 2 2 4 3s4 1 4 1;M12 12c0 0 2 1 4 2s4 0 4 0;M12 16c0 0 2 0 4 0s4 0 4 0" 
              dur="3s" repeatCount="indefinite"/>
          </path>
        </g>
        <circle cx="16" cy="16" r="14" stroke="url(#pendingGrad)" strokeWidth="1" fill="none" opacity="0.3" filter="url(#pendingGlow)"/>
      </svg>
    ),
  };
  return icons[type];
};

const StatBox: React.FC<{ 
  label: string; 
  value: string; 
  color?: string;
  iconType?: 'balance' | 'deposit' | 'locked' | 'pending';
}> = ({ label, value, color, iconType }) => {
  // Backgrounds độc đáo với nhiều lớp gradient và patterns
  const backgrounds = {
    balance: {
      base: "linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 50%, rgba(4,120,87,0.1) 100%)",
      glow: "radial-gradient(ellipse at top left, rgba(52,211,153,0.3), transparent 60%)",
      pattern: "repeating-linear-gradient(45deg, rgba(16,185,129,0.05) 0px, rgba(16,185,129,0.05) 2px, transparent 2px, transparent 8px)",
      border: "linear-gradient(135deg, rgba(52,211,153,0.6), rgba(16,185,129,0.3))",
      shadow: "0 8px 32px rgba(16,185,129,0.3)"
    },
    deposit: {
      base: "linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(217,119,6,0.15) 50%, rgba(180,83,9,0.1) 100%)",
      glow: "radial-gradient(ellipse at top right, rgba(252,211,77,0.3), transparent 60%)",
      pattern: "repeating-linear-gradient(-45deg, rgba(251,191,36,0.05) 0px, rgba(251,191,36,0.05) 2px, transparent 2px, transparent 8px)",
      border: "linear-gradient(135deg, rgba(252,211,77,0.6), rgba(251,191,36,0.3))",
      shadow: "0 8px 32px rgba(251,191,36,0.3)"
    },
    locked: {
      base: "linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.15) 50%, rgba(185,28,28,0.1) 100%)",
      glow: "radial-gradient(ellipse at bottom left, rgba(248,113,113,0.3), transparent 60%)",
      pattern: "repeating-linear-gradient(90deg, rgba(239,68,68,0.05) 0px, rgba(239,68,68,0.05) 2px, transparent 2px, transparent 8px)",
      border: "linear-gradient(135deg, rgba(248,113,113,0.6), rgba(239,68,68,0.3))",
      shadow: "0 8px 32px rgba(239,68,68,0.3)"
    },
    pending: {
      base: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(29,78,216,0.15) 50%, rgba(30,64,175,0.1) 100%)",
      glow: "radial-gradient(ellipse at bottom right, rgba(96,165,250,0.3), transparent 60%)",
      pattern: "repeating-linear-gradient(0deg, rgba(59,130,246,0.05) 0px, rgba(59,130,246,0.05) 2px, transparent 2px, transparent 8px)",
      border: "linear-gradient(135deg, rgba(96,165,250,0.6), rgba(59,130,246,0.3))",
      shadow: "0 8px 32px rgba(59,130,246,0.3)"
    },
  };

  const bgStyle = iconType ? backgrounds[iconType] : {
    base: "rgba(15,23,42,0.6)",
    glow: "none",
    pattern: "none",
    border: "rgba(51,65,85,0.8)",
    shadow: "none"
  };

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 16,
        background: bgStyle.base,
        border: `2px solid transparent`,
        backgroundImage: `${bgStyle.pattern}, ${bgStyle.glow}, ${bgStyle.base}`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box',
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: iconType ? bgStyle.shadow : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
        e.currentTarget.style.boxShadow = iconType ? `${bgStyle.shadow}, 0 20px 60px rgba(0,0,0,0.5)` : "0 12px 30px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = iconType ? bgStyle.shadow : "none";
      }}
    >
      {/* Animated gradient border */}
      {iconType && (
        <div style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: 16,
          background: bgStyle.border,
          zIndex: -1,
          animation: "rotate360 8s linear infinite",
          opacity: 0.6,
        }} />
      )}
      
      {/* Animated floating particles */}
      {iconType && (
        <>
          <div style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color || "#fff",
            top: "20%",
            left: "15%",
            opacity: 0.4,
            animation: "float 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: color || "#fff",
            top: "60%",
            right: "20%",
            opacity: 0.3,
            animation: "float 5s ease-in-out infinite 1s",
          }} />
          <div style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color || "#fff",
            bottom: "25%",
            left: "70%",
            opacity: 0.35,
            animation: "float 4.5s ease-in-out infinite 0.5s",
          }} />
        </>
      )}
      
      {/* Animated wave background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: iconType ? bgStyle.base : "none",
        opacity: 0.4,
        animation: "gradientMove 10s ease infinite",
        pointerEvents: "none",
      }} />
      
      {/* Diagonal shine sweep */}
      <div style={{
        position: "absolute",
        top: "-100%",
        left: "-100%",
        width: "300%",
        height: "300%",
        background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
        animation: "shimmer 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>{label}</div>
        {iconType && <StatIcon type={iconType} />}
      </div>
      <div style={{ 
        fontWeight: 700, 
        color: color || "#e5e7eb",
        fontSize: 15,
        position: "relative",
        zIndex: 1,
      }}>
        {value}
      </div>
    </div>
  );
};

// Custom Action Icons với hiệu ứng đẹp cho Nạp/Rút/Lịch sử
const ActionIcon: React.FC<{ type: 'deposit' | 'withdraw' | 'history' }> = ({ type }) => {
  const icons = {
    deposit: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="depositGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <filter id="depositGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ animation: 'float 3s ease-in-out infinite' }}>
          {/* Coin circle với gradient */}
          <circle cx="16" cy="16" r="11" 
                  fill="url(#depositGrad)" 
                  filter="url(#depositGlow)"
                  opacity="0.9"/>
          <circle cx="16" cy="16" r="11" 
                  stroke="#22c55e" 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.6">
            <animate attributeName="r" values="11;12;11" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          
          {/* Plus sign */}
          <path d="M16 10 L16 22 M10 16 L22 16" 
                stroke="#fff" 
                strokeWidth="3" 
                strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
          </path>
          
          {/* Sparkles */}
          <circle cx="9" cy="9" r="1.5" fill="#22c55e">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="23" cy="9" r="1.5" fill="#16a34a">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="23" cy="23" r="1.5" fill="#15803d">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="1s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    ),
    withdraw: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="withdrawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <filter id="withdrawGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>
          {/* Coin circle */}
          <circle cx="16" cy="16" r="11" 
                  fill="url(#withdrawGrad)" 
                  filter="url(#withdrawGlow)"
                  opacity="0.9"/>
          <circle cx="16" cy="16" r="11" 
                  stroke="#f59e0b" 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.6">
            <animate attributeName="r" values="11;12;11" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          
          {/* Down arrow với animated offset */}
          <g>
            <path d="M16 10 L16 22" 
                  stroke="#fff" 
                  strokeWidth="3" 
                  strokeLinecap="round"/>
            <path d="M12 18 L16 22 L20 18" 
                  stroke="#fff" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,-2; 0,0; 0,-2"
                dur="1.5s"
                repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Money symbols */}
          <text x="16" y="12" fontSize="6" fontWeight="bold" fill="#fff" textAnchor="middle" opacity="0.8">¥</text>
        </g>
      </svg>
    ),
    history: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="historyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="historyGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ animation: 'float 3s ease-in-out infinite 1s' }}>
          {/* Clock circle */}
          <circle cx="16" cy="16" r="11" 
                  fill="url(#historyGrad)" 
                  filter="url(#historyGlow)"
                  opacity="0.9"/>
          <circle cx="16" cy="16" r="11" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.6">
            <animate attributeName="r" values="11;12;11" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          
          {/* Clock hands - rotating */}
          <g style={{ transformOrigin: 'center', animation: 'rotate360 8s linear infinite' }}>
            {/* Hour hand */}
            <line x1="16" y1="16" x2="16" y2="11" 
                  stroke="#fff" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"/>
            {/* Minute hand */}
            <line x1="16" y1="16" x2="20" y2="16" 
                  stroke="#fff" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  opacity="0.8"/>
          </g>
          
          {/* Center dot */}
          <circle cx="16" cy="16" r="2" fill="#fff"/>
          
          {/* Clock markers */}
          <circle cx="16" cy="8" r="1" fill="#fff" opacity="0.6"/>
          <circle cx="24" cy="16" r="1" fill="#fff" opacity="0.6"/>
          <circle cx="16" cy="24" r="1" fill="#fff" opacity="0.6"/>
          <circle cx="8" cy="16" r="1" fill="#fff" opacity="0.6"/>
        </g>
      </svg>
    ),
  };
  return icons[type];
};

interface PrimaryIconButtonProps {
  label: string;
  iconType: 'deposit' | 'withdraw' | 'history';
  onClick?: () => void;
}

const PrimaryIconButton: React.FC<PrimaryIconButtonProps> = ({
  label,
  iconType,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "14px 10px",
      borderRadius: 16,
      background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
      border: "1px solid rgba(148,163,184,0.4)",
      color: "#e5e7eb",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.borderColor = "rgba(148,163,184,0.7)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = "rgba(148,163,184,0.4)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
    }}>
      <ActionIcon type={iconType} />
    </div>
    <span style={{ letterSpacing: "0.3px" }}>{label}</span>
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
