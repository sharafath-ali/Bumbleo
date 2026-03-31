'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(form.email, form.password);
  };

  const isUnverified = error?.includes('verify your email');

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <div className="auth-card glass animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>Bumbleo</h1>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="field-label" style={{ margin: 0 }}>Password</label>
              <Link
                href="/auth/forgot"
                style={{ fontSize: 13, color: 'var(--color-secondary)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-box">
              {error}
              {isUnverified && (
                <div style={{ marginTop: 8 }}>
                  <Link
                    href="/auth/register"
                    style={{ color: '#a78bfa', fontWeight: 600, fontSize: 13 }}
                  >
                    Resend confirmation email →
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            id="login-submit"
            className="btn-primary"
            type="submit"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-muted)', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>

      <style jsx>{authStyles}</style>
    </div>
  );
}

const authStyles = `
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
  .error-box {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 10px 14px;
    color: #fca5a5;
    font-size: 14px;
  }
`;
