import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - État d\'authentification:', { isAuthenticated, loading, user });

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Vérification de l'authentification...</span>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    console.log('Non authentifié, redirection vers la page de connexion');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('Authentifié, affichage du contenu protégé');
  return <>{children}</>;
}