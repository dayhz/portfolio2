import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'portfolio-cms-search-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook personnalisé pour gérer l'historique de recherche
 * @returns Fonctions et données pour gérer l'historique de recherche
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique de recherche:', error);
      return [];
    }
  });

  // Sauvegarder l'historique dans le localStorage quand il change
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique de recherche:', error);
    }
  }, [searchHistory]);

  /**
   * Ajouter une recherche à l'historique
   * @param query - La requête à ajouter
   */
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      // Supprimer les doublons
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      // Ajouter au début et limiter la taille
      return [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  /**
   * Supprimer une recherche de l'historique
   * @param query - La requête à supprimer
   */
  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  }, []);

  /**
   * Vider l'historique de recherche
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};