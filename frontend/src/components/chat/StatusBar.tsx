'use client';

import { useAppSelector } from '@/store';

const STATUS_MAP: Record<string, { text: string; color: string; dot: string }> = {
  idle:         { text: 'Ready to connect', color: 'rgba(255,255,255,0.4)', dot: '#6b7280' },
  searching:    { text: 'Searching…',       color: '#a5b4fc',               dot: '#6366f1' },
  matched:      { text: 'Matched! Connecting…', color: '#86efac',           dot: '#22c55e' },
  connected:    { text: 'Connected',        color: '#86efac',               dot: '#22c55e' },
  disconnected: { text: 'Stranger left',    color: '#fca5a5',               dot: '#ef4444' },
  error:        { text: 'Connection error', color: '#fca5a5',               dot: '#ef4444' },
};

export default function StatusBar() {
  const status = useAppSelector((s) => s.chat.status);
  const skipCount = useAppSelector((s) => s.chat.skipCount);
  const sessionStart = useAppSelector((s) => s.chat.sessionStartedAt);
  const username = useAppSelector((s) => s.auth.user?.username);

  const info = STATUS_MAP[status] ?? STATUS_MAP.idle;

  const elapsed = sessionStart
    ? Math.floor((Date.now() - sessionStart) / 1000)
    : null;

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="status-bar glass">
      <div className="status-left">
        <span className="status-dot" style={{ background: info.dot }} />
        <span className="status-text" style={{ color: info.color }}>{info.text}</span>
      </div>

      <div className="status-right">
        {elapsed !== null && status === 'connected' && (
          <span className="stat-chip">⏱ {fmtTime(elapsed)}</span>
        )}
        <span className="stat-chip">⏭ {skipCount} skips</span>
        {username && (
          <span className="stat-chip user-chip">👤 {username}</span>
        )}
      </div>

      <style jsx>{`
        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .status-left { display: flex; align-items: center; gap: 8px; }
        .status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          transition: background 0.3s;
          animation: pulse-soft 2s infinite;
        }
        .status-text { font-size: 13px; font-weight: 600; }
        .status-right { display: flex; align-items: center; gap: 8px; }
        .stat-chip {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          padding: 3px 10px;
        }
        .user-chip { color: rgba(165,180,252,0.7); }
        @media(max-width:500px){ .status-right { display: none; } }
      `}</style>
    </div>
  );
}
