'use client';

import { useRef, useEffect } from 'react';
import { useAppSelector } from '@/store';

interface VideoGridProps {
  localRef: React.RefObject<HTMLVideoElement | null>;
  remoteRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoGrid({ localRef, remoteRef }: VideoGridProps) {
  const status = useAppSelector((s) => s.chat.status);
  const isVideoOff = useAppSelector((s) => s.user.isVideoOff);

  return (
    <div className="video-grid">
      {/* Remote video — full screen */}
      <div className="remote-video-wrap">
        {status === 'searching' && (
          <div className="status-overlay">
            <div className="search-spinner" />
            <p className="status-text animate-pulse-soft">Finding someone for you…</p>
          </div>
        )}
        {status === 'idle' && (
          <div className="status-overlay">
            <span style={{ fontSize: 56, marginBottom: 16 }}>👋</span>
            <p className="status-text">Press <strong>Start</strong> to find a stranger</p>
          </div>
        )}
        {status === 'disconnected' && (
          <div className="status-overlay">
            <span style={{ fontSize: 48, marginBottom: 16 }}>😔</span>
            <p className="status-text">Stranger disconnected</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>Click Next to find someone new</p>
          </div>
        )}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className={`remote-video ${['matched', 'connected'].includes(status) ? 'visible' : ''}`}
        />
      </div>

      {/* Local video — PiP corner */}
      <div className={`local-video-wrap ${isVideoOff ? 'video-off' : ''}`}>
        {isVideoOff ? (
          <div className="video-off-placeholder">
            <span style={{ fontSize: 28 }}>📷</span>
          </div>
        ) : (
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
        )}
        <div className="local-label">You</div>
      </div>

      <style jsx>{`
        .video-grid {
          position: relative;
          width: 100%;
          height: 100%;
          background: #080810;
          border-radius: 20px;
          overflow: hidden;
        }
        .remote-video-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0d0d1f, #12121f);
        }
        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .remote-video.visible { opacity: 1; }
        .status-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .status-text { font-size: 18px; color: rgba(255,255,255,0.7); font-weight: 500; }
        .search-spinner {
          width: 52px; height: 52px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin-bottom: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .local-video-wrap {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 160px;
          height: 120px;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          z-index: 5;
          background: #1a1a2e;
          transition: all 0.3s ease;
        }
        .local-video-wrap:hover { transform: scale(1.04); }
        .local-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .local-label {
          position: absolute;
          bottom: 6px;
          left: 8px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          background: rgba(0,0,0,0.4);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .video-off { background: #12121f; }
        .video-off-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
        }
        @media(max-width:768px){
          .local-video-wrap { width: 110px; height: 80px; bottom: 12px; right: 12px; }
        }
      `}</style>
    </div>
  );
}
