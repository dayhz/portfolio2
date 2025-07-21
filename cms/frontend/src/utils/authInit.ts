/**
 * Utilitaire pour initialiser automatiquement l'authentification
 * Cela permet d'éviter les problèmes d'authentification sur macOS
 */

export const initAuth = () => {
  // Vérifier si un token existe déjà
  if (!localStorage.getItem('auth-token')) {
    // Ajouter un token d'authentification par défaut
    localStorage.setItem('auth-token', 'dummy-token');
    console.log('Auto-authentification initialisée');
  }
};