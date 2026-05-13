import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Subscription.css';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 FCFA',
    period: 'pour toujours',
    icon: '🎵',
    color: '#444460',
    features: [
      { label: 'Home & Exploration', ok: true },
      { label: 'Favoris (max 20)', ok: true },
      { label: 'Playlists (max 2)', ok: true },
      { label: 'Radio', ok: false },
      { label: 'Playlists illimitées', ok: false },
      { label: 'Livres EPUB', ok: false },
      { label: 'Stats & Events', ok: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '3 000 FCFA',
    period: 'par mois',
    icon: '⭐',
    color: '#b06aff',
    badge: 'Populaire',
    features: [
      { label: 'Home & Exploration', ok: true },
      { label: 'Favoris illimités', ok: true },
      { label: 'Playlists illimitées', ok: true },
      { label: 'Radio', ok: true },
      { label: 'Livres EPUB', ok: false },
      { label: 'Stats & Events', ok: false },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '6 000 FCFA',
    period: 'par mois',
    icon: '👑',
    color: '#f59e0b',
    badge: 'Tout inclus',
    features: [
      { label: 'Home & Exploration', ok: true },
      { label: 'Favoris illimités', ok: true },
      { label: 'Playlists illimitées', ok: true },
      { label: 'Radio', ok: true },
      { label: 'Livres EPUB', ok: true },
      { label: 'Stats & Events', ok: true },
    ],
  },
];

export default function Subscription() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState('free');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      if (auth?.updateUser) {
        await auth.updateUser({
          plan: selected,
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Erreur abonnement :', error);
      alert("Impossible d'enregistrer l'abonnement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-page">
      <div className="sub-header">
        <h1 className="sub-title">
          🎧 Choisis ton abonnement
        </h1>

        <p className="sub-subtitle">
          Tu peux changer de formule à tout moment
        </p>
      </div>

      <div className="sub-plans">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`sub-plan-card ${
              selected === plan.id ? 'selected' : ''
            }`}
            onClick={() => setSelected(plan.id)}
            style={{
              borderColor:
                selected === plan.id
                  ? plan.color
                  : '#1a1a35',
            }}
          >
            {plan.badge && (
              <span
                className="sub-badge"
                style={{
                  background: plan.color,
                }}
              >
                {plan.badge}
              </span>
            )}

            <div className="sub-plan-icon">
              {plan.icon}
            </div>

            <h2 className="sub-plan-name">
              {plan.name}
            </h2>

            <div className="sub-plan-price">
              <span
                className="sub-price-amount"
                style={{ color: plan.color }}
              >
                {plan.price}
              </span>

              <span className="sub-price-period">
                /{plan.period}
              </span>
            </div>

            <ul className="sub-features">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className={feature.ok ? 'ok' : 'nok'}
                >
                  <span className="sub-feature-icon">
                    {feature.ok ? '✓' : '✗'}
                  </span>

                  {feature.label}
                </li>
              ))}
            </ul>

            <div
              className={`sub-select-indicator ${
                selected === plan.id ? 'active' : ''
              }`}
              style={{
                background:
                  selected === plan.id
                    ? plan.color
                    : 'transparent',

                borderColor: plan.color,
              }}
            >
              {selected === plan.id
                ? '✓ Sélectionné'
                : 'Choisir'}
            </div>
          </div>
        ))}
      </div>

      <div className="sub-footer">
        <p className="sub-note">
          💡 Les paiements sont fictifs pour le moment
        </p>

        <button
          className="sub-confirm-btn"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading
            ? 'Enregistrement...'
            : `Continuer avec ${
                PLANS.find(
                  (p) => p.id === selected
                )?.name
              } →`}
        </button>
      </div>
    </div>
  );
}
