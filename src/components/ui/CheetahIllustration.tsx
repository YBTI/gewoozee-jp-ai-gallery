import React from 'react';

export default function CheetahIllustration() {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '-1rem' }}>
      <img 
        src="/cheetah.png" 
        alt="Polygon Cheetah" 
        className="animate-fade-in"
        style={{ width: '300px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }}
      />
    </div>
  );
}
