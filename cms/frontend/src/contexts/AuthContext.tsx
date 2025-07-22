import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { User } from '../services/AuthService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initialisation de l\'authentification');
        
        // Vérifier si un token existe et est valide
        const user = await AuthService.verifyToken();
        console.log('Résultat de la vérification du token:', user);
        
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          
          // Configurer l'écouteur d'activité
          setupActivityListener();
          console.log('Authentification réussie:', user);
        } else {
          console.log('Aucun token valide trouvé');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Configurer l'écouteur d'activité pour mettre à jour le timestamp de dernière activité
  const setupActivityListener = () => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      AuthService.updateLastActivity();
    };
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });
    
    // Mettre à jour l'activité immédiatement
    updateActivity();
    
    // Nettoyer les écouteurs d'événements
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      setupActivityListener();
      toast.success('Connexion réussie');
    } catch (error) {
      let errorMessage = 'Erreur lors de la connexion';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Vous avez été déconnecté');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};