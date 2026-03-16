import React from 'react';
import './NewsCard.css';

export default function NewsCard({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="news-card card">
        <h3 className="syne nc-title">Latest News</h3>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          No news articles found for this stock.
        </p>
      </div>
    );
  }

  return (
    <div className="news-card card">
      <div className="nc-header">
        <h3 className="syne nc-title">Latest News</h3>
        <span className="nc-count muted">{news.length} articles</span>
      </div>
      <div className="nc-list">
        {news.map((article, i) => (
          <a
            key={i}
            href={article.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="nc-item"
          >
            <div className="nc-item-num mono">{String(i + 1).padStart(2, '0')}</div>
            <div className="nc-item-body">
              <p className="nc-item-title">{article.title}</p>
              {article.description && (
                <p className="nc-item-desc muted">{article.description.slice(0, 140)}{article.description.length > 140 ? '…' : ''}</p>
              )}
              <div className="nc-item-meta">
                <span className="nc-source">{article.source}</span>
                {article.published && (
                  <span className="muted nc-date">{article.published}</span>
                )}
              </div>
            </div>
            <span className="nc-arrow">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
