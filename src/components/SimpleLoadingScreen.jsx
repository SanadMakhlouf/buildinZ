import React from 'react';
import './LoadingScreen.css';

const SimpleLoadingScreen = ({ 
  isVisible = false, 
  message = "جاري التحميل...",
  onClose = null 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      {/* Animated Background */}
      <div className="loading-background">
        <div className="loading-gradient"></div>
        <div className="loading-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${i * 0.1}s`,
              '--duration': `${2 + Math.random() * 2}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`
            }}></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="loading-content">
        {/* Logo Container */}
        <div className="logo-container">
          <div className="logo-wrapper">
            <img 
              src="/logo.png" 
              alt="BuildingZ Logo" 
              className="loading-logo"
            />
            <div className="logo-glow"></div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="loading-message">
          <h2>{message}</h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="loading-decorations">
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>
        <div className="decoration decoration-4"></div>
      </div>
    </div>
  );
};

export default SimpleLoadingScreen;
