import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, X } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  recentSearches: string[];
  popularSearches: string[];
  onSuggestionClick: (suggestion: string) => void;
  onClearRecentSearches?: () => void;
  showRecentSearches?: boolean;
  showPopularSearches?: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  recentSearches,
  popularSearches,
  onSuggestionClick,
  onClearRecentSearches,
  showRecentSearches = true,
  showPopularSearches = true
}) => {
  if (suggestions.length === 0 && recentSearches.length === 0 && popularSearches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Suggestions basées sur la saisie */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recherches récentes */}
      {showRecentSearches && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Recherches récentes</h4>
            </div>
            {onClearRecentSearches && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearRecentSearches}
                className="text-xs h-6 px-2"
              >
                <X size={12} className="mr-1" />
                Effacer
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((recentQuery, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(recentQuery)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center space-x-2"
              >
                <Clock size={14} className="text-gray-400" />
                <span>{recentQuery}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recherches populaires */}
      {showPopularSearches && popularSearches.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={16} className="text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700">Recherches populaires</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.slice(0, 8).map((popularQuery, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSuggestionClick(popularQuery)}
              >
                <TrendingUp size={12} className="mr-1" />
                {popularQuery}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;