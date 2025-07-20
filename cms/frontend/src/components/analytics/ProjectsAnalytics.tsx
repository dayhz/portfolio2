import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Données simulées pour les projets
const projectsData = {
  totalProjects: 12,
  publishedProjects: 8,
  draftProjects: 3,
  archivedProjects: 1,
  categories: [
    { name: 'Site Web', count: 5, color: 'bg-blue-100 text-blue-800' },
    { name: 'Mobile', count: 3, color: 'bg-green-100 text-green-800' },
    { name: 'Produit', count: 4, color: 'bg-purple-100 text-purple-800' },
  ],
  mostViewed: [
    { name: 'Zesty', views: 1245, category: 'Site Web' },
    { name: 'Booksprout', views: 987, category: 'Site Web' },
    { name: 'FinanceBank', views: 756, category: 'Mobile' },
  ],
};

const ProjectsAnalytics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des Projets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Total Projets</div>
            <div className="text-2xl font-bold">{projectsData.totalProjects}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Projets Publiés</div>
            <div className="text-2xl font-bold text-green-600">{projectsData.publishedProjects}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Brouillons</div>
            <div className="text-2xl font-bold text-yellow-600">{projectsData.draftProjects}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Archivés</div>
            <div className="text-2xl font-bold text-gray-600">{projectsData.archivedProjects}</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Répartition par catégorie</h3>
          <div className="flex items-center space-x-2">
            {projectsData.categories.map((category) => (
              <Badge key={category.name} variant="secondary" className={category.color}>
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Projets les plus consultés</h3>
          <div className="space-y-2">
            {projectsData.mostViewed.map((project, index) => (
              <div key={project.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 mr-2">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.category}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {project.views.toLocaleString()} vues
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsAnalytics;