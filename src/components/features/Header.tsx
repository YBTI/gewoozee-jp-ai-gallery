import React from 'react';

export default function Header() {
  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          Gewoozee JP AI Gallery
        </h1>
        <nav>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
            <li><a href="#" className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Home</a></li>
            <li><a href="#" className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Browse</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
