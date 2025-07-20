import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Données simulées pour l'utilisation des médias
const mediaData = {
  totalSize: 1.2, // en GB
  totalFiles: 156,
  types: [
    { type: 'Images', count: 120, size: 0.8, color: '#3b82f6' },
    { type: 'Vidéos', count: 15, size: 0.35, color: '#10b981' },
    { type: 'Documents', count: 21, size: 0.05, color: '#f59e0b' },
  ],
  quota: 10, // en GB
};

const MediaUsageChart: React.FC = () => {
  // Calculer le pourcentage d'utilisation
  const usagePercentage = (mediaData.totalSize / mediaData.quota) * 100;
  
  // Calculer les pourcentages par type
  const typePercentages = mediaData.types.map(type => ({
    ...type,
    percentage: (type.size / mediaData.totalSize) * 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisation des Médias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-gray-500">Espace utilisé</div>
            <div className="text-sm font-medium">
              {mediaData.totalSize.toFixed(1)} GB / {mediaData.quota} GB
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${usagePercentage > 80 ? 'bg-red-600' : 'bg-blue-600'}`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {usagePercentage.toFixed(1)}% utilisé
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Total Fichiers</div>
            <div className="text-2xl font-bold">{mediaData.totalFiles}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Images</div>
            <div className="text-2xl font-bold text-blue-600">{mediaData.types[0].count}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Vidéos</div>
            <div className="text-2xl font-bold text-green-600">{mediaData.types[1].count}</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Répartition par type</h3>
          <div className="space-y-3">
            {typePercentages.map((type) => (
              <div key={type.type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{type.type}</span>
                  <span>{type.size.toFixed(2)} GB ({type.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ width: `${type.percentage}%`, backgroundColor: type.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUsageChart;