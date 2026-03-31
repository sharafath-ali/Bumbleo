'use client';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: '🔗',
      title: 'Connect Instantly',
      desc: 'Open Bumbleo and click "Start Chatting". No download, no account needed to begin.',
    },
    {
      num: '02',
      icon: '🎲',
      title: 'Get Matched',
      desc: 'Our smart queue pairs you with a random stranger in milliseconds from anywhere on Earth.',
    },
    {
      num: '03',
      icon: '💬',
      title: 'Chat Freely',
      desc: 'Talk via video, share thoughts in text, and move on anytime by hitting Next.',
    },
  ];

  return (
    <section id="how-it-works" className="section">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-tag">Simple as 1-2-3</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Ready in seconds, no setup required.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="step-card glass">
              <div className="step-num gradient-text">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .section { padding: 100px 48px; position: relative; z-index: 1; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 64px; }
        .section-tag {
          display: inline-block;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #a5b4fc;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title { font-size: clamp(28px,4vw,46px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 12px; }
        .section-sub { color: rgba(255,255,255,0.5); font-size: 17px; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; position: relative; }
        .step-card {
          padding: 36px 32px;
          border-radius: 20px;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .step-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(99,102,241,0.15); }
        .step-num { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; }
        .step-icon { font-size: 36px; margin-bottom: 16px; }
        .step-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .step-desc { color: rgba(255,255,255,0.55); line-height: 1.7; font-size: 15px; }
        .step-arrow {
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 22px;
          color: rgba(255,255,255,0.15);
          z-index: 2;
        }
        @media (max-width: 768px) { .step-arrow { display: none; } .section { padding: 60px 24px; } }
      `}</style>
    </section>
  );
}
