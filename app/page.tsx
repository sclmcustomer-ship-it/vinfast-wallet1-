'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/wallet');
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
          src="https://www.yadea.com.vn/wp-content/uploads/2023/09/logo-yadea.svg" 
          alt="Yadea" 
          style={{ 
            height: '60px', 
            marginBottom: '20px',
            filter: 'brightness(0) invert(1)'
          }} 
        />
        <div style={{ fontSize: '18px', marginTop: '20px' }}>Đang tải ví Yadea...</div>
      </div>
    </div>
  );
}