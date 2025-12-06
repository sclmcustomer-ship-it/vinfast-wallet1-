'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserData {
  id: string;
  fullName: string;
  emailOrPhone: string;
  password?: string;
  balance: number;
  vipLevel: number;
  vipPoints: number;
  linkedBanks: BankCard[];
  kycStatus: string;
  isLocked: boolean;
  transactionHistory: Transaction[];
  createdAt: string;
  lastLogin: string;
}

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

interface TransactionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  amount: number;
  bankInfo?: string;
  date: string;
  status: string;
  createdAt: string;
}

type TabKey = "requests" | "users" | "transactions" | "banks" | "vip" | "settings";

export default function BankerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("requests");
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Gửi thông báo tùy chỉnh
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<UserData | null>(null);
  
  // Xác thực Banker
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const BANKER_PASSWORD = "123123ok@"; // Mật khẩu truy cập Banker

  // Load dữ liệu từ Supabase khi component mount
  useEffect(() => {
    const loadData = async () => {
      // ✅ Load users từ Supabase
      const { data: supabaseUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseUsers && !usersError) {
        // Convert từ database format sang app format
        const convertedUsers: UserData[] = supabaseUsers.map((u: any) => ({
          id: u.id,
          fullName: u.full_name,
          emailOrPhone: u.email_or_phone,
          password: u.password || undefined,
          balance: parseFloat(u.balance) || 0,
          vipLevel: u.vip_level || 0,
          vipPoints: 0, // Calculate from transaction history if needed
          linkedBanks: u.linked_banks || [],
          kycStatus: u.kyc_status || 'Chưa xác minh',
          isLocked: u.is_locked || false,
          transactionHistory: u.transaction_history || [],
          createdAt: u.created_at,
          lastLogin: u.last_login
        }));
        setUsers(convertedUsers);
      }
      
      // ✅ Load transaction requests từ Supabase
      const { data: supabaseRequests, error: requestsError } = await supabase
        .from('transaction_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseRequests && !requestsError) {
        const convertedRequests: TransactionRequest[] = supabaseRequests.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userEmail: '', // Not stored in DB
          type: r.type,
          amount: parseFloat(r.amount),
          bankInfo: r.bank_info,
          date: new Date(r.created_at).toLocaleString('vi-VN'),
          status: r.status,
          createdAt: r.created_at
        }));
        setRequests(convertedRequests);
      }
    };
    
    loadData();
    
    // Kiểm tra session đã đăng nhập
    const bankerAuth = sessionStorage.getItem("banker_authenticated");
    if (bankerAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Đồng bộ realtime từ Supabase (polling mỗi 2 giây)
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncData = async () => {
      // ✅ Đồng bộ users từ Supabase
      const { data: supabaseUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseUsers) {
        const convertedUsers: UserData[] = supabaseUsers.map((u: any) => ({
          id: u.id,
          fullName: u.full_name,
          emailOrPhone: u.email_or_phone,
          balance: parseFloat(u.balance) || 0,
          vipLevel: u.vip_level || 0,
          vipPoints: 0,
          linkedBanks: u.linked_banks || [],
          kycStatus: u.kyc_status || 'Chưa xác minh',
          isLocked: u.is_locked || false,
          transactionHistory: u.transaction_history || [],
          createdAt: u.created_at,
          lastLogin: u.last_login
        }));
        setUsers(convertedUsers);
      }

      // ✅ Đồng bộ transaction requests từ Supabase
      const { data: supabaseRequests } = await supabase
        .from('transaction_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseRequests) {
        const convertedRequests: TransactionRequest[] = supabaseRequests.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userEmail: '',
          type: r.type,
          amount: parseFloat(r.amount),
          bankInfo: r.bank_info,
          date: new Date(r.created_at).toLocaleString('vi-VN'),
          status: r.status,
          createdAt: r.created_at
        }));
        setRequests(convertedRequests);
      }
    };

    // Sync ngay lập tức
    syncData();

    // Polling mỗi 2 giây để đồng bộ realtime với Supabase
    const interval = setInterval(syncData, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated]); // ✅ CHỈ phụ thuộc vào isAuthenticated
  
  const handleLogin = () => {
    if (password === BANKER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("banker_authenticated", "true");
    } else {
      alert("Mật khẩu không đúng!");
      setPassword("");
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("banker_authenticated");
    setPassword("");
  };
  
  // ✅ BANKER TOÀN QUYỀN: Cộng/Trừ số dư trực tiếp
  const adjustUserBalance = async (userId: string, amount: number, note: string) => {
    // Lấy user hiện tại từ database
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!currentUser) {
      alert("❌ Không tìm thấy user!");
      return;
    }
    
    const newBalance = parseFloat(currentUser.balance) + amount;
    
    // Thêm vào lịch sử giao dịch
    const transaction = {
      id: `ADJ-${Date.now()}`,
      type: amount > 0 ? "Nạp tiền" : "Rút tiền",
      amount: Math.abs(amount),
      status: "Hoàn thành",
      date: new Date().toLocaleString('vi-VN'),
      note: `✅ BANKER: ${note}`,
      bankInfo: "Điều chỉnh bởi Banker"
    };
    
    const updatedHistory = [transaction, ...(currentUser.transaction_history || [])];
    
    // ✅ Cập nhật balance và transaction history trong Supabase
    await supabase
      .from('users')
      .update({ 
        balance: newBalance,
        transaction_history: updatedHistory
      })
      .eq('id', userId);
    
    // Cập nhật local state
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          balance: newBalance,
          transactionHistory: updatedHistory
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    
    alert(`✅ Đã ${amount > 0 ? 'cộng' : 'trừ'} ₫${Math.abs(amount).toLocaleString()} cho user!`);
  };
  
  // ❌ KHÔNG GHI ĐÈ localStorage tự động - chỉ khi Banker thao tác!

  // Nếu chưa xác thực, hiển thị form login
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 24,
            padding: "40px",
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img 
              src="https://vinfastauto-tphcm.com.vn/wp-content/uploads/Logo-VinFast.png" 
              alt="VinFast Logo" 
              style={{ height: 50, margin: "0 auto 16px" }} 
            />
            <h1 style={{ margin: 0, fontSize: 28, color: "#1e293b", marginBottom: 8 }}>
              🏦 Banker Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
              Vui lòng đăng nhập để truy cập
            </p>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block", 
              fontSize: 14, 
              fontWeight: 600, 
              color: "#475569", 
              marginBottom: 8 
            }}>
              Mật khẩu Banker
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Nhập mật khẩu..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid #e2e8f0",
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
          
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            🔐 Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.emailOrPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case "requests":
        return <RequestsTab 
          requests={requests}
          users={users}
          setUsers={setUsers}
          setRequests={setRequests}
        />;
      case "users":
        return <UsersTab 
          users={filteredUsers} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setIsEditing(true);
          }}
          onSendNotification={(user) => {
            setNotificationTarget(user);
            setShowNotificationModal(true);
          }}
          adjustUserBalance={adjustUserBalance}
        />;
      case "transactions":
        return <TransactionsTab users={users} />;
      case "banks":
        return <BanksTab users={users} />;
      case "vip":
        return <VipManagementTab users={users} setUsers={setUsers} />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img 
              src="https://vinfastauto-tphcm.com.vn/wp-content/uploads/Logo-VinFast.png" 
              alt="VinFast Logo" 
              style={{ height: 40 }} 
            />
            <div>
              <h1 style={{ margin: 0, fontSize: 24, color: "#1e293b" }}>
                Banker Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                Quản lý hệ thống ví VinFast
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Tổng người dùng</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
                {users.length}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontWeight: 600,
              }}
            >
              👤
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "2px solid #e2e8f0",
                background: "white",
                color: "#1e293b",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <TabButton
            label={`🔔 Yêu cầu (${requests.filter(r => r.status === "Chờ duyệt").length})`}
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
          />
          <TabButton
            label="👥 Quản lý người dùng"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <TabButton
            label="💳 Giao dịch"
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
          />
          <TabButton
            label="🏦 Thẻ ngân hàng"
            active={activeTab === "banks"}
            onClick={() => setActiveTab("banks")}
          />
          <TabButton
            label="💎 Quản lý VIP"
            active={activeTab === "vip"}
            onClick={() => setActiveTab("vip")}
          />
          <TabButton
            label="⚙️ Cài đặt"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {renderContent()}
      </div>

      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setIsEditing(false);
            setSelectedUser(null);
          }}
          onSave={async (updatedUser) => {
            // ✅ Cập nhật vào Supabase
            const { error } = await supabase
              .from('users')
              .update({
                full_name: updatedUser.fullName,
                email_or_phone: updatedUser.emailOrPhone,
                password: updatedUser.password || null,
                balance: updatedUser.balance,
                vip_level: updatedUser.vipLevel,
                kyc_status: updatedUser.kycStatus,
                is_locked: updatedUser.isLocked,
                linked_banks: updatedUser.linkedBanks,
                transaction_history: updatedUser.transactionHistory
              })
              .eq('id', updatedUser.id);
            
            if (error) {
              alert("❌ Lỗi khi cập nhật: " + error.message);
              return;
            }
            
            // Cập nhật local state
            const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
            setUsers(updatedUsers);
            setIsEditing(false);
            setSelectedUser(null);
            alert("✅ Đã cập nhật thông tin user thành công!");
          }}
        />
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && notificationTarget && (
        <SendNotificationModal
          user={notificationTarget}
          onClose={() => {
            setShowNotificationModal(false);
            setNotificationTarget(null);
          }}
        />
      )}
    </div>
  );
}

