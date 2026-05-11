import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si l'utilisateur n'est pas connecté, redirige vers /login
// Sinon affiche la page demandée normalement
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Pendant la vérification de la session (lecture localStorage), ne rien afficher
  if (loading) return null;

  return user ? children : <Navigate to="/login" replace />;
}
