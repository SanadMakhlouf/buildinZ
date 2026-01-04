import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoadingDemo = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleShowLoading = (message) => {
    showLoading(message);
    
    // Auto-hide after 3 seconds for demo
    setTimeout(() => {
      hideLoading();
    }, 3000);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      background: 'white',
      borderRadius: '8px',
      margin: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3>Loading Screen Demo</h3>
      <p>Click the buttons below to see the beautiful loading screen in action:</p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button 
          onClick={() => handleShowLoading('جاري تحميل البيانات...')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#1B2632',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          تحميل البيانات
        </button>
        
        <button 
          onClick={() => handleShowLoading('جاري معالجة الطلب...')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#FFB162',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          معالجة الطلب
        </button>
        
        <button 
          onClick={() => handleShowLoading('جاري الاتصال بالخادم...')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          الاتصال بالخادم
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
        <p><strong>Features:</strong></p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>✨ Beautiful white logo with glow effect</li>
          <li>🎨 Animated background with floating particles</li>
          <li>⚡ Multiple spinning rings with different speeds</li>
          <li>📱 Fully responsive design</li>
          <li>🌙 Gradient background with brand colors</li>
          <li>💫 Smooth animations and transitions</li>
        </ul>
      </div>
    </div>
  );
};

export default LoadingDemo;
