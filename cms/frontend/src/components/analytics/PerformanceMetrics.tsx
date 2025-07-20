import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Données simulées pour les métriques de performance
const performanceData = {
  loadTime: 1.2, // en secondes
  firstContentfulPaint: 0.8, // en secondes
  largestContentfulPaint: 1.5, // en secondes
  cumulativeLayoutShift: 0.02,
  seoScore: 92,
  accessibilityScore: 88,
  bestPracticesScore: 95,
  performanceScore: 87,
};

const PerformanceMetrics: React.FC = () => {
  // Fonction pour déterminer la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métriques de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Temps de chargement</div>
            <div className="text-2xl font-bold">{performanceData.loadTime}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">First Contentful Paint</div>
            <div className="text-2xl font-bold">{performanceData.firstContentfulPaint}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Largest Contentful Paint</div>
            <div className="text-2xl font-bold">{performanceData.largestContentfulPaint}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Cumulative Layout Shift</div>
            <div className="text-2xl font-bold">{performanceData.cumulativeLayoutShift}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Scores Lighthouse</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span className={getScoreColor(performanceData.performanceScore)}>
                  {performanceData.performanceScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    performanceData.performanceScore >= 90 ? 'bg-green-600' : 
                    performanceData.performanceScore >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${performanceData.performanceScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>SEO</span>
                <span className={getScoreColor(performanceData.seoScore)}>
                  {performanceData.seoScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    performanceData.seoScore >= 90 ? 'bg-green-600' : 
                    performanceData.seoScore >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${performanceData.seoScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Accessibilité</span>
                <span className={getScoreColor(performanceData.accessibilityScore)}>
                  {performanceData.accessibilityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    performanceData.accessibilityScore >= 90 ? 'bg-green-600' : 
                    performanceData.accessibilityScore >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${performanceData.accessibilityScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Bonnes pratiques</span>
                <span className={getScoreColor(performanceData.bestPracticesScore)}>
                  {performanceData.bestPracticesScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    performanceData.bestPracticesScore >= 90 ? 'bg-green-600' : 
                    performanceData.bestPracticesScore >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${performanceData.bestPracticesScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;