import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchResult } from '../../contexts/SearchContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SearchStatsProps {
  results: SearchResult[];
  query: string;
}

const SearchStats: React.FC<SearchStatsProps> = ({ results, query }) => {
  if (!results.length) return null;

  // Statistiques par type
  const typeStats = results.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeStats).map(([name, value]) => ({
    name: name === 'project' ? 'Projets' : name === 'media' ? 'Médias' : 'Témoignages',
    value
  }));

  // Statistiques par catégorie
  const categoryStats = results.reduce((acc, result) => {
    if (result.category) {
      acc[result.category] = (acc[result.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 catégories

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Statistiques de recherche pour "{query}"</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            <p>{results.length} résultat(s) trouvé(s)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribution par type */}
            <div>
              <h4 className="text-sm font-medium mb-2">Distribution par type</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {typeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} résultat(s)`, 'Nombre']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top catégories */}
            {categoryData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Top catégories</h4>
                <div className="space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm capitalize">{category.name}</span>
                      <span className="ml-auto text-sm text-gray-500">{category.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchStats;