import React, { useState } from 'react';
import './BriefCard.css';

const SECTIONS = [
  {
    key:     'hook',
    label:   'HOOK',
    time:    '0 – 10 sec',
    icon:    '🎣',
    color:   '#FF6B35',
    desc:    'Opening attention-grabber',
  },
  {
    key:     'stock_snapshot',
    label:   'STOCK SNAPSHOT',
    time:    '10 – 30 sec',
    icon:    '📊',
    color:   '#4ECDC4',
    desc:    'Price movement & 52-week context',
  },
  {
    key:     'whats_happening',
    label:   "WHAT'S HAPPENING",
    time:    '30 – 60 sec',
    icon:    '📰',
    color:   '#58A6FF',
    desc:    'Key news events explained simply',
  },
  {
    key:     'beginner_takeaway',
    label:   'BEGINNER TAKEAWAY',
    time:    '60 – 80 sec',
    icon:    '💡',
    color:   '#96CEB4',
    desc:    'What this means for new investors',
  },
  {
    key:     'call_to_action',
    label:   'CALL TO ACTION',
    time:    '80 – 90 sec',
    icon:    '📢',
    color:   '#D29922',
    desc:    'Neutral educational closing',
  },
];

export default function BriefCard({ brief }) {
  const [active, setActive] = useState('hook');

  return (
    <div className="brief-card card">
      <div className="bc-header">
        <div>
          <h3 className="syne bc-title">AI Video Brief Script</h3>
          <p className="muted bc-sub">90-second structured script — ready to read aloud</p>
        </div>
        <span className="bc-badge">⚡ AI Generated</span>
      </div>

      <div className="bc-body">
        {/* Sidebar tabs */}
        <nav className="bc-tabs">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`bc-tab ${active === s.key ? 'active' : ''}`}
              onClick={() => setActive(s.key)}
              style={{ '--tab-color': s.color }}
            >
              <span className="bc-tab-icon">{s.icon}</span>
              <span className="bc-tab-info">
                <span className="bc-tab-label">{s.label}</span>
                <span className="bc-tab-time">{s.time}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="bc-panel">
          {SECTIONS.map(s => (
            <div
              key={s.key}
              className={`bc-content ${active === s.key ? 'visible' : ''}`}
            >
              <div className="bc-content-header" style={{ '--tab-color': s.color }}>
                <span className="bc-content-icon">{s.icon}</span>
                <div>
                  <h4 className="bc-content-title syne">{s.label}</h4>
                  <p className="bc-content-desc muted">{s.desc}</p>
                </div>
                <span className="bc-content-time mono">{s.time}</span>
              </div>
              <blockquote className="bc-quote">
                {brief[s.key] || '—'}
              </blockquote>
              <div className="bc-word-count muted">
                {brief[s.key]
                  ? `${brief[s.key].split(/\s+/).length} words · ~${Math.round(brief[s.key].split(/\s+/).length / 2.5)}s`
                  : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
