import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Créer une instance axios directement pour éviter les dépendances circulaires
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface VerifyResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private tokenKey = 'auth-token';
  private userKey = 'auth-user';
  private tokenExpiryKey = 'auth-token-expiry';
  private tokenRefreshTimeout: number | null = null;

  /**
   * Authentifie un utilisateur avec email et mot de passe
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Gestion temporaire des identifiants de test
      if (email === 'admin@portfolio.com' && password === 'admin123') {
        console.log('Utilisation des identifiants de test');
        const dummyUser = {
          id: '1',
          email: 'admin@portfolio.com',
          name: 'Admin'
        };
        
        // Stocker un token dummy et les informations utilisateur
        this.setToken('dummy-token-for-testing');
        this.setUser(dummyUser);
        
        // Configurer l'expiration du token (2h par défaut)
        this.setupTokenExpiry();
        
        return dummyUser;
      }
      
      // Authentification réelle avec l'API
      const response = await authAxios.post<LoginResponse>(`/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Stocker le token et les informations utilisateur
      this.setToken(token);
      this.setUser(user);
      
      // Configurer l'expiration du token (2h par défaut)
      this.setupTokenExpiry();
      
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erreur d\'authentification');
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenExpiryKey);
    
    if (this.tokenRefreshTimeout) {
      window.clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  /**
   * Vérifie si le token est valide
   */
  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }
    
    // Gestion temporaire du token de test
    if (token === 'dummy-token-for-testing') {
      console.log('Utilisation du token de test');
      const user = this.getUser();
      return user;
    }
    
    try {
      // Ajouter le token à la requête
      const token = this.getToken();
      const response = await authAxios.get<VerifyResponse>(`/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Mettre à jour les informations utilisateur
      this.setUser(response.data.user);
      
      return response.data.user;
    } catch (error) {
      // Token invalide ou expiré
      this.logout();
      return null;
    }
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Définit le token d'authentification
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Récupère les informations de l'utilisateur
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  /**
   * Définit les informations de l'utilisateur
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Configure l'expiration du token
   */
  private setupTokenExpiry(): void {
    // Par défaut, on considère que le token expire dans 2h
    const expiryTime = Date.now() + 2 * 60 * 60 * 1000; // 2 heures en millisecondes
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    
    // Configurer un timeout pour déconnecter l'utilisateur automatiquement
    // 5 minutes avant l'expiration pour éviter les problèmes
    const timeUntilExpiry = expiryTime - Date.now() - 5 * 60 * 1000;
    
    if (this.tokenRefreshTimeout) {
      window.clearTimeout(this.tokenRefreshTimeout);
    }
    
    this.tokenRefreshTimeout = window.setTimeout(() => {
      // Vérifier si l'utilisateur est toujours actif
      const lastActivity = this.getLastActivity();
      const inactiveTime = Date.now() - lastActivity;
      
      // Si inactif depuis plus de 30 minutes, déconnecter
      if (inactiveTime > 30 * 60 * 1000) {
        this.logout();
        window.location.href = '/login?session=expired';
      } else {
        // Sinon, essayer de rafraîchir le token
        this.verifyToken().catch(() => {
          window.location.href = '/login?session=expired';
        });
      }
    }, timeUntilExpiry);
  }

  /**
   * Récupère le timestamp de la dernière activité
   */
  getLastActivity(): number {
    const lastActivity = localStorage.getItem('last-activity');
    return lastActivity ? parseInt(lastActivity, 10) : Date.now();
  }

  /**
   * Met à jour le timestamp de la dernière activité
   */
  updateLastActivity(): void {
    localStorage.setItem('last-activity', Date.now().toString());
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Créer une instance unique du service d'authentification
const authServiceInstance = new AuthService();

// Exporter l'instance pour une utilisation dans toute l'application
export default authServiceInstance;