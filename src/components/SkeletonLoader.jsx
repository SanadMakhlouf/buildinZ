import React, { useEffect } from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ isLoading, onComplete }) => {
  // Add a timer to automatically complete loading after a certain time
  useEffect(() => {
    if (isLoading) {
      // Automatically trigger completion after a timeout
      const timer = setTimeout(() => {
        onComplete && onComplete();
      }, 2000); // 2 seconds should be enough to show the skeleton
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);
  
  // If not loading, return null
  if (!isLoading) {
    return null;
  }

  return (
    <div className="skeleton-loader">
      {/* Hero Section Skeleton */}
      <div className="skeleton-hero">
        <div className="container">
          <div className="skeleton-hero-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-search-bar"></div>
            <div className="skeleton-buttons">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section Skeleton */}
      <div className="skeleton-section">
        <div className="container">
          <div className="skeleton-section-header">
            <div className="skeleton-title-small"></div>
            <div className="skeleton-text-small"></div>
          </div>
          <div className="skeleton-cards">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-card-icon"></div>
                <div className="skeleton-card-title"></div>
                <div className="skeleton-card-text"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="skeleton-section">
        <div className="container">
          <div className="skeleton-section-header">
            <div className="skeleton-title-small"></div>
            <div className="skeleton-text-small"></div>
          </div>
          <div className="skeleton-features">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-feature">
                <div className="skeleton-feature-icon"></div>
                <div className="skeleton-feature-title"></div>
                <div className="skeleton-feature-text"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section Skeleton */}
      <div className="skeleton-section">
        <div className="container">
          <div className="skeleton-section-header">
            <div className="skeleton-title-small"></div>
            <div className="skeleton-text-small"></div>
          </div>
          <div className="skeleton-testimonials">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-testimonial">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-testimonial-text"></div>
                <div className="skeleton-testimonial-name"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader; 