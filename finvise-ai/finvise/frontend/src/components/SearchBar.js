import React, { useState, useRef } from 'react';
import './SearchBar.css';

const POPULAR = ['RELIANCE','TCS','INFY','HDFC','WIPRO','BAJFINANCE','TATAMOTORS','ITC','SBIN','HCLTECH'];

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = (val) => {
    const t = (val || value).trim();
    if (!t) return;
    setValue(t.toUpperCase());
    onSearch(t);
  };

  return (
    <div className="search-section">
      <h1 className="search-headline syne">
        Indian Stock<br />
        <span className="headline-accent">Intelligence</span>
      </h1>
      <p className="search-sub muted">
        Enter any NSE ticker to get AI-powered analysis + a 90-second video brief
      </p>
      <form
        className="search-form"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input mono"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder="e.g. RELIANCE, TCS, INFY…"
            disabled={loading}
            autoComplete="off"
            autoFocus
          />
          {value && (
            <button
              type="button"
              className="search-clear"
              onClick={() => { setValue(''); inputRef.current?.focus(); }}
            >×</button>
          )}
        </div>
        <button
          type="submit"
          className={`search-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !value}
        >
          {loading ? (
            <span className="btn-spinner" />
          ) : (
            <>Analyse <span className="btn-arrow">→</span></>
          )}
        </button>
      </form>
      <div className="popular-row">
        <span className="popular-label muted">Popular:</span>
        {POPULAR.map(s => (
          <button
            key={s}
            className="popular-btn"
            onClick={() => submit(s)}
            disabled={loading}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}
