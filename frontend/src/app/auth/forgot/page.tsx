'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="auth-card glass animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>Bumbleo</h1>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Reset your password</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 24 }}>
              If <strong style={{ color: 'white' }}>{email}</strong> is registered, you&apos;ll
              receive a password reset link shortly.
            </p>
            <Link href="/auth/login">
              <button className="btn-ghost" style={{ width: '100%' }}>Back to Login</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Email address</label>
              <input
                id="forgot-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button
              id="forgot-submit"
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link href="/auth/login" style={{ textAlign: 'center' }}>
              <button type="button" className="btn-ghost" style={{ width: '100%' }}>
                ← Back to Login
              </button>
            </Link>
          </form>
        )}
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          position: relative;
          z-index: 1;
        }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
