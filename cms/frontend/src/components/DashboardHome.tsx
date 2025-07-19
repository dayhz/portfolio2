import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work, Chat, Image, Calendar } from 'react-iconly';

export default function DashboardHome() {
  const stats = [
    {
      title: 'Total Projets',
      value: '12',
      icon: Work,
      color: '#3b82f6',
    },
    {
      title: 'Témoignages',
      value: '8',
      icon: Chat,
      color: '#10b981',
    },
    {
      title: 'Médias',
      value: '156',
      icon: Image,
      color: '#f59e0b',
    },
    {
      title: 'Dernière MAJ',
      value: 'Aujourd\'hui',
      icon: Calendar,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue dans votre système de gestion de portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon size="medium" primaryColor={stat.color} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Ajouter un nouveau projet</div>
              <div className="text-sm text-gray-600">
                Créer un nouveau projet pour votre portfolio
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Gérer les médias</div>
              <div className="text-sm text-gray-600">
                Upload et organiser vos images et vidéos
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Ajouter un témoignage</div>
              <div className="text-sm text-gray-600">
                Nouveau témoignage client
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Projet "Zesty" mis à jour</div>
                  <div className="text-xs text-gray-500">Il y a 2 heures</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Nouveau témoignage ajouté</div>
                  <div className="text-xs text-gray-500">Hier</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Images optimisées</div>
                  <div className="text-xs text-gray-500">Il y a 2 jours</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}