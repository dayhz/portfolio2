import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home } from 'react-iconly';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  
  const from = location.state?.from || '/';

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    console.log('Login - État d\'authentification:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('Déjà authentifié, redirection vers la page d\'accueil');
      navigate('/');
    }
    
    // Vérifier si la session a expiré
    const sessionStatus = searchParams.get('session');
    if (sessionStatus === 'expired') {
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Tentative de connexion avec:', { email, password });

    try {
      await login(email, password);
      console.log('Connexion réussie, redirection vers:', from);
      navigate(from);
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte d'authentification
      console.error('Erreur de connexion:', error);
      // Réinitialiser le mot de passe en cas d'erreur
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Home size="large" primaryColor="#3b82f6" />
          </div>
          <CardTitle className="text-2xl">Portfolio CMS</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour gérer votre portfolio
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@portfolio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Identifiants de test:</p>
            <p>Email: admin@portfolio.com</p>
            <p>Mot de passe: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}