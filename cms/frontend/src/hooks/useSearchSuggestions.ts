import { useState, useEffect } from 'react';
import { searchService } from '../services/SearchService';

/**
 * Hook personnalisé pour gérer les suggestions de recherche
 * @param query - La requête de recherche actuelle
 * @param debounceTime - Le délai de debounce en millisecondes
 * @returns Les suggestions de recherche
 */
export const useSearchSuggestions = (query: string, debounceTime = 300) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const newSuggestions = await searchService.getSuggestions(query);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Erreur lors du chargement des suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Appliquer le debounce
    timeoutId = setTimeout(fetchSuggestions, debounceTime);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debounceTime]);

  return { suggestions, isLoading };
};