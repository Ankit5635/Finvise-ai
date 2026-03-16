import React from 'react';
import './StockCard.css';

function fmt(n) {
  if (!n) return '—';
  if (n >= 1e12) return '₹' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '₹' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e7)  return '₹' + (n / 1e7).toFixed(2) + 'Cr';
  return '₹' + n.toLocaleString('en-IN');
}

function fmtVol(v) {
  if (!v) return '—';
  if (v >= 1e7) return (v / 1e7).toFixed(2) + 'Cr';
  if (v >= 1e5) return (v / 1e5).toFixed(2) + 'L';
  return v.toLocaleString('en-IN');
}

export default function StockCard({ stock }) {
  const up = stock.change_pct >= 0;

  // 52-week progress bar
  const range = stock.week_52_high - stock.week_52_low;
  const pos   = range > 0
    ? ((stock.price - stock.week_52_low) / range) * 100
    : 50;

  const rows = [
    { label: 'Open',       value: `₹${stock.open}` },
    { label: 'High',       value: `₹${stock.high}` },
    { label: 'Low',        value: `₹${stock.low}` },
    { label: 'Prev Close', value: `₹${stock.prev_close}` },
    { label: 'Volume',     value: fmtVol(stock.volume) },
    { label: 'Mkt Cap',    value: fmt(stock.market_cap) },
    { label: 'P/E Ratio',  value: stock.pe_ratio ? stock.pe_ratio.toFixed(2) : '—' },
    { label: 'Sector',     value: stock.sector || '—' },
  ];

  return (
    <div className="stock-card card">
      {/* Header */}
      <div className="sc-header">
        <div>
          <p className="sc-ticker mono">{stock.ticker}</p>
          <h2 className="sc-name syne">{stock.company_name}</h2>
        </div>
        <div className={`sc-badge ${up ? 'up-badge' : 'down-badge'}`}>
          {up ? '▲' : '▼'} NSE
        </div>
      </div>

      {/* Price */}
      <div className="sc-price-row">
        <span className="sc-price mono">₹{stock.price.toLocaleString('en-IN')}</span>
        <span className={`sc-change mono ${up ? 'up' : 'down'}`}>
          {up ? '+' : ''}{stock.change_pct}%
        </span>
      </div>
      <p className="sc-date muted">As of {stock.as_of}</p>

      {/* 52-week range */}
      <div className="sc-range">
        <div className="sc-range-labels">
          <span className="muted">52W Low</span>
          <span className="muted">52W High</span>
        </div>
        <div className="sc-range-bar">
          <div className="sc-range-fill" style={{ width: `${pos}%` }} />
          <div className="sc-range-thumb" style={{ left: `${pos}%` }} />
        </div>
        <div className="sc-range-labels">
          <span className="mono">₹{stock.week_52_low}</span>
          <span className="mono">₹{stock.week_52_high}</span>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="sc-grid">
        {rows.map(r => (
          <div key={r.label} className="sc-row">
            <span className="sc-row-label muted">{r.label}</span>
            <span className="sc-row-val mono">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
