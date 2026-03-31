'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    api
      .get(`/api/auth/verify?token=${token}`, { skipAuth: true })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified!');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-card glass animate-fade-in" style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div className="spinner" />
            <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h1 className="gradient-text" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Email Verified!
            </h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>{message}</p>
            <Link href="/auth/login">
              <button id="verify-login-btn" className="btn-primary" style={{ width: '100%' }}>
                Continue to Login
              </button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#fca5a5' }}>
              Verification Failed
            </h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>{message}</p>
            <Link href="/auth/register">
              <button className="btn-ghost" style={{ width: '100%' }}>Back to Register</button>
            </Link>
          </>
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
          max-width: 400px;
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
