import React from 'react';

const PlaygroundPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Coming Soon</h1>
      <p style={{ fontSize: '1.5rem', color: '#555' }}>
        We are working hard to bring you something amazing. Stay tuned!
      </p>
    </div>
  );
};

export default PlaygroundPage;
