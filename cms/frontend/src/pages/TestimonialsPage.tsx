import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chat, Plus } from 'react-iconly';
import { useState } from 'react';
import PreviewButton from '@/components/preview/PreviewButton';

export default function TestimonialsPage() {
  // Données mock pour les témoignages
  const [testimonials, setTestimonials] = useState([
    {
      id: '1',
      name: 'Jean Dupont',
      position: 'CEO',
      company: 'Entreprise ABC',
      content: 'Excellent travail ! Je recommande vivement les services de Victor.',
      photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      isActive: true
    },
    {
      id: '2',
      name: 'Marie Martin',
      position: 'Directrice Marketing',
      company: 'XYZ Corp',
      content: 'Une collaboration très professionnelle et des résultats qui dépassent nos attentes.',
      photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      isActive: true
    },
    {
      id: '3',
      name: 'Pierre Durand',
      position: 'Fondateur',
      company: 'Startup Innovante',
      content: 'Victor a su comprendre nos besoins et y répondre parfaitement.',
      photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      isActive: false
    }
  ]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-gray-600 mt-2">
            Gérez les témoignages de vos clients
          </p>
        </div>
        <div className="flex space-x-2">
          <PreviewButton 
            type="testimonials" 
            data={{ testimonials }} 
          />
          <Button>
            <Plus size="small" primaryColor="#ffffff" />
            <span className="ml-2">Nouveau Témoignage</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Témoignages
            </CardTitle>
            <Chat size="medium" primaryColor="#10b981" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <p className="text-xs text-muted-foreground">
              +1 ce mois-ci
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actifs
            </CardTitle>
            <Chat size="medium" primaryColor="#3b82f6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">6</div>
            <p className="text-xs text-muted-foreground">
              Affichés sur le site
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Note Moyenne
            </CardTitle>
            <Chat size="medium" primaryColor="#f59e0b" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4.9</div>
            <p className="text-xs text-muted-foreground">
              ⭐⭐⭐⭐⭐
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Témoignages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Chat size="large" primaryColor="#9ca3af" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Gestion des témoignages
            </h3>
            <p className="mt-2 text-gray-600">
              Cette section permettra de gérer tous les témoignages de vos clients.
            </p>
            <Button className="mt-4">
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Ajouter votre premier témoignage</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}