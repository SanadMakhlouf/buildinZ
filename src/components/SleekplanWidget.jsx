import React, { useEffect } from 'react';

const SleekplanWidget = () => {
  useEffect(() => {
    // Initialize Sleekplan widget
    window.$sleek = [];
    window.SLEEK_PRODUCT_ID = 24089002;
    
    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://client.sleekplan.com/sdk/e.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Cleanup function to remove the script when component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.$sleek;
      delete window.SLEEK_PRODUCT_ID;
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default SleekplanWidget; 