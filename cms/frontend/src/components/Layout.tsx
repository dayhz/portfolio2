import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Home,
  User,
  Work,
  Chat,
  Setting,
  Image,
  Document,
  Logout,
  Category,
} from 'react-iconly';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './search/GlobalSearch';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: User, label: 'Profil', href: '/profile' },
  { icon: Work, label: 'Projets', href: '/projects' },
  { icon: Chat, label: 'Témoignages', href: '/testimonials' },
  { icon: Setting, label: 'Services', href: '/services' },
  { icon: Image, label: 'Médias', href: '/media' },
  { icon: Document, label: 'À Propos', href: '/about' },
  { icon: Document, label: '🧪 Test Éditeur', href: '/test-editor' },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Portfolio CMS</h1>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    size="medium"
                    primaryColor={isActive(item.href) ? '#1d4ed8' : '#6b7280'}
                  />
                  <span className="ml-3 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <Logout size="medium" primaryColor="#6b7280" />
            <span className="ml-3">Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Category size="medium" primaryColor="#374151" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-800 lg:hidden">Portfolio CMS</h1>
            </div>
            
            {/* Barre de recherche globale */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <GlobalSearch 
                placeholder="Rechercher dans vos projets, médias, témoignages..."
                onResultClick={(result) => {
                  // Navigation personnalisée si nécessaire
                  switch (result.type) {
                    case 'project':
                      navigate(`/projects/${result.id}`);
                      break;
                    case 'media':
                      navigate('/media');
                      break;
                    case 'testimonial':
                      navigate('/testimonials');
                      break;
                  }
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'VB'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Toast notifications are now handled in App.tsx */}
    </div>
  );
}