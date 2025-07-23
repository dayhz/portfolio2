import axios from 'axios';
import AuthService from '../services/AuthService';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Créer une instance axios avec l'URL de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🔄 Axios Interceptor - Request Config:', config);
    
    // Récupérer le token directement depuis localStorage pour éviter les problèmes de dépendances circulaires
    const token = localStorage.getItem('auth-token') || AuthService.getToken();
    
    if (token) {
      // S'assurer que les headers existent
      if (!config.headers) {
        config.headers = {};
      }
      
      // Ajouter le token d'authentification
      config.headers['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Token ajouté à la requête:', token);
      console.log('📡 URL complète de la requête:', config.baseURL + config.url);
      console.log('📋 Headers de la requête:', config.headers);
    } else {
      console.log('❌ Aucun token disponible pour la requête');
      console.log('📡 URL de la requête sans token:', config.baseURL + config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (non autorisé) et que ce n'est pas déjà une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer de vérifier le token
        const user = await AuthService.verifyToken();
        
        if (user) {
          // Si le token est encore valide, réessayer la requête
          return axiosInstance(originalRequest);
        } else {
          // Si le token n'est plus valide, rediriger vers la page de connexion
          AuthService.logout();
          window.location.href = '/login?session=expired';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // En cas d'erreur lors de la vérification, déconnecter l'utilisateur
        AuthService.logout();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;