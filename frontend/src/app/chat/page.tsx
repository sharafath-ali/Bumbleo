'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { setStatus, skip, resetChat } from '@/store/chatSlice';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import VideoGrid from '@/components/chat/VideoGrid';
import ChatControls from '@/components/chat/ChatControls';
import TextChat from '@/components/chat/TextChat';
import StatusBar from '@/components/chat/StatusBar';
import { WSMessage } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { status, role } = useAppSelector((s) => s.chat);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  const handleSignalRef = useRef<((msg: WSMessage) => void) | null>(null);

  // WebRTC signaling message handler — uses ref to avoid stale closure
  const handleWSMessage = useCallback(
    (msg: WSMessage) => {
      if (['offer', 'answer', 'ice_candidate'].includes(msg.type)) {
        handleSignalRef.current?.(msg);
      }
    },
    []
  );

  const { send, isConnected } = useWebSocket(handleWSMessage);

  const { handleSignal, hangup, stopLocalStream, getLocalStream } = useWebRTC(
    localVideoRef,
    remoteVideoRef,
    { send, role }
  );

  // Keep ref in sync with latest handleSignal
  useEffect(() => {
    handleSignalRef.current = handleSignal;
  }, [handleSignal]);

  // Start local camera preview on mount
  useEffect(() => {
    getLocalStream().catch(() => {/* camera denied */});
    return () => stopLocalStream();
  }, [getLocalStream, stopLocalStream]);

  const handleStart = useCallback(() => {
    dispatch(setStatus('searching'));
    send({ type: 'join_queue' });
  }, [dispatch, send]);

  const handleNext = useCallback(() => {
    hangup();
    dispatch(skip());
    send({ type: 'next' });
  }, [dispatch, send, hangup]);

  const handleStop = useCallback(() => {
    hangup();
    dispatch(resetChat());
    send({ type: 'next' }); // effectively dequeues
  }, [dispatch, send, hangup]);

  const handleSendChat = useCallback(
    (text: string) => {
      send({ type: 'chat_message', payload: { text } });
    },
    [send]
  );

  const handleReport = useCallback(
    (reason: string) => {
      send({ type: 'report', payload: { reason } });
      setShowReport(false);
    },
    [send]
  );

  if (!user) return null;

  return (
    <div className="chat-page">
      {/* Top nav */}
      <nav className="chat-nav glass">
        <Link href="/" className="nav-brand gradient-text">Bumbleo</Link>
        <div className="nav-actions">
          <span className={`conn-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {['matched', 'connected'].includes(status) && (
            <button className="report-btn" onClick={() => setShowReport(true)} title="Report user">
              🚩 Report
            </button>
          )}
          <Link href="/">
            <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>← Home</button>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="chat-body">
        <div className="video-area">
          <VideoGrid localRef={localVideoRef} remoteRef={remoteVideoRef} />
        </div>

        <TextChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSend={handleSendChat}
        />
      </div>

      {/* Controls */}
      <div className="chat-footer">
        <StatusBar />
        <ChatControls
          onStart={handleStart}
          onNext={handleNext}
          onStop={handleStop}
          onToggleChat={() => setIsChatOpen((p) => !p)}
          isChatOpen={isChatOpen}
        />
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Report User</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 20 }}>
              Why are you reporting this user?
            </p>
            {['Inappropriate content', 'Harassment', 'Spam / bot', 'Nudity', 'Other'].map((r) => (
              <button
                key={r}
                className="report-option"
                onClick={() => handleReport(r)}
              >
                {r}
              </button>
            ))}
            <button
              className="btn-ghost"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setShowReport(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: var(--color-bg);
          overflow: hidden;
        }
        .chat-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-radius: 14px;
          flex-shrink: 0;
        }
        :global(.nav-brand) { font-size: 20px; font-weight: 800; text-decoration: none; }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .conn-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          animation: pulse-soft 2s infinite;
        }
        .conn-dot.connected { background: #22c55e; }
        .conn-dot.disconnected { background: #6b7280; }
        .report-btn {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .report-btn:hover { background: rgba(239,68,68,0.2); }
        .chat-body {
          flex: 1;
          display: flex;
          gap: 10px;
          min-height: 0;
        }
        .video-area {
          flex: 1;
          min-height: 0;
          border-radius: 20px;
          overflow: hidden;
        }
        .chat-footer {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        /* Report modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
        }
        .modal {
          max-width: 380px;
          width: 100%;
          padding: 28px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .report-option {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .report-option:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #fca5a5; }
        @media(max-width:900px){
          .chat-body { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
