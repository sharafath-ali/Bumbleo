'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addMessage } from '@/store/chatSlice';

interface TextChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

export default function TextChat({ isOpen, onClose, onSend }: TextChatProps) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.chat.messages);
  const username = useAppSelector((s) => s.auth.user?.username ?? 'You');
  const status = useAppSelector((s) => s.chat.status);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !['matched', 'connected'].includes(status)) return;
    dispatch(addMessage({ text, from: 'me', username }));
    onSend(text);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={`chat-panel glass ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="chat-header">
        <span style={{ fontWeight: 700, fontSize: 15 }}>💬 Chat</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <span style={{ fontSize: 32 }}>👋</span>
            <p>Say hello to your stranger!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.from === 'me' ? 'msg-me' : 'msg-stranger'}`}>
            {msg.from === 'stranger' && (
              <div className="msg-author">{msg.username ?? 'Stranger'}</div>
            )}
            <div className="msg-bubble">{msg.text}</div>
            <div className="msg-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          id="chat-input"
          className="chat-input input"
          placeholder={['matched', 'connected'].includes(status) ? 'Type a message…' : 'Match first to chat'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={!['matched', 'connected'].includes(status)}
          rows={1}
        />
        <button
          id="chat-send"
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || !['matched', 'connected'].includes(status)}
        >
          ➤
        </button>
      </div>

      <style jsx>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          width: 300px;
          border-radius: 20px;
          overflow: hidden;
          transform: translateX(20px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .chat-panel.open { transform: translateX(0); opacity: 1; pointer-events: all; }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .close-btn {
          background: none; border: none; color: rgba(255,255,255,0.4);
          cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 6px;
          transition: color 0.2s;
        }
        .close-btn:hover { color: white; }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 0;
        }
        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          text-align: center;
          padding: 40px 0;
        }
        .msg { display: flex; flex-direction: column; max-width: 85%; }
        .msg-me { align-self: flex-end; align-items: flex-end; }
        .msg-stranger { align-self: flex-start; align-items: flex-start; }
        .msg-author { font-size: 11px; color: rgba(255,255,255,0.35); margin-bottom: 3px; }
        .msg-bubble {
          padding: 9px 14px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .msg-me .msg-bubble {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .msg-stranger .msg-bubble {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          border-bottom-left-radius: 4px;
        }
        .msg-time { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; }
        .chat-input-row {
          display: flex;
          gap: 8px;
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .chat-input {
          flex: 1;
          resize: none;
          border-radius: 10px;
          font-size: 14px;
          min-height: 38px;
          max-height: 90px;
        }
        .send-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .send-btn:not(:disabled):hover { transform: scale(1.1); }
        @media(max-width:900px){
          .chat-panel { width: 100%; border-radius: 16px; }
        }
      `}</style>
    </div>
  );
}
