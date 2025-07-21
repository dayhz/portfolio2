import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '../../contexts/SearchContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HighlightedText from './HighlightedText';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onResultClick?: (result: SearchResult) => void;
  groupByType?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  query, 
  onResultClick,
  groupByType = true 
}) => {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
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

  if (results.length === 0) {
    return null;
  }

  if (!groupByType) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            query={query}
            onClick={() => handleResultClick(result)}
            getResultIcon={getResultIcon}
            getTypeLabel={getTypeLabel}
            getTypeBadgeColor={getTypeBadgeColor}
          />
        ))}
      </div>
    );
  }

  // Grouper les résultats par type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type}>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">{getResultIcon(type)}</span>
            <h2 className="text-lg font-semibold text-gray-900">
              {getTypeLabel(type)}s ({typeResults.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                query={query}
                onClick={() => handleResultClick(result)}
                getResultIcon={getResultIcon}
                getTypeLabel={getTypeLabel}
                getTypeBadgeColor={getTypeBadgeColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
  getResultIcon: (type: string) => string;
  getTypeLabel: (type: string) => string;
  getTypeBadgeColor: (type: string) => string;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  query,
  onClick,
  getResultIcon,
  getTypeLabel,
  getTypeBadgeColor
}) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                <HighlightedText text={result.title} query={query} />
              </h3>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getTypeBadgeColor(result.type)}`}
              >
                {getTypeLabel(result.type)}
              </Badge>
            </div>
            
            {result.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                <HighlightedText text={result.description} query={query} />
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                {result.category && (
                  <span className="capitalize">{result.category}</span>
                )}
                {result.status && (
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                )}
              </div>
              {result.createdAt && (
                <span>
                  {new Date(result.createdAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            
            {/* Score de pertinence (toujours visible en mode développement) */}
            <div className="mt-1">
              <span className="text-xs text-gray-400">
                Score: {result.relevanceScore}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;