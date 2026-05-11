import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ dès que l'utilisateur retape
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  // Validation côté client avant d'appeler login()
  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'L\'email est requis.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide.';
    if (!form.password) newErrors.password = 'Le mot de passe est requis.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    // Simulation d'un délai réseau (200ms) pour rendre ça réaliste
    setTimeout(() => {
      const result = login({ email: form.email, password: form.password });
      if (result.ok) {
        navigate('/');
      } else {
        setGlobalError(result.error);
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🎧</span>
          <span className="auth-logo-text">Nili's Jam</span>
        </div>

        <h1 className="auth-title">Bon retour 👋</h1>
        <p className="auth-subtitle">Connecte-toi pour accéder à ta musique</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Erreur globale */}
          {globalError && (
            <div className="auth-error-banner">
              <ErrorIcon /> {globalError}
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ton@email.com"
                className={`auth-input ${errors.email ? 'error' : ''}`}
              />
              <span className="auth-input-icon"><MailIcon /></span>
            </div>
            {errors.email && (
              <span className="auth-field-error"><ErrorIcon size={12} /> {errors.email}</span>
            )}
          </div>

          {/* Mot de passe */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Mot de passe</label>
            <div className="auth-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`auth-input ${errors.password ? 'error' : ''}`}
              />
              <span className="auth-input-icon"><LockIcon /></span>
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <span className="auth-field-error"><ErrorIcon size={12} /> {errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ?{' '}
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Icônes SVG inline ── */
function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>;
}
function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
function ErrorIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
