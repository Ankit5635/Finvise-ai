import React from 'react';
import './SkeletonBlock.css';

export default function SkeletonBlock() {
  return (
    <div className="skeleton-block">
      <div className="sk-row-top">
        <div className="sk-card">
          <div className="skeleton sk-h1" />
          <div className="skeleton sk-h2" />
          <div className="skeleton sk-price" />
          <div className="sk-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton sk-stat" />
            ))}
          </div>
        </div>
        <div className="sk-card">
          <div className="skeleton sk-h1" />
          <div className="skeleton sk-video" />
        </div>
      </div>
      <div className="sk-card">
        <div className="skeleton sk-h1" />
        <div className="skeleton sk-para" />
        <div className="skeleton sk-para" style={{ width: '80%' }} />
      </div>
    </div>
  );
}
