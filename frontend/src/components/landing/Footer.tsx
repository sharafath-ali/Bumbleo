'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      {/* AdSense Banner Slot — replace ca-pub with your Publisher ID */}
      <div className="adsense-bar">
        <div className="ad-placeholder">
          {/* <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true" /> */}
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>Advertisement</span>
        </div>
      </div>

      <div className="footer-inner">
        <div className="footer-brand">
          <span className="gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>Bumbleo</span>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6, maxWidth: 220, lineHeight: 1.6 }}>
            Anonymous random video chat. Meet the world, one stranger at a time.
          </p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <div className="link-heading">Product</div>
            <Link href="/chat" className="footer-link">Start Chatting</Link>
            <Link href="#how-it-works" className="footer-link">How It Works</Link>
            <Link href="#features" className="footer-link">Features</Link>
          </div>
          <div className="link-group">
            <div className="link-heading">Account</div>
            <Link href="/auth/register" className="footer-link">Sign Up</Link>
            <Link href="/auth/login" className="footer-link">Log In</Link>
          </div>
          <div className="link-group">
            <div className="link-heading">Legal</div>
            <span className="footer-link muted">Privacy Policy</span>
            <span className="footer-link muted">Terms of Service</span>
            <span className="footer-link muted">Cookie Policy</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
          © {new Date().getFullYear()} Bumbleo. All rights reserved.
        </span>
      </div>

      <style jsx>{`
        .footer { border-top: 1px solid rgba(255,255,255,0.06); }
        .adsense-bar {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          min-height: 60px;
        }
        .ad-placeholder {
          width: 100%; max-width: 728px;
          min-height: 40px;
          border: 1px dashed rgba(255,255,255,0.06);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 56px 48px 40px;
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
        }
        .footer-brand { flex: 1; min-width: 200px; }
        .footer-links { display: flex; gap: 64px; flex-wrap: wrap; }
        .link-group { display: flex; flex-direction: column; gap: 10px; }
        .link-heading { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
        :global(.footer-link) { font-size: 14px; color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.2s; cursor: pointer; }
        :global(.footer-link:hover) { color: rgba(255,255,255,0.9); }
        .muted { color: rgba(255,255,255,0.25); cursor: default; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding: 20px 48px; max-width: 1100px; margin: 0 auto; }
        @media(max-width:768px){ .footer-inner { padding:40px 24px; gap:40px; } .footer-links { gap:32px; } .footer-bottom { padding:20px 24px; } }
      `}</style>
    </footer>
  );
}
