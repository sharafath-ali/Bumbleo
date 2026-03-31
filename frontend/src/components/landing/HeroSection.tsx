'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot" />
          Live now — thousands online
        </div>

        <h1 className="hero-title">
          Meet Someone <br />
          <span className="gradient-text">New Right Now</span>
        </h1>

        <p className="hero-subtitle">
          Anonymous, instant, and completely free video chat with strangers
          from around the world. No sign-up required to browse — just click
          and connect.
        </p>

        <div className="hero-actions">
          <button
            id="hero-start-btn"
            className="btn-primary hero-cta"
            onClick={() => router.push(isAuthenticated ? '/chat' : '/auth/register')}
          >
            🎲 Start Chatting
          </button>
          <Link href="#how-it-works">
            <button className="btn-ghost hero-secondary">How it works ↓</button>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat"><span className="stat-num gradient-text">50K+</span><span className="stat-label">Users Online</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num gradient-text">180+</span><span className="stat-label">Countries</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num gradient-text">1M+</span><span className="stat-label">Chats Today</span></div>
        </div>
      </div>

      {/* Floating video preview cards */}
      <div className="hero-visual" aria-hidden="true">
        <div className="video-card video-card-1 glass">
          <div className="video-placeholder">
            <div className="avatar-ring"><span style={{ fontSize: 32 }}>🧑‍💻</span></div>
          </div>
          <div className="video-label">You</div>
        </div>
        <div className="video-card video-card-2 glass">
          <div className="video-placeholder" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))' }}>
            <div className="avatar-ring"><span style={{ fontSize: 32 }}>👩‍🎤</span></div>
          </div>
          <div className="video-label">Stranger</div>
        </div>
        <div className="connecting-line" />
      </div>

      <style jsx>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 80px;
          padding: 100px 48px 60px;
          position: relative;
          flex-wrap: wrap;
        }
        .hero-content { max-width: 560px; flex: 1; min-width: 300px; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 13px;
          color: #a5b4fc;
          font-weight: 500;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 8px; height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse-soft 2s infinite;
        }
        .hero-title {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 20px;
          color: #fff;
        }
        .hero-subtitle {
          font-size: 17px;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 480px;
        }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
        .hero-cta { font-size: 17px; padding: 16px 36px; }
        .hero-secondary { font-size: 15px; }
        .hero-stats { display: flex; align-items: center; gap: 24px; }
        .stat { display: flex; flex-direction: column; }
        .stat-num { font-size: 26px; font-weight: 800; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }
        .hero-visual { position: relative; width: 340px; height: 380px; flex-shrink: 0; }
        .video-card {
          position: absolute;
          width: 200px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }
        .video-card-1 { top: 0; left: 0; animation: float1 6s ease-in-out infinite; }
        .video-card-2 { bottom: 0; right: 0; animation: float2 7s ease-in-out infinite; }
        .video-placeholder {
          height: 160px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-ring {
          width: 70px; height: 70px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-label {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .connecting-line {
          position: absolute;
          top: 50%; left: 50%;
          width: 2px; height: 60px;
          background: var(--gradient-primary);
          transform: translate(-50%, -50%) rotate(30deg);
          opacity: 0.4;
          border-radius: 1px;
        }
      `}</style>
    </section>
  );
}
