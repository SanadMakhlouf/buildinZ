import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('initializing');
  const [loadingText, setLoadingText] = useState('جاري التحضير...');

  const loadingPhases = [
    { phase: 'initializing', text: 'جاري التحضير...', duration: 1000 },
    { phase: 'loading-services', text: 'تحميل الخدمات...', duration: 800 },
    { phase: 'preparing-data', text: 'إعداد البيانات...', duration: 700 },
    { phase: 'finalizing', text: 'اللمسة الأخيرة...', duration: 500 },
    { phase: 'complete', text: 'مرحباً بك!', duration: 300 }
  ];

  useEffect(() => {
    if (!isLoading) return;

    let currentPhaseIndex = 0;
    let progressValue = 0;

    const updateProgress = () => {
      const phase = loadingPhases[currentPhaseIndex];
      const increment = 100 / loadingPhases.length;
      const target = (currentPhaseIndex + 1) * increment;
      
      setCurrentPhase(phase.phase);
      setLoadingText(phase.text);

      const progressInterval = setInterval(() => {
        progressValue += 2;
        if (progressValue >= target) {
          progressValue = target;
          clearInterval(progressInterval);
          
          if (currentPhaseIndex < loadingPhases.length - 1) {
            currentPhaseIndex++;
            setTimeout(updateProgress, 100);
          } else {
            setTimeout(() => {
              onComplete && onComplete();
            }, 800);
          }
        }
        setProgress(progressValue);
      }, 30);
    };

    updateProgress();
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <div className="loading-bg">
          <div className="bg-gradient"></div>
          <div className="bg-overlay"></div>
        </div>

        {/* Floating Particles */}
        <div className="particle-system">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className={`loading-particle particle-${i % 5}`}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                opacity: 0 
              }}
              animate={{ 
                x: Math.random() * window.innerWidth,
                y: -50,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                rotate: 360
              }}
              transition={{ 
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Morphing Shapes */}
        <div className="morphing-shapes">
          <motion.div 
            className="morph-shape shape-1"
            animate={{
              borderRadius: [
                "30% 70% 70% 30% / 30% 30% 70% 70%",
                "70% 30% 30% 70% / 70% 70% 30% 30%",
                "30% 70% 70% 30% / 30% 30% 70% 70%"
              ],
              rotate: [0, 120, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="morph-shape shape-2"
            animate={{
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "40% 60% 70% 30% / 30% 70% 40% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%"
              ],
              rotate: [360, 240, 0],
              scale: [1.2, 0.8, 1.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="morph-shape shape-3"
            animate={{
              borderRadius: [
                "50% 50% 50% 50% / 50% 50% 50% 50%",
                "30% 70% 40% 60% / 50% 30% 70% 50%",
                "50% 50% 50% 50% / 50% 50% 50% 50%"
              ],
              rotate: [0, -180, -360],
              x: [0, 30, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Main Loading Content */}
        <div className="loading-content">
          {/* Logo Animation */}
          <motion.div 
            className="loading-logo"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
          >
            <motion.div 
              className="logo-circle"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="logo-inner">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  BZ
                </motion.span>
              </div>
            </motion.div>
            
            {/* Orbital Rings */}
            <motion.div 
              className="orbital-ring ring-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="orbital-ring ring-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="orbital-ring ring-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Brand Name */}
          <motion.div 
            className="brand-name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.h1
              animate={{ 
                color: ["#0A3259", "#DAA520", "#0A3259"],
                textShadow: [
                  "0 0 20px rgba(218, 165, 32, 0.3)",
                  "0 0 40px rgba(218, 165, 32, 0.6)",
                  "0 0 20px rgba(218, 165, 32, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              BuildingZ
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              منصة الخدمات المنزلية والتجارية
            </motion.p>
          </motion.div>

          {/* Progress Section */}
          <motion.div 
            className="progress-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-track">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.div 
                  className="progress-glow"
                  animate={{ 
                    x: `${progress * 3}px`,
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    x: { duration: 0.3 },
                    opacity: { duration: 1.5, repeat: Infinity }
                  }}
                />
              </div>
              <div className="progress-percentage">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Loading Text */}
            <motion.div 
              className="loading-text"
              key={loadingText}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              {loadingText}
            </motion.div>

            {/* Phase Indicators */}
            <div className="phase-indicators">
              {loadingPhases.slice(0, -1).map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  className={`phase-dot ${currentPhase === phase.phase ? 'active' : ''} ${
                    loadingPhases.findIndex(p => p.phase === currentPhase) > index ? 'completed' : ''
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Loading Animation Elements */}
          <div className="loading-elements">
            <motion.div 
              className="rotating-element element-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="rotating-element element-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="rotating-element element-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Energy Pulses */}
        <div className="energy-pulses">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="energy-pulse"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 2, 4],
                opacity: [1, 0.5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Success Animation (when loading completes) */}
        {progress >= 100 && (
          <motion.div 
            className="success-overlay"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="success-checkmark"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <svg viewBox="0 0 50 50">
                <motion.path
                  d="M14 27l8 8 16-16"
                  fill="none"
                  stroke="#DAA520"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen; 