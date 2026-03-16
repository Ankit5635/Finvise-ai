import React from 'react';
import './Ticker.css';

const STOCKS = [
  { name:'RELIANCE', price:'2,934.50', chg:'+1.23%', up:true },
  { name:'TCS',      price:'4,102.00', chg:'-0.45%', up:false },
  { name:'INFY',     price:'1,789.25', chg:'+0.82%', up:true },
  { name:'HDFC',     price:'1,612.80', chg:'-0.21%', up:false },
  { name:'WIPRO',    price:'  489.60', chg:'+1.05%', up:true },
  { name:'ITC',      price:'  472.15', chg:'+0.34%', up:true },
  { name:'BAJFINANCE',price:'7,023.45',chg:'-0.67%', up:false },
  { name:'TATAMOTORS',price:'  971.30',chg:'+2.10%', up:true },
  { name:'SBIN',     price:'  841.90', chg:'+0.55%', up:true },
  { name:'NIFTY 50', price:'24,832.65',chg:'+0.38%', up:true },
  { name:'SENSEX',   price:'81,453.76',chg:'+0.42%', up:true },
];

export default function Ticker() {
  const items = [...STOCKS, ...STOCKS]; // duplicate for seamless loop
  return (
    <div className="ticker-wrap">
      <div className="ticker-label">MARKET</div>
      <div className="ticker-inner">
        <div className="ticker-track">
          {items.map((s, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-name">{s.name}</span>
              <span className="ticker-price">₹{s.price}</span>
              <span className={`ticker-chg ${s.up ? 'up' : 'down'}`}>{s.chg}</span>
              <span className="ticker-dot">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
