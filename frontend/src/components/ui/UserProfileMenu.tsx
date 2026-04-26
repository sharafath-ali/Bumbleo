'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/auth/login">
        <button className="btn-ghost" style={{ padding: '8px 20px', fontSize: '14px' }}>
          Login
        </button>
      </Link>
    );
  }

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button 
        className="profile-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="avatar-circle">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="username">{user.username}</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu glass animate-fade-in">
          <div className="dropdown-header">
            <div className="dropdown-user-info">
              <span className="dropdown-username">{user.username}</span>
              <span className="dropdown-email">{user.email}</span>
            </div>
            {user.isVerified ? (
              <span className="verified-badge">✓ Verified</span>
            ) : (
              <span className="unverified-badge">Not verified</span>
            )}
          </div>
          <div className="dropdown-divider" />
          <div className="dropdown-actions">
            <button className="dropdown-item" onClick={() => setIsOpen(false)}>
              ⚙️ Settings
            </button>
            <button className="dropdown-item text-danger" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-menu-container {
          position: relative;
          z-index: 50;
        }
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 6px 14px 6px 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-text);
        }
        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .avatar-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: white;
        }
        .username {
          font-size: 14px;
          font-weight: 500;
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          transform-origin: top right;
        }
        .dropdown-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .dropdown-user-info {
          display: flex;
          flex-direction: column;
        }
        .dropdown-username {
          font-weight: 600;
          font-size: 15px;
        }
        .dropdown-email {
          color: var(--color-muted);
          font-size: 13px;
        }
        .verified-badge {
          display: inline-block;
          font-size: 11px;
          color: #4ade80;
          background: rgba(74, 222, 128, 0.1);
          padding: 2px 8px;
          border-radius: 100px;
          align-self: flex-start;
          margin-top: 4px;
        }
        .unverified-badge {
          display: inline-block;
          font-size: 11px;
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
          padding: 2px 8px;
          border-radius: 100px;
          align-self: flex-start;
          margin-top: 4px;
        }
        .dropdown-divider {
          height: 1px;
          background: var(--color-border);
          margin: 12px -16px;
        }
        .dropdown-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--color-text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .text-danger {
          color: #fca5a5;
        }
        .text-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #fecaca;
        }
      `}</style>
    </div>
  );
}
