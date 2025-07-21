import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'react-iconly';
import { X, Clock, TrendingUp } from 'lucide-react';
import { useSearchDebounce } from '../../hooks/useSearchDebounce';
import HighlightedText from './HighlightedText';

interface GlobalSearchProps {
  placeholder?: string;
  showFilters?: boolean;
  onResultClick?: (result: any) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  placeholder = "Rechercher dans vos projets, médias, témoignages...",
  showFilters = true,
  onResultClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    query,
    results,
    isSearching,
    recentSearches,
    suggestions,
    search,
    clearSearch,
    setQuery
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer la recherche quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Raccourci clavier pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowAdvancedFilters(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await search(searchQuery);
      setIsOpen(true);
    } else {
      clearSearch();
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      setIsOpen(true);
    } else {
      clearSearch();
      setIsOpen(false);
    }
  };
  
  // Utiliser le hook de debounce pour la recherche
  const debouncedQuery = useSearchDebounce(query, 300);
  
  // Effectuer la recherche lorsque la valeur debouncée change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleResultClick = (result: any) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Vérifier si l'utilisateur est authentifié
      const isAuthenticated = localStorage.getItem('auth-token') !== null;
      
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion
        navigate('/login', { state: { from: location.pathname } });
        setIsOpen(false);
        return;
      }
      
      // Navigation par défaut selon le type
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
    }
    setIsOpen(false);
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'media':
        return '🖼️';
      case 'testimonial':
        return '💬';
      default:
        return '📄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Projet';
      case 'media':
        return 'Média';
      case 'testimonial':
        return 'Témoignage';
      default:
        return 'Élément';
    }
  };

  // Utiliser le composant HighlightedText pour la mise en évidence

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size="small" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearch();
                setIsOpen(false);
              }}
              className="h-6 w-6 p-0"
            >
              <X size="small" />
            </Button>
          )}
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-6 w-6 p-0"
            >
              <Filter size="small" />
            </Button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden"
          >
            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Recherche en cours...
              </div>
            )}

            {!isSearching && query && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-2 border-b bg-gray-50">
                  <span className="text-xs font-medium text-gray-600">
                    {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                  </span>
                </div>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            <HighlightedText text={result.title} query={query} />
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            <HighlightedText text={result.description} query={query} />
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {result.category && (
                            <span className="text-xs text-gray-500">
                              {result.category}
                            </span>
                          )}
                          {result.createdAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(result.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isSearching && query && results.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search set="light" size="large" />
                <p className="mt-2 text-sm">Aucun résultat trouvé pour "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Recherches récentes</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      {recentQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!query && suggestions.length > 0 && (
              <div className="p-3 border-t">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRecentSearchClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default GlobalSearch;