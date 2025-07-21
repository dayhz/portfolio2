import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlobalSearch from '../components/search/GlobalSearch';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchStats from '../components/search/SearchStats';
import SearchShortcuts from '../components/search/SearchShortcuts';
import { Search, Filter, ArrowLeft } from 'react-iconly';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { results, isSearching, search, query, filters } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const isAuthenticated = localStorage.getItem('auth-token') !== null;

  // Récupérer la requête depuis l'URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      search(urlQuery);
    }
  }, [searchParams, search, query]);

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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'media':
        return 'bg-green-100 text-green-800';
      case 'testimonial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResultClick = (result: any) => {
    if (!isAuthenticated) {
      // Si l'utilisateur n'est pas authentifié, on lui demande de se connecter
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
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
  };

  // Utiliser le composant HighlightedText pour la mise en évidence

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {location.pathname !== '/search' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size="medium" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Résultats de recherche</h1>
          {query && (
            <p className="text-gray-600 mt-1">
              Recherche pour "{query}" • {results.length} résultat{results.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter size="small" />
          <span>Filtres</span>
          {Object.keys(filters).filter(key => 
            filters[key as keyof typeof filters] && 
            !(key === 'type' && filters[key as keyof typeof filters] === 'all') &&
            !(key === 'sortBy' && filters[key as keyof typeof filters] === 'relevance') &&
            !(key === 'sortOrder' && filters[key as keyof typeof filters] === 'desc')
          ).length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {Object.keys(filters).filter(key => 
                filters[key as keyof typeof filters] && 
                !(key === 'type' && filters[key as keyof typeof filters] === 'all') &&
                !(key === 'sortBy' && filters[key as keyof typeof filters] === 'relevance') &&
                !(key === 'sortOrder' && filters[key as keyof typeof filters] === 'desc')
              ).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Barre de recherche - affichée uniquement dans le layout protégé */}
      {location.pathname !== '/search' && (
        <div className="flex justify-center">
          <GlobalSearch showFilters={false} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtres */}
        {showFilters && (
          <div className="lg:col-span-1">
            <SearchFilters onClose={() => setShowFilters(false)} />
          </div>
        )}

        {/* Résultats */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-gray-600">Recherche en cours...</span>
            </div>
          )}

          {!isSearching && query && results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search set="light" size="large" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Aucun résultat trouvé
                </h3>
                <p className="mt-2 text-gray-600">
                  Aucun résultat trouvé pour "{query}". Essayez avec d'autres mots-clés ou modifiez vos filtres.
                </p>
              </CardContent>
            </Card>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-6">
              {/* Statistiques de recherche */}
              <SearchStats results={results} query={query} />
              
              {/* Résultats de recherche */}
              <SearchResults 
                results={results} 
                query={query} 
                onResultClick={handleResultClick}
                groupByType={true}
              />
            </div>
          )}

          {!query && (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <Search set="light" size="large" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Commencez votre recherche
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Utilisez la barre de recherche ci-dessus pour trouver vos projets, médias et témoignages.
                  </p>
                  {!isAuthenticated && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/login')}
                        variant="outline"
                      >
                        Se connecter pour accéder à plus de fonctionnalités
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Raccourcis de recherche - uniquement pour les utilisateurs authentifiés */}
              {isAuthenticated && <SearchShortcuts />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;