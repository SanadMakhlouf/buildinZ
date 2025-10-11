import React, { useState } from 'react';

const TestLoadingScreen = () => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', background: 'lightgray', margin: '2rem' }}>
      <h3>Test Loading Screen</h3>
      <button 
        onClick={() => setShow(!show)}
        style={{ padding: '1rem', fontSize: '1rem', background: 'blue', color: 'white', border: 'none' }}
      >
        {show ? 'Hide' : 'Show'} Loading Screen
      </button>
      
      {show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          color: 'white',
          fontSize: '2rem'
        }}>
          <div>
            <h2>TEST LOADING SCREEN</h2>
            <p>This should be visible!</p>
            <button 
              onClick={() => setShow(false)}
              style={{ padding: '1rem', background: 'red', color: 'white', border: 'none' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestLoadingScreen;
