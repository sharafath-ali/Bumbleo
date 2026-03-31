'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CTASection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <section className="cta-section">
      <div className="cta-inner glass">
        <div className="cta-glow" />
        <h2 className="cta-title">
          Ready to Meet Someone <span className="gradient-text">Amazing?</span>
        </h2>
        <p className="cta-sub">
          Join thousands of people connecting right now. It&apos;s free, anonymous, and instant.
        </p>
        <button
          id="cta-start-btn"
          className="btn-primary cta-btn"
          onClick={() => router.push(isAuthenticated ? '/chat' : '/auth/register')}
        >
          🚀 Start Video Chat — It&apos;s Free
        </button>
        <p className="cta-note">No credit card. No download. No waiting.</p>
      </div>

      <style jsx>{`
        .cta-section { padding: 80px 48px 120px; position: relative; z-index: 1; }
        .cta-inner {
          max-width: 780px;
          margin: 0 auto;
          padding: 64px 48px;
          text-align: center;
          border-radius: 28px;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle at 50% 50%, rgba(168,85,247,0.15), transparent 70%);
          pointer-events: none;
        }
        .cta-title { font-size: clamp(26px,4vw,44px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 16px; }
        .cta-sub { color: rgba(255,255,255,0.55); font-size: 17px; margin-bottom: 36px; line-height: 1.6; }
        .cta-btn { font-size: 18px; padding: 18px 48px; }
        .cta-note { margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.3); }
        @media(max-width:768px){ .cta-section { padding:60px 24px 80px; } .cta-inner { padding:40px 28px; } }
      `}</style>
    </section>
  );
}
