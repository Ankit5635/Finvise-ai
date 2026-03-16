import React from 'react';
import './VideoPanel.css';

export default function VideoPanel({ jobId, status, apiBase }) {
  const isPending    = !status || status.status === 'pending';
  const isProcessing = status?.status === 'processing';
  const isDone       = status?.status === 'done';
  const isError      = status?.status === 'error';

  const videoUrl  = isDone ? `${apiBase}${status.video_url}` : null;
  const downloadUrl = isDone ? `${apiBase}/api/video/${jobId}/download` : null;

  return (
    <div className="video-panel card">
      <div className="vp-header">
        <div>
          <h3 className="syne vp-title">90-Second Video Brief</h3>
          <p className="muted vp-sub">Auto-generated · TTS narration · Timed slides</p>
        </div>
        <span className="vp-badge">🎬 MP4</span>
      </div>

      <div className="vp-body">
        {/* Pending / Processing */}
        {(isPending || isProcessing) && (
          <div className="vp-loading">
            <div className="vp-spinner-wrap">
              <div className="vp-spinner" />
              <div className="vp-spinner-inner" />
            </div>
            <p className="vp-loading-title syne">
              {isPending ? 'Queued for generation…' : 'Generating your video…'}
            </p>
            <p className="muted vp-loading-sub">
              {isPending
                ? 'TTS narration + slide assembly in progress'
                : 'Creating voiceover and visual slides — this takes ~30 seconds'}
            </p>
            <div className="vp-steps">
              {[
                { label: 'AI Brief',        done: true  },
                { label: 'TTS Narration',   done: isProcessing },
                { label: 'Slide Assembly',  done: isProcessing },
                { label: 'MP4 Export',      done: false },
              ].map((step, i) => (
                <div key={i} className={`vp-step ${step.done ? 'done' : ''}`}>
                  <span className="vp-step-dot">{step.done ? '✓' : (isProcessing && i === 2 ? '…' : '○')}</span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {isDone && videoUrl && (
          <div className="vp-done">
            <video
              className="vp-player"
              controls
              src={videoUrl}
              poster=""
            >
              Your browser does not support video playback.
            </video>
            <div className="vp-actions">
              <a
                href={downloadUrl}
                download
                className="vp-btn vp-btn-primary"
              >
                ⬇ Download MP4
              </a>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vp-btn vp-btn-secondary"
              >
                ↗ Open in Tab
              </a>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="vp-error">
            <span className="vp-error-icon">⚠️</span>
            <p className="vp-error-title syne">Video generation failed</p>
            <p className="muted vp-error-detail">
              {status.error || 'An unknown error occurred. The brief above is still available.'}
            </p>
            <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Tip: Ensure ffmpeg is installed on the server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
