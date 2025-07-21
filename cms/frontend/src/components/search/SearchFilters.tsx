import React from 'react';
import { useSearch, SearchFilters as SearchFiltersType } from '../../contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Calendar } from 'react-iconly';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  onClose?: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onClose }) => {
  const { filters, setFilters, search, query } = useSearch();

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Relancer la recherche si il y a une requête
    if (query.trim()) {
      search(query, newFilters);
    }
  };

  const clearFilters = () => {
    const defaultFilters: SearchFiltersType = {
      type: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    
    if (query.trim()) {
      search(query, defaultFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size="small" primaryColor="#6b7280" />
            <CardTitle className="text-sm">Filtres de recherche</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-7"
              >
                Effacer
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0"
              >
                <X size="small" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type de contenu */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Type de contenu
          </label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="project">Projets</SelectItem>
              <SelectItem value="media">Médias</SelectItem>
              <SelectItem value="testimonial">Témoignages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Catégorie
          </label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleFilterChange('category', value || undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              <SelectItem value="website">Site Web</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="product">Produit</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Vidéo</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statut */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Statut
          </label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre par date simplifié */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Période
          </label>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant={!filters.dateRange ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => handleFilterChange('dateRange', undefined)}
              className="text-xs"
            >
              Tout
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                handleFilterChange('dateRange', { start: lastWeek, end: today });
              }}
              className="text-xs"
            >
              7j
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                handleFilterChange('dateRange', { start: lastMonth, end: today });
              }}
              className="text-xs"
            >
              30j
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                handleFilterChange('dateRange', { start: lastYear, end: today });
              }}
              className="text-xs"
            >
              1an
            </Button>
          </div>
        </div>

        {/* Tri */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Trier par
            </label>
            <Select
              value={filters.sortBy || 'relevance'}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Pertinence</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Ordre
            </label>
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Décroissant</SelectItem>
                <SelectItem value="asc">Croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Filtres actifs
            </label>
            <div className="flex flex-wrap gap-1">
              {filters.type && filters.type !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Type: {filters.type}
                  <button
                    onClick={() => handleFilterChange('type', 'all')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size="small" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="outline" className="text-xs">
                  Catégorie: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size="small" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="text-xs">
                  Statut: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', undefined)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size="small" />
                  </button>
                </Badge>
              )}
              {filters.dateRange?.start && (
                <Badge variant="outline" className="text-xs">
                  Depuis: {filters.dateRange.start.toLocaleDateString('fr-FR')}
                  <button
                    onClick={() => {
                      const newDateRange = { ...filters.dateRange, start: undefined };
                      handleFilterChange('dateRange', Object.keys(newDateRange).length > 0 ? newDateRange : undefined);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateRange?.end && (
                <Badge variant="outline" className="text-xs">
                  Jusqu'à: {filters.dateRange.end.toLocaleDateString('fr-FR')}
                  <button
                    onClick={() => {
                      const newDateRange = { ...filters.dateRange, end: undefined };
                      handleFilterChange('dateRange', Object.keys(newDateRange).length > 0 ? newDateRange : undefined);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;