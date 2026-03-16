import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text syne">FinVise<span className="logo-ai">AI</span></span>
        </div>
        <nav className="header-nav">
          <span className="nav-badge">NSE · BSE</span>
          <span className="nav-badge accent">LIVE DATA</span>
          <a
            href="https://github.com/yourusername/finvise-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
