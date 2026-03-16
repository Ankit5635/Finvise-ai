import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Ticker from './components/Ticker';
import SearchBar from './components/SearchBar';
import Dashboard from './components/Dashboard';
import './App.css';

const API = process.env.REACT_APP_API_URL || '';

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);   // { stock, news, brief, job_id }
  const [videoStatus, setVideoStatus] = useState(null);

  const analyse = useCallback(async (ticker) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setVideoStatus({ status: 'pending' });

    try {
      const res = await fetch(`${API}/api/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, generate_video: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      pollVideo(data.job_id);
    } catch (e) {
      setError(e.message);
      setVideoStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const pollVideo = useCallback((jobId) => {
    const interval = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/api/video/${jobId}`);
        const data = await res.json();
        setVideoStatus(data);
        if (data.status === 'done' || data.status === 'error') {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);
  }, []);

  return (
    <div className="app">
      <Header />
      <Ticker />
      <main className="main">
        <SearchBar onSearch={analyse} loading={loading} />
        {error && (
          <div className="error-banner fade-up">
            <span>⚠️</span> {error}
          </div>
        )}
        {(loading || result) && (
          <Dashboard
            result={result}
            loading={loading}
            videoStatus={videoStatus}
            apiBase={API}
          />
        )}
        {!loading && !result && !error && <HeroHint />}
      </main>
      <footer className="footer">
        <p className="muted">
          FinVise AI · Built for the Indian market · Data via yfinance · 
          For educational purposes only — not investment advice.
        </p>
      </footer>
    </div>
  );
}

function HeroHint() {
  const stocks = ['RELIANCE','TCS','INFY','HDFC','WIPRO','BAJFINANCE','TATAMOTORS','ITC'];
  return (
    <div className="hero-hint fade-up">
      <div className="hero-icon">📊</div>
      <h2 className="syne">Search any NSE stock</h2>
      <p className="muted">
        Get real-time data, AI-generated analysis, and a 90-second video brief.
      </p>
      <div className="suggestion-chips">
        {stocks.map(s => (
          <span key={s} className="chip">{s}</span>
        ))}
      </div>
    </div>
  );
}
