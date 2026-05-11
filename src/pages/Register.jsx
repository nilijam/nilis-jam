import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Même CSS partagé

// Calcule la force du mot de passe (0, 1, 2, 3)
function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Faible', 'Moyen', 'Fort'];
const STRENGTH_CLASSES = ['', 'weak', 'medium', 'strong'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Le nom d\'utilisateur est requis.';
    else if (form.username.trim().length < 3) e.username = 'Minimum 3 caractères.';
    if (!form.email.trim()) e.email = 'L\'email est requis.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide.';
    if (!form.password) e.password = 'Le mot de passe est requis.';
    else if (form.password.length < 6) e.password = 'Minimum 6 caractères.';
    if (!form.confirm) e.confirm = 'Confirme ton mot de passe.';
    else if (form.confirm !== form.password) e.confirm = 'Les mots de passe ne correspondent pas.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (result.ok) {
        navigate('/');
      } else {
        setGlobalError(result.error);
      }
      setLoading(false);
    }, 250);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🎧</span>
          <span className="auth-logo-text">Nili's Jam</span>
        </div>

        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoins la communauté et accède à ta musique</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {globalError && (
            <div className="auth-error-banner">
              <ErrorIcon /> {globalError}
            </div>
          )}

          {/* Nom d'utilisateur */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">Nom d'utilisateur</label>
            <div className="auth-input-wrap">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="ton_pseudo"
                className={`auth-input ${errors.username ? 'error' : ''}`}
              />
              <span className="auth-input-icon"><UserIcon /></span>
            </div>
            {errors.username && (
              <span className="auth-field-error"><ErrorIcon size={12} /> {errors.username}</span>
            )}
          </div>

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
                autoComplete="new-password"
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
            {/* Indicateur de force */}
            {form.password && (
              <>
                <div className="password-strength">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`strength-bar ${i <= strength ? STRENGTH_CLASSES[strength] : ''}`}
                    />
                  ))}
                </div>
                <span className="strength-label">{STRENGTH_LABELS[strength]}</span>
              </>
            )}
          </div>

          {/* Confirmation */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">Confirmer le mot de passe</label>
            <div className="auth-input-wrap">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`auth-input ${errors.confirm ? 'error' : ''}`}
              />
              <span className="auth-input-icon"><LockIcon /></span>
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirm(p => !p)}
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirm && (
              <span className="auth-field-error"><ErrorIcon size={12} /> {errors.confirm}</span>
            )}
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ?{' '}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Icônes SVG inline ── */
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
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
