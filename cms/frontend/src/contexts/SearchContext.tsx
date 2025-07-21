import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { searchService } from '../services/SearchService';
import HighlightedText from '../components/search/HighlightedText';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

export interface SearchResult {
  id: string;
  type: 'project' | 'media' | 'testimonial';
  title: string;
  description?: string;
  url?: string;
  thumbnail?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  relevanceScore: number;
  matchDetails?: {
    titleMatches: string[];
    descriptionMatches: string[];
    fieldMatches?: Record<string, string[]>;
  };
}

export interface SearchFilters {
  type?: 'all' | 'project' | 'media' | 'testimonial';
  category?: string;
  status?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface SearchContextType {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  isSearching: boolean;
  recentSearches: string[];
  suggestions: string[];
  popularSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearSearch: () => void;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  highlightText: (text: string, query: string) => React.ReactNode;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch doit être utilisé à l\'intérieur d\'un SearchProvider');
  }
  return context;
};



export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchHistory: recentSearches, addToHistory, clearHistory } = useSearchHistory();
  const { suggestions } = useSearchSuggestions(query);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);



  // Fonction de recherche principale
  const search = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    setIsSearching(true);
    
    try {
      const finalFilters = { ...filters, ...searchFilters };
      const searchResults = await searchService.search(searchQuery, finalFilters);
      
      setResults(searchResults);
      setQuery(searchQuery);
      setFilters(finalFilters);
      
      // Ajouter à l'historique si la recherche n'est pas vide
      if (searchQuery.trim()) {
        addToHistory(searchQuery);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  // Les suggestions sont maintenant gérées par le hook useSearchSuggestions

  // Charger les recherches populaires au démarrage
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const popular = await searchService.getPopularSearches();
        setPopularSearches(popular);
      } catch (error) {
        console.error('Erreur lors du chargement des recherches populaires:', error);
      }
    };

    loadPopularSearches();
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    // Pas besoin de setSuggestions car les suggestions sont gérées par le hook useSearchSuggestions
  }, []);

  const addToRecentSearches = useCallback((searchQuery: string) => {
    addToHistory(searchQuery);
  }, [addToHistory]);

  const clearRecentSearches = useCallback(async () => {
    clearHistory();
    await searchService.clearSearchHistory();
  }, [clearHistory]);

  const highlightText = useCallback((text: string, searchQuery: string) => {
    return <HighlightedText text={text} query={searchQuery} />;
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        filters,
        results,
        isSearching,
        recentSearches,
        suggestions,
        popularSearches,
        setQuery,
        setFilters,
        search,
        clearSearch,
        addToRecentSearches,
        clearRecentSearches,
        highlightText
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};