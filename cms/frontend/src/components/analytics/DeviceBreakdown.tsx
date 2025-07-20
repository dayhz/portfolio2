import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Données simulées pour la répartition des appareils
const deviceData = {
  devices: [
    { name: 'Desktop', percentage: 45, color: '#3b82f6' },
    { name: 'Mobile', percentage: 42, color: '#10b981' },
    { name: 'Tablet', percentage: 13, color: '#f59e0b' },
  ],
  browsers: [
    { name: 'Chrome', percentage: 58, color: '#3b82f6' },
    { name: 'Safari', percentage: 22, color: '#10b981' },
    { name: 'Firefox', percentage: 12, color: '#f59e0b' },
    { name: 'Edge', percentage: 6, color: '#8b5cf6' },
    { name: 'Autres', percentage: 2, color: '#6b7280' },
  ],
};

const DeviceBreakdown: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Visiteurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Par Appareil</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              {/* Graphique en anneau */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {deviceData.devices.map((device, index) => {
                  // Calculer les angles pour le segment d'arc
                  const startAngle = index === 0 ? 0 : 
                    deviceData.devices
                      .slice(0, index)
                      .reduce((sum, d) => sum + d.percentage, 0) / 100 * 360;
                  
                  const endAngle = startAngle + (device.percentage / 100 * 360);
                  
                  // Convertir les angles en coordonnées pour l'arc SVG
                  const startRad = (startAngle - 90) * Math.PI / 180;
                  const endRad = (endAngle - 90) * Math.PI / 180;
                  
                  const x1 = 50 + 40 * Math.cos(startRad);
                  const y1 = 50 + 40 * Math.sin(startRad);
                  const x2 = 50 + 40 * Math.cos(endRad);
                  const y2 = 50 + 40 * Math.sin(endRad);
                  
                  // Déterminer si l'arc est grand (plus de 180 degrés)
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={device.name}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={device.color}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {deviceData.devices.map((device) => (
              <div key={device.name} className="flex items-center">
                <div 
                  className="w-3 h-3 mr-1 rounded-full" 
                  style={{ backgroundColor: device.color }}
                ></div>
                <span className="text-xs text-gray-600">
                  {device.name} ({device.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Par Navigateur</h3>
          <div className="space-y-3">
            {deviceData.browsers.map((browser) => (
              <div key={browser.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{browser.name}</span>
                  <span>{browser.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ width: `${browser.percentage}%`, backgroundColor: browser.color }}
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

export default DeviceBreakdown;