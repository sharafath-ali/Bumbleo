'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' });
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (form.password !== form.confirm) {
      setValidationError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    const result = await register(form.email, form.username, form.password);
    if (result.success) setSuccess(true);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="auth-card glass animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
          <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Check your inbox!
          </h1>
          <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 24 }}>
            We sent a confirmation link to <strong style={{ color: 'white' }}>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login">
            <button className="btn-primary" style={{ width: '100%' }}>Back to Login</button>
          </Link>
        </div>
        <style jsx>{authStyles}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <div className="auth-card glass animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>Bumbleo</h1>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Email</label>
            <input
              id="register-email"
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
            <label className="field-label">Username</label>
            <input
              id="register-username"
              className="input"
              type="text"
              placeholder="cooluser123"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              id="register-password"
              className="input"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="field-label">Confirm Password</label>
            <input
              id="register-confirm"
              className="input"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          {(error || validationError) && (
            <div className="error-box">{error || validationError}</div>
          )}

          <button
            id="register-submit"
            className="btn-primary"
            type="submit"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            Sign in
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
