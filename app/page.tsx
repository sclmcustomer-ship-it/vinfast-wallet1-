'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState({
    logo: "https://yadeaat-hcm.com/wp-content/uploads/2023/06/Logo_of_Yadea_3D_Banner.svg-1.png",
    name: "Yadea",
    appTitle: "Ví Yadea"
  });
  
  useEffect(() => {
    // Load brand config from localStorage
    const savedBrand = localStorage.getItem("App_Brand_Config");
    if (savedBrand) {
      try {
        setBrandConfig(JSON.parse(savedBrand));
      } catch (e) {
        console.error("Failed to load brand config:", e);
      }
    }
    
    // Redirect to wallet after a short delay
    const timer = setTimeout(() => {
      router.push('/wallet');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <img 
          src={brandConfig.logo}
          alt={`${brandConfig.name} Logo`}
          style={{ 
            height: '80px', 
            marginBottom: '20px',
            objectFit: 'contain'
          }} 
        />
        <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '20px' }}>
          Đang tải {brandConfig.appTitle}...
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
          Xe điện thông minh {brandConfig.name}
        </div>
      </div>
    </div>
  );
}