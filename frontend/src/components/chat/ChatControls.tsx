'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { toggleMute, toggleVideo } from '@/store/userSlice';

interface ControlsProps {
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export default function ChatControls({
  onStart,
  onNext,
  onStop,
  onToggleChat,
  isChatOpen,
}: ControlsProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.chat.status);
  const isMuted = useAppSelector((s) => s.user.isMuted);
  const isVideoOff = useAppSelector((s) => s.user.isVideoOff);
  const messages = useAppSelector((s) => s.chat.messages);
  const unread = messages.filter((m) => m.from === 'stranger').length;

  const isIdle = status === 'idle';
  const isSearching = status === 'searching';
  const isActive = ['matched', 'connected', 'disconnected'].includes(status);

  return (
    <div className="controls-bar glass">
      {/* Left — mute/video */}
      <div className="controls-left">
        <button
          id="ctrl-mute"
          className={`ctrl-btn ${isMuted ? 'active-red' : ''}`}
          onClick={() => dispatch(toggleMute())}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎙️'}
        </button>
        <button
          id="ctrl-video"
          className={`ctrl-btn ${isVideoOff ? 'active-red' : ''}`}
          onClick={() => dispatch(toggleVideo())}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>
      </div>

      {/* Center — main action */}
      <div className="controls-center">
        {isIdle && (
          <button id="ctrl-start" className="btn-primary ctrl-main" onClick={onStart}>
            🎲 Start
          </button>
        )}
        {isSearching && (
          <button className="ctrl-main ctrl-searching" disabled>
            <span className="spin-sm" /> Searching…
          </button>
        )}
        {isActive && (
          <>
            <button id="ctrl-next" className="ctrl-main ctrl-next" onClick={onNext}>
              ⏭ Next
            </button>
            <button id="ctrl-stop" className="ctrl-main ctrl-stop" onClick={onStop}>
              ✕ Stop
            </button>
          </>
        )}
      </div>

      {/* Right — chat toggle */}
      <div className="controls-right">
        <button
          id="ctrl-chat"
          className={`ctrl-btn ${isChatOpen ? 'active-blue' : ''}`}
          onClick={onToggleChat}
          title="Toggle chat"
        >
          💬
          {!isChatOpen && unread > 0 && (
            <span className="unread-badge">{unread}</span>
          )}
        </button>
      </div>

      <style jsx>{`
        .controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-radius: 18px;
          gap: 16px;
          flex-shrink: 0;
        }
        .controls-left, .controls-right { display: flex; gap: 10px; }
        .controls-center { display: flex; gap: 12px; align-items: center; }
        .ctrl-btn {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.12); transform: scale(1.06); }
        .active-red { background: rgba(239,68,68,0.2) !important; border-color: rgba(239,68,68,0.4) !important; }
        .active-blue { background: rgba(99,102,241,0.2) !important; border-color: rgba(99,102,241,0.4) !important; }
        .ctrl-main {
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .ctrl-main:hover { transform: scale(1.03); }
        .ctrl-main:active { transform: scale(0.97); }
        .ctrl-next {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
        }
        .ctrl-stop {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .ctrl-searching {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          cursor: not-allowed;
        }
        .spin-sm {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .unread-badge {
          position: absolute;
          top: -4px; right: -4px;
          width: 18px; height: 18px;
          background: #6366f1;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media(max-width:600px){
          .controls-bar { padding: 12px 14px; gap: 8px; }
          .ctrl-main { padding: 10px 18px; font-size: 13px; }
          .ctrl-btn { width: 42px; height: 42px; font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
