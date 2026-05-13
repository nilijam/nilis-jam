/**
 * src/pages/Verify.jsx
 * Page de vérification du code de confirmation après inscription
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Verify() {
  const { user, verifyCode } = useAuth();
  const navigate = useNavigate();

  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Entre le code reçu par email.'); return; }

    setLoading(true);
    setError('');

    const result = await verifyCode(code.trim());
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResend = () => {
    navigate('/register');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🎧</span>
          <span className="auth-logo-text">Nili's Jam</span>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 className="auth-title">Email vérifié !</h2>
            <p className="auth-subtitle">Redirection en cours…</p>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Vérifie ton email 📬</h1>
            <p className="auth-subtitle">
              Un code à 6 chiffres a été envoyé à<br />
              <strong style={{ color: '#b06aff' }}>{user?.email}</strong>
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-error-banner">
                  <ErrorIcon /> {error}
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="code">Code de confirmation</label>
                <div className="auth-input-wrap">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="123456"
                    className={`auth-input ${error ? 'error' : ''}`}
                    style={{ letterSpacing: '8px', fontSize: '22px', textAlign: 'center', fontWeight: 700 }}
                    autoFocus
                  />
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={loading || code.length !== 6}>
                {loading && <span className="auth-btn-spinner" />}
                {loading ? 'Vérification…' : 'Confirmer'}
              </button>
            </form>

            <p className="auth-switch">
              Pas reçu le code ?{' '}
              <span
                onClick={handleResend}
                style={{ color: '#b06aff', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Renvoyer
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ErrorIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
