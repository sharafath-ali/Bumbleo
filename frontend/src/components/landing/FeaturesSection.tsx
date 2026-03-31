export default function FeaturesSection() {
  const features = [
    { icon: '⚡', title: 'Instant Matching', desc: 'Sub-second matchmaking powered by Redis queues. Never wait for a stranger.' },
    { icon: '🔒', title: 'Fully Anonymous', desc: 'No personal data required. Your privacy is our priority by design.' },
    { icon: '🌍', title: 'Global Reach', desc: 'Connect with people in 180+ countries. Language and borders disappear.' },
    { icon: '📱', title: 'Mobile Ready', desc: 'Works seamlessly on any device — phone, tablet, or desktop.' },
    { icon: '🛡️', title: 'Moderation Tools', desc: 'Report bad actors instantly. Our team reviews all reports within hours.' },
    { icon: '💬', title: 'Text + Video', desc: 'Chat in real-time over video or use the built-in text chat panel.' },
  ];

  return (
    <section className="section features-section">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-tag">Why Bumbleo</div>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-sub">Fast, safe, and borderless video chat — crafted for real humans.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features-section { background: rgba(255,255,255,0.01); }
        .section { padding: 100px 48px; position: relative; z-index: 1; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 64px; }
        .section-tag {
          display: inline-block;
          background: rgba(168,85,247,0.15);
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #c4b5fd;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title { font-size: clamp(28px,4vw,46px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 12px; }
        .section-sub { color: rgba(255,255,255,0.5); font-size: 17px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .feature-card {
          padding: 32px;
          border-radius: 18px;
          transition: transform 0.3s ease, border-color 0.3s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(168,85,247,0.25);
          box-shadow: 0 16px 40px rgba(168,85,247,0.08);
        }
        .feature-icon { font-size: 32px; margin-bottom: 16px; }
        .feature-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .feature-desc { color: rgba(255,255,255,0.5); line-height: 1.7; font-size: 14px; }
        @media(max-width:768px){ .section { padding:60px 24px; } }
      `}</style>
    </section>
  );
}
