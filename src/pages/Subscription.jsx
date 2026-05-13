/**
 * src/pages/Subscription.jsx
 * Page de choix d'abonnement après vérification du code
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Subscription.css';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    icon: '🎵',
    color: '#444460',
    features: [
      { label: 'Home & Exploration',       ok: true  },
      { label: 'Favoris (max 20)',          ok: true  },
      { label: 'Playlists (max 2)',         ok: true  },
      { label: 'Radio',                     ok: false },
      { label: 'Playlists illimitées',      ok: false },
      { label: 'Livres EPUB',               ok: false },
      { label: 'Stats & Events',            ok: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '4.99€',
    period: 'par mois',
    icon: '⭐',
    color: '#b06aff',
    badge: 'Populaire',
    features: [
      { label: 'Home & Exploration',       ok: true  },
      { label: 'Favoris illimités',        ok: true  },
      { label: 'Playlists illimitées',     ok: true  },
      { label: 'Radio',                    ok: true  },
      { label: 'Livres EPUB',              ok: false },
      { label: 'Stats & Events',           ok: false },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '9.99€',
    period: 'par mois',
    icon: '👑',
    color: '#f59e0b',
    badge: 'Tout inclus',
    features: [
      { label: 'Home & Exploration',       ok: true },
      { label: 'Favoris illimités',        ok: true },
      { label: 'Playlists illimitées',     ok: true },
      { label: 'Radio',                    ok: true },
      { label: 'Livres EPUB',              ok: true },
      { label: 'Stats & Events',           ok: true },
    ],
  },
];

export default function Subscription() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('free');
  const [loading, setLoading]   = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await updateUser({ plan: selected });
    navigate('/');
  };

  return (
    <div className="sub-page">
      <div className="sub-header">
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <span className="auth-logo-icon">🎧</span>
          <span className="auth-logo-text">Nili's Jam</span>
        </div>
        <h1 className="sub-title">Choisis ton abonnement</h1>
        <p className="sub-subtitle">Tu pourras changer à tout moment depuis ton profil</p>
      </div>

      <div className="sub-plans">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`sub-plan-card ${selected === plan.id ? 'selected' : ''}`}
            onClick={() => setSelected(plan.id)}
            style={{ '--plan-color': plan.color }}
          >
            {plan.badge && <span className="sub-badge">{plan.badge}</span>}

            <div className="sub-plan-icon">{plan.icon}</div>
            <h2 className="sub-plan-name">{plan.name}</h2>
            <div className="sub-plan-price">
              <span className="sub-price-amount">{plan.price}</span>
              <span className="sub-price-period">/{plan.period}</span>
            </div>

            <ul className="sub-features">
              {plan.features.map((f, i) => (
                <li key={i} className={f.ok ? 'ok' : 'nok'}>
                  <span className="sub-feature-icon">{f.ok ? '✓' : '✗'}</span>
                  {f.label}
                </li>
              ))}
            </ul>

            <div className={`sub-select-indicator ${selected === plan.id ? 'active' : ''}`}>
              {selected === plan.id ? '✓ Sélectionné' : 'Choisir'}
            </div>
          </div>
        ))}
      </div>

      <div className="sub-footer">
        <p className="sub-note">
          💡 Les plans Premium et VIP sont fictifs pour l'instant — tout est gratuit !
        </p>
        <button
          className="sub-confirm-btn"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Enregistrement…' : `Continuer avec ${PLANS.find(p => p.id === selected)?.name} →`}
        </button>
      </div>
    </div>
  );
}
