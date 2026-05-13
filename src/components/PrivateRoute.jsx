/**
 * src/components/PrivateRoute.jsx
 * Gère l'accès aux pages selon l'état de connexion et le plan
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages accessibles selon le plan
const PLAN_RESTRICTIONS = {
  free: {
    blocked: ['/radio', '/reader'],
    playlistLimit: 2,
    favoritesLimit: 20,
  },
  premium: {
    blocked: ['/reader'],
    playlistLimit: Infinity,
    favoritesLimit: Infinity,
  },
  vip: {
    blocked: [],
    playlistLimit: Infinity,
    favoritesLimit: Infinity,
  },
};

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Non connecté → login
  if (!user) return <Navigate to="/login" replace />;

  // Connecté mais email non vérifié → verify
  if (!user.emailConfirmed) return <Navigate to="/verify" replace />;

  // Connecté mais pas de plan choisi → subscription
  if (!user.plan) return <Navigate to="/subscription" replace />;

  // Vérification des restrictions de plan
  const restrictions = PLAN_RESTRICTIONS[user.plan] || PLAN_RESTRICTIONS.free;
  if (restrictions.blocked.includes(location.pathname)) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
}

// Export des restrictions pour utilisation dans les composants
export { PLAN_RESTRICTIONS };