// Tab Button Component
const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      padding: "12px 20px",
      borderRadius: 8,
      border: "none",
      background: active
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "transparent",
      color: active ? "white" : "#64748b",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.3s",
    }}
  >
    {label}
  </button>
);

// Helper function: Gửi thông báo đến user
const sendNotificationToUser = async (
  userId: string, 
  notification: { title: string; message: string; type: "success" | "warning" | "info" | "error" }
) => {
  // ✅ Lấy user hiện tại từ Supabase
  const { data: currentUser } = await supabase
    .from('users')
    .select('notifications')
    .eq('id', userId)
    .single();
  
  if (!currentUser) return;
  
  const newNotification = {
    id: `NOTIF-${Date.now()}`,
    userId: userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: new Date().toLocaleString('vi-VN'),
    read: false
  };
  
  const updatedNotifications = [...(currentUser.notifications || []), newNotification];
  
  // ✅ Cập nhật notifications trong Supabase
  await supabase
    .from('users')
    .update({ notifications: updatedNotifications })
    .eq('id', userId);
};

// Requests Tab Component
const RequestsTab: React.FC<{
  requests: TransactionRequest[];
  users: UserData[];
  setUsers: (users: UserData[]) => void;
  setRequests: (requests: TransactionRequest[]) => void;
}> = ({ requests, users, setUsers, setRequests }) => {
  
  const handleApprove = async (request: TransactionRequest) => {
    if (!confirm(`Xác nhận DUYỆT ${request.type} ₫${request.amount.toLocaleString()} cho ${request.userName}?`)) {
      return;
    }
    
    // ✅ Cập nhật status trong Supabase
    await supabase
      .from('transaction_requests')
      .update({ status: "Đã duyệt" })
      .eq('id', request.id);
    
    const updatedRequests = requests.map(r => 
      r.id === request.id ? { ...r, status: "Đã duyệt" } : r
    );
    setRequests(updatedRequests);
    
    // Nếu là NẠP TIỀN → Cộng tiền vào ví user
    if (request.type === "Nạp tiền") {
      // Lấy user hiện tại từ database
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single();
      
      if (currentUser) {
        const newBalance = parseFloat(currentUser.balance) + request.amount;
        const newTransaction = {
          id: request.id,
          type: "Nạp tiền",
          amount: request.amount,
          date: new Date().toLocaleString('vi-VN'),
          status: "Thành công"
        };
        
        const updatedHistory = [newTransaction, ...(currentUser.transaction_history || [])];
        
        // ✅ Cập nhật balance và transaction history trong Supabase
        await supabase
          .from('users')
          .update({ 
            balance: newBalance,
            transaction_history: updatedHistory
          })
          .eq('id', request.userId);
        
        // Cập nhật local state
        const updatedUsers = users.map(u => {
          if (u.id === request.userId) {
            return {
              ...u,
              balance: newBalance,
              transactionHistory: updatedHistory
            };
          }
          return u;
        });
        setUsers(updatedUsers);
        
        // GỬI THÔNG BÁO
        sendNotificationToUser(request.userId, {
          title: "✅ Nạp tiền thành công",
          message: `Đã nạp ₫${request.amount.toLocaleString()} vào ví của bạn.`,
          type: "success"
        });
        
        alert(`Đã duyệt nạp tiền. ₫${request.amount.toLocaleString()} đã được cộng vào ví ${request.userName}.`);
      }
    }
    // Nếu là RÚT TIỀN → Tiền đã bị trừ trước đó, chỉ cập nhật status
    else if (request.type === "Rút tiền") {
      // Lấy user hiện tại từ database
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single();
      
      if (currentUser) {
        const updatedHistory = (currentUser.transaction_history || []).map((tx: any) =>
          tx.id === request.id ? { ...tx, status: "Thành công" } : tx
        );
        
        // ✅ Cập nhật transaction history trong Supabase
        await supabase
          .from('users')
          .update({ transaction_history: updatedHistory })
          .eq('id', request.userId);
        
        // Cập nhật local state
        const updatedUsers = users.map(u => {
          if (u.id === request.userId) {
            return {
              ...u,
              transactionHistory: updatedHistory
            };
          }
          return u;
        });
        setUsers(updatedUsers);
        
        // GỬI THÔNG BÁO
        sendNotificationToUser(request.userId, {
          title: "✅ Rút tiền thành công",
          message: `Đã chuyển ₫${request.amount.toLocaleString()} đến ${request.bankInfo}.`,
          type: "success"
        });
        
        alert(`Đã duyệt rút tiền. Vui lòng chuyển ₫${request.amount.toLocaleString()} đến ${request.bankInfo}.`);
      }
    }
  };
  
  const handleReject = async (request: TransactionRequest) => {
    const reason = prompt(`Lý do TỪ CHỐI ${request.type} của ${request.userName}:`);
    if (!reason) return;
    
    // ✅ Cập nhật status trong Supabase
    await supabase
      .from('transaction_requests')
      .update({ status: `Từ chối: ${reason}` })
      .eq('id', request.id);
    
    const updatedRequests = requests.map(r => 
      r.id === request.id ? { ...r, status: `Từ chối: ${reason}` } : r
    );
    setRequests(updatedRequests);
    
    // Nếu là RÚT TIỀN → HOÀN TIỀN lại cho user
    if (request.type === "Rút tiền") {
      // Lấy user hiện tại từ database
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single();
      
      if (currentUser) {
        const newBalance = parseFloat(currentUser.balance) + request.amount; // HOÀN LẠI TIỀN
        const updatedHistory = (currentUser.transaction_history || []).map((tx: any) =>
          tx.id === request.id ? { ...tx, status: `Từ chối: ${reason}` } : tx
        );
        
        // ✅ Cập nhật balance và transaction history trong Supabase
        await supabase
          .from('users')
          .update({ 
            balance: newBalance,
            transaction_history: updatedHistory
          })
          .eq('id', request.userId);
        
        // Cập nhật local state
        const updatedUsers = users.map(u => {
          if (u.id === request.userId) {
            return {
              ...u,
              balance: newBalance,
              transactionHistory: updatedHistory
            };
          }
          return u;
        });
        setUsers(updatedUsers);
        
        // GỬI THÔNG BÁO
        sendNotificationToUser(request.userId, {
          title: "⚠️ Rút tiền bị từ chối",
          message: `Lý do: ${reason}. Đã hoàn ₫${request.amount.toLocaleString()} về ví.`,
          type: "warning"
        });
        
        alert(`Đã từ chối và HOÀN ₫${request.amount.toLocaleString()} về ví ${request.userName}.`);
      }
    } else {
      // GỬI THÔNG BÁO
      sendNotificationToUser(request.userId, {
        title: "❌ Nạp tiền bị từ chối",
        message: `Lý do: ${reason}.`,
        type: "error"
      });
      
      alert(`Đã từ chối yêu cầu nạp tiền của ${request.userName}.`);
    }
  };
  
  const pendingRequests = requests.filter(r => r.status === "Chờ duyệt");
  const processedRequests = requests.filter(r => r.status !== "Chờ duyệt");
  
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ 
              background: "#ef4444", 
              color: "white", 
              padding: "2px 8px", 
              borderRadius: 999, 
              fontSize: 12, 
              fontWeight: 700 
            }}>
              {pendingRequests.length}
            </span>
            Yêu cầu chờ duyệt
          </h3>
          
          <div style={{ display: "grid", gap: 12 }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "2px solid #fbbf24",
                  background: "#fffbeb",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                      {req.type === "Nạp tiền" ? "⬇️" : "⬆️"} {req.type}
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      👤 {req.userName} ({req.userEmail})
                    </div>
                    {req.bankInfo && (
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                        🏦 {req.bankInfo}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: req.type === "Nạp tiền" ? "#16a34a" : "#ea580c" }}>
                      {req.type === "Nạp tiền" ? "+" : "-"}₫{req.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{req.date}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleReject(req)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "2px solid #ef4444",
                      background: "white",
                      color: "#ef4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ❌ Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(req)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ✅ Duyệt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Processed Requests */}
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b" }}>
          Lịch sử xử lý ({processedRequests.length})
        </h3>
        
        {processedRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            Chưa có yêu cầu nào được xử lý
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {processedRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {req.type} - {req.userName}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{req.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: req.type === "Nạp tiền" ? "#16a34a" : "#ea580c" }}>
                    {req.type === "Nạp tiền" ? "+" : "-"}₫{req.amount.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: req.status === "Đã duyệt" ? "#16a34a" : "#ef4444",
                    }}
                  >
                    {req.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC<{
  users: UserData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectUser: (user: UserData) => void;
  onSendNotification: (user: UserData) => void;
  adjustUserBalance: (userId: string, amount: number, note: string) => void;
}> = ({ users, searchQuery, setSearchQuery, onSelectUser, onSendNotification, adjustUserBalance }) => {
  return (
    <div>
      {/* Search Bar */}
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, email/phone, hoặc ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "2px solid #e2e8f0",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      {/* Users List */}
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b" }}>
          Danh sách người dùng ({users.length})
        </h3>
        
        {users.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            Chưa có người dùng nào. Người dùng sẽ xuất hiện khi họ đăng ký tài khoản.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "2px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#667eea";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>

                {/* User Info */}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>
                    📧 {user.emailOrPhone} • ID: {user.id}
                  </div>
                  {user.password && (
                    <div style={{ fontSize: 12, color: "#b45309", marginBottom: 2, fontFamily: "monospace", background: "#fef3c7", padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>
                      🔑 {user.password}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    💰 Số dư: ₫{user.balance.toLocaleString()} • 
                    💎 VIP Level {user.vipLevel} ({user.vipPoints.toLocaleString()} điểm)
                  </div>
                  {/* Bank Cards Preview */}
                  {user.linkedBanks && user.linkedBanks.length > 0 && (
                    <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      <span>🏦</span>
                      {user.linkedBanks.slice(0, 2).map((bank, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: bank.isDefault ? "#dbeafe" : "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontFamily: "monospace",
                            fontSize: 10,
                          }}
                        >
                          {bank.displayName}
                        </span>
                      ))}
                      {user.linkedBanks.length > 2 && (
                        <span style={{ fontSize: 10 }}>
                          +{user.linkedBanks.length - 2} thẻ khác
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Badge & Actions */}
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: user.kycStatus === "Đã xác minh" ? "#dcfce7" : "#fed7aa",
                      color: user.kycStatus === "Đã xác minh" ? "#16a34a" : "#ea580c",
                    }}
                  >
                    {user.kycStatus}
                  </div>
                  {user.isLocked && (
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: "#fee2e2",
                        color: "#dc2626",
                      }}
                    >
                      🔒 Đã khóa
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Đăng nhập: {user.lastLogin}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const amount = prompt("💰 Nhập số tiền muốn CỘNG (VD: 100000):");
                        if (amount && !isNaN(Number(amount))) {
                          const note = prompt("📝 Lý do cộng tiền:") || "Điều chỉnh số dư";
                          adjustUserBalance(user.id, Math.abs(Number(amount)), note);
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      title="Cộng tiền vào tài khoản"
                    >
                      ➕ Cộng
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const amount = prompt("💰 Nhập số tiền muốn TRỪ (VD: 50000):");
                        if (amount && !isNaN(Number(amount))) {
                          const note = prompt("📝 Lý do trừ tiền:") || "Điều chỉnh số dư";
                          adjustUserBalance(user.id, -Math.abs(Number(amount)), note);
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      title="Trừ tiền khỏi tài khoản"
                    >
                      ➖ Trừ
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendNotification(user);
                    }}
                    style={{
                      padding: "6px 12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📬 Gửi thông báo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: UserData;
  onClose: () => void;
  onSave: (user: UserData) => void;
}> = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState<UserData>({ ...user });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 22, color: "#1e293b" }}>
          Chỉnh sửa thông tin người dùng
        </h2>

        <div style={{ display: "grid", gap: 16 }}>
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Họ và tên
            </label>
            <input
              type="text"
              value={editedUser.fullName}
              onChange={(e) => setEditedUser({ ...editedUser, fullName: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </div>

          {/* Email/Phone */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Email/Số điện thoại
            </label>
            <input
              type="text"
              value={editedUser.emailOrPhone}
              onChange={(e) => setEditedUser({ ...editedUser, emailOrPhone: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              🔑 Mật khẩu
            </label>
            <input
              type="text"
              value={editedUser.password || ""}
              onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
              placeholder="Chưa có mật khẩu"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
                fontFamily: "monospace",
                backgroundColor: editedUser.password ? "#fef3c7" : "#f8fafc",
              }}
            />
            {editedUser.password && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🔓</span>
                <span>Banker có thể xem và chỉnh sửa mật khẩu của người dùng</span>
              </div>
            )}
          </div>

          {/* Balance */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Số dư (₫)
            </label>
            <input
              type="number"
              value={editedUser.balance}
              onChange={(e) => setEditedUser({ ...editedUser, balance: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </div>

          {/* VIP Level */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                VIP Level (0-8)
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={editedUser.vipLevel}
                onChange={(e) => setEditedUser({ ...editedUser, vipLevel: Math.min(8, Math.max(0, parseInt(e.target.value) || 0)) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "2px solid #e2e8f0",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Điểm VIP
              </label>
              <input
                type="number"
                value={editedUser.vipPoints}
                onChange={(e) => setEditedUser({ ...editedUser, vipPoints: parseFloat(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "2px solid #e2e8f0",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* KYC Status */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Trạng thái KYC
            </label>
            <select
              value={editedUser.kycStatus}
              onChange={(e) => setEditedUser({ ...editedUser, kycStatus: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            >
              <option value="Chưa xác minh">Chưa xác minh</option>
              <option value="Đang xác minh">Đang xác minh</option>
              <option value="Đã xác minh">Đã xác minh</option>
            </select>
          </div>

          {/* Account Lock Status */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              🔒 Trạng thái tài khoản
            </label>
            <select
              value={editedUser.isLocked ? "locked" : "active"}
              onChange={(e) => setEditedUser({ ...editedUser, isLocked: e.target.value === "locked" })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "2px solid #e2e8f0",
                fontSize: 14,
                background: editedUser.isLocked ? "#fee2e2" : "#f0fdf4",
                color: editedUser.isLocked ? "#dc2626" : "#16a34a",
                fontWeight: 600,
              }}
            >
              <option value="active" style={{ background: "white", color: "#16a34a" }}>✅ Hoạt động bình thường</option>
              <option value="locked" style={{ background: "white", color: "#dc2626" }}>🔒 Đã khóa (không thể rút/nạp)</option>
            </select>
          </div>

          {/* Linked Bank Cards */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>
              🏦 Thẻ ngân hàng đã liên kết ({editedUser.linkedBanks?.length || 0})
            </label>
            {editedUser.linkedBanks && editedUser.linkedBanks.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                {editedUser.linkedBanks.map((bank, index) => (
                  <div
                    key={bank.id || index}
                    style={{
                      padding: "12px",
                      borderRadius: 8,
                      border: "2px solid #e2e8f0",
                      background: bank.isDefault ? "#eff6ff" : "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
                        {bank.displayName}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                        {bank.value}
                      </div>
                    </div>
                    {bank.isDefault && (
                      <div
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "#3b82f6",
                          color: "white",
                        }}
                      >
                        ⭐ Mặc định
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  borderRadius: 8,
                  border: "2px dashed #e2e8f0",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                Chưa liên kết thẻ ngân hàng nào
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "2px solid #e2e8f0",
              background: "white",
              color: "#64748b",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(editedUser)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

// Banks Tab Component
const BanksTab: React.FC<{ users: UserData[] }> = ({ users }) => {
  const usersWithBanks = users.filter(u => u.linkedBanks && u.linkedBanks.length > 0);
  const totalBankCards = users.reduce((sum, u) => sum + (u.linkedBanks?.length || 0), 0);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
          🏦 Thẻ ngân hàng khách hàng
        </h3>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Tổng số thẻ</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{totalBankCards}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Khách hàng có thẻ</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>{usersWithBanks.length}</div>
          </div>
        </div>
      </div>
      
      {usersWithBanks.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          Chưa có khách hàng nào liên kết thẻ ngân hàng
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {usersWithBanks.map((user) => (
            <div
              key={user.id}
              style={{
                padding: 16,
                borderRadius: 10,
                border: "2px solid #e2e8f0",
                background: "#fafafa",
              }}
            >
              {/* User Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {user.emailOrPhone} • {user.linkedBanks?.length || 0} thẻ
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
                  ₫{user.balance.toLocaleString()}
                </div>
              </div>

              {/* Bank Cards */}
              <div style={{ display: "grid", gap: 8 }}>
                {user.linkedBanks?.map((bank, index) => (
                  <div
                    key={bank.id || index}
                    style={{
                      padding: "12px",
                      borderRadius: 8,
                      border: "2px solid #e2e8f0",
                      background: bank.isDefault ? "#eff6ff" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        {bank.displayName}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                        {bank.value}
                      </div>
                    </div>
                    {bank.isDefault && (
                      <div
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "#3b82f6",
                          color: "white",
                        }}
                      >
                        ⭐ Mặc định
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab: React.FC<{ users: UserData[] }> = ({ users }) => {
  const allTransactions = users.flatMap(user => 
    user.transactionHistory.map(tx => ({ ...tx, userName: user.fullName, userId: user.id }))
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b" }}>
        Lịch sử giao dịch ({allTransactions.length})
      </h3>
      
      {allTransactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          Chưa có giao dịch nào
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {allTransactions.map((tx) => (
            <div
              key={`${tx.userId}-${tx.id}`}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 12,
                alignItems: "center",
                fontSize: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: tx.type === "Nạp tiền" ? "#dcfce7" : "#fef3c7",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                }}
              >
                {tx.type === "Nạp tiền" ? "⬇️" : "⬆️"}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{tx.userName}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{tx.type} • {tx.date}</div>
              </div>
              <div style={{ fontWeight: 700, color: tx.type === "Nạp tiền" ? "#16a34a" : "#ea580c" }}>
                {tx.type === "Nạp tiền" ? "+" : "-"}₫{tx.amount.toLocaleString()}
              </div>
              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: tx.status === "Thành công" ? "#dcfce7" : "#fef3c7",
                  color: tx.status === "Thành công" ? "#16a34a" : "#ca8a04",
                }}
              >
                {tx.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// VIP Management Tab Component
const VipManagementTab: React.FC<{ users: UserData[]; setUsers: (users: UserData[]) => void }> = ({ users, setUsers }) => {
  const vipLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const usersByLevel = vipLevels.map(level => ({
    level,
    count: users.filter(u => u.vipLevel === level).length,
    users: users.filter(u => u.vipLevel === level),
  }));

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b" }}>
        Phân bổ VIP Level
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {usersByLevel.map(({ level, count }) => (
          <div
            key={level}
            style={{
              padding: 16,
              borderRadius: 10,
              border: "2px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>💎</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
              VIP Level {level}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#667eea" }}>
              {count}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>người dùng</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Send Notification Modal Component
const SendNotificationModal: React.FC<{
  user: UserData;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifType, setNotifType] = useState<"info" | "success" | "warning" | "error">("info");

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }

    sendNotificationToUser(user.id, {
      title: title.trim(),
      message: message.trim(),
      type: notifType
    });

    alert(`✅ Đã gửi thông báo đến ${user.fullName}`);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 30,
          width: "90%",
          maxWidth: 500,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: 22, color: "#1e293b" }}>
          📬 Gửi thông báo đến {user.fullName}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#475569" }}>
            Loại thông báo:
          </label>
          <select
            value={notifType}
            onChange={(e) => setNotifType(e.target.value as any)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "2px solid #e2e8f0",
              fontSize: 14,
            }}
          >
            <option value="info">ℹ️ Thông tin</option>
            <option value="success">✅ Thành công</option>
            <option value="warning">⚠️ Cảnh báo</option>
            <option value="error">❌ Lỗi</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#475569" }}>
            Tiêu đề:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "2px solid #e2e8f0",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#475569" }}>
            Nội dung:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            rows={5}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "2px solid #e2e8f0",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleSend}
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📤 Gửi thông báo
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              background: "#e2e8f0",
              color: "#475569",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b" }}>
        Cài đặt hệ thống
      </h3>
      <p style={{ color: "#64748b" }}>
        Các tính năng cài đặt sẽ được phát triển thêm...
      </p>
    </div>
  );
};
