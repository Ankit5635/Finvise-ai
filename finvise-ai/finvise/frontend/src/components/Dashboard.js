import React from 'react';
import StockCard from './StockCard';
import BriefCard from './BriefCard';
import NewsCard from './NewsCard';
import VideoPanel from './VideoPanel';
import SkeletonBlock from './SkeletonBlock';
import './Dashboard.css';

export default function Dashboard({ result, loading, videoStatus, apiBase }) {
  if (loading && !result) {
    return (
      <div className="dashboard fade-up">
        <SkeletonBlock />
      </div>
    );
  }
  if (!result) return null;
  const { stock, news, brief, job_id } = result;

  return (
    <div className="dashboard fade-up">
      {/* Row 1: Stock card + Video panel */}
      <div className="dash-row-top">
        <StockCard stock={stock} />
        <VideoPanel
          jobId={job_id}
          status={videoStatus}
          apiBase={apiBase}
        />
      </div>

      {/* Row 2: Brief sections */}
      <BriefCard brief={brief} />

      {/* Row 3: News */}
      <NewsCard news={news} />
    </div>
  );
}
