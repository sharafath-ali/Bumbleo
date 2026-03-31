'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

function ResetContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    const result = await resetPassword(token, form.password);
    setLoading(false);
    if (result.success) setDone(true);
    else setError(result.error ?? 'Reset failed');
  };

  if (!token) return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-card glass animate-fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <p style={{ color: 'var(--color-muted)' }}>Invalid reset link.</p>
        <Link href="/auth/forgot"><button className="btn-ghost" style={{ width: '100%', marginTop: 20 }}>Request new link</button></Link>
      </div>
      <style jsx>{styles}</style>
    </div>
  );

  if (done) return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-card glass animate-fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
        <h1 className="gradient-text" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Password Reset!</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>You can now log in with your new password.</p>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/auth/login')}>Go to Login</button>
      </div>
      <style jsx>{styles}</style>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-card glass animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>Bumbleo</h1>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Set a new password</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">New Password</label>
            <input id="reset-password" className="input" type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Confirm Password</label>
            <input id="reset-confirm" className="input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button id="reset-submit" className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
      <style jsx>{styles}</style>
    </div>
  );
}

export default function ResetPage() {
  return <Suspense><ResetContent /></Suspense>;
}

const styles = `
  .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; }
  .auth-card { width:100%; max-width:420px; padding:40px; position:relative; z-index:1; }
  .field-label { display:block; font-size:13px; font-weight:500; color:rgba(255,255,255,0.6); margin-bottom:6px; }
  .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; color:#fca5a5; font-size:14px; }
`;
