import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, User, Work, Chat, Setting, Image, Document, Logout } from 'react-iconly';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Version simple avec routing
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@portfolio.com' && password === 'admin123') {
      localStorage.setItem('auth-token', 'dummy-token');
      toast.success('Connexion réussie');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } else {
      toast.error('Identifiants invalides');
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
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full">
              Se connecter
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

function DashboardPage() {
  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    toast.success('Déconnexion réussie');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bienvenue dans votre système de gestion de portfolio
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Logout size="small" primaryColor="#6b7280" />
            <span className="ml-2">Déconnexion</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Projets
              </CardTitle>
              <Work size="medium" primaryColor="#3b82f6" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Témoignages
              </CardTitle>
              <Chat size="medium" primaryColor="#10b981" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Médias
              </CardTitle>
              <Image size="medium" primaryColor="#8b5cf6" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">156</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Dernière MAJ
              </CardTitle>
              <Setting size="medium" primaryColor="#f59e0b" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Aujourd'hui</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Ajouter un nouveau projet</div>
                  <div className="text-sm text-gray-600">
                    Créer un nouveau projet pour votre portfolio
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Gérer les médias</div>
                  <div className="text-sm text-gray-600">
                    Upload et organiser vos images et vidéos
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Ajouter un témoignage</div>
                  <div className="text-sm text-gray-600">
                    Nouveau témoignage client
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Projet "Zesty" mis à jour</div>
                    <div className="text-xs text-gray-500">Il y a 2 heures</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Nouveau témoignage ajouté</div>
                    <div className="text-xs text-gray-500">Hier</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Images optimisées</div>
                    <div className="text-xs text-gray-500">Il y a 2 jours</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;