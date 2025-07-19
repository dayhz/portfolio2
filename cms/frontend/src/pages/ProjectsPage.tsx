import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Work, Plus } from 'react-iconly';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos projets portfolio
          </p>
        </div>
        <Button>
          <Plus size="small" primaryColor="#ffffff" />
          <span className="ml-2">Nouveau Projet</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Projets
            </CardTitle>
            <Work size="medium" primaryColor="#3b82f6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois-ci
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Publiés
            </CardTitle>
            <Work size="medium" primaryColor="#10b981" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">10</div>
            <p className="text-xs text-muted-foreground">
              83% du total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Brouillons
            </CardTitle>
            <Work size="medium" primaryColor="#f59e0b" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2</div>
            <p className="text-xs text-muted-foreground">
              En cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Projets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Work size="large" primaryColor="#9ca3af" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Gestion des projets
            </h3>
            <p className="mt-2 text-gray-600">
              Cette section permettra de gérer tous vos projets portfolio.
            </p>
            <Button className="mt-4">
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Créer votre premier projet</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}