import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Données simulées pour le graphique
const visitData = [
  { date: '01/07', visits: 120, uniqueVisitors: 80 },
  { date: '02/07', visits: 140, uniqueVisitors: 95 },
  { date: '03/07', visits: 135, uniqueVisitors: 90 },
  { date: '04/07', visits: 180, uniqueVisitors: 120 },
  { date: '05/07', visits: 190, uniqueVisitors: 130 },
  { date: '06/07', visits: 170, uniqueVisitors: 110 },
  { date: '07/07', visits: 200, uniqueVisitors: 140 },
];

const VisitorsChart: React.FC = () => {
  // Calculer les totaux
  const totalVisits = visitData.reduce((sum, day) => sum + day.visits, 0);
  const totalUniqueVisitors = visitData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
  
  // Calculer la moyenne
  const avgVisitsPerDay = Math.round(totalVisits / visitData.length);
  
  // Calculer la croissance (comparaison entre le premier et le dernier jour)
  const growthRate = Math.round(
    ((visitData[visitData.length - 1].visits - visitData[0].visits) / visitData[0].visits) * 100
  );

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Visiteurs du Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div>
            <div className="text-sm text-gray-500">Visites totales (7 jours)</div>
            <div className="text-2xl font-bold">{totalVisits}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Visiteurs uniques</div>
            <div className="text-2xl font-bold">{totalUniqueVisitors}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Moyenne par jour</div>
            <div className="text-2xl font-bold">{avgVisitsPerDay}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Croissance</div>
            <div className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate}%
            </div>
          </div>
        </div>
        
        {/* Graphique simplifié (sans recharts) */}
        <div className="relative h-60 mt-4">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-48">
            {visitData.map((day, index) => {
              // Calculer la hauteur relative des barres
              const visitsHeight = (day.visits / 200) * 100; // 200 est la valeur max
              const uniqueHeight = (day.uniqueVisitors / 200) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center group" style={{ width: `${100 / visitData.length}%` }}>
                  <div className="relative w-full px-1">
                    {/* Barre des visites */}
                    <div 
                      className="w-full bg-blue-500 opacity-80 rounded-t"
                      style={{ height: `${visitsHeight}%` }}
                    ></div>
                    
                    {/* Barre des visiteurs uniques */}
                    <div 
                      className="w-full bg-blue-700 absolute bottom-0 rounded-t"
                      style={{ height: `${uniqueHeight}%` }}
                    ></div>
                    
                    {/* Tooltip au survol */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Visites: {day.visits}<br />
                      Uniques: {day.uniqueVisitors}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{day.date}</div>
                </div>
              );
            })}
          </div>
          
          {/* Légende */}
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 opacity-80 mr-1"></div>
              <span className="text-xs text-gray-500">Visites</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-700 mr-1"></div>
              <span className="text-xs text-gray-500">Visiteurs uniques</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorsChart;