import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Eye, 
  Save, 
  RotateCcw,
  Settings,
  FileText,
  Users,
  Briefcase,
  Target,
  MessageSquare,
  Phone
} from 'lucide-react';
import { HeroEditor } from '../components/homepage/HeroEditor';
import { BrandsEditor } from '../components/homepage/BrandsEditor';
import { HeroSection, BrandsSection } from '../../../shared/types/homepage';

type HomepageSection = 'dashboard' | 'hero' | 'brands' | 'services' | 'offer' | 'testimonials' | 'footer';

interface SectionCard {
  id: HomepageSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'draft' | 'empty';
  lastModified?: string;
}

export default function HomepagePage() {
  const [activeSection, setActiveSection] = useState<HomepageSection>('dashboard');
  const [previewData, setPreviewData] = useState<any>(null);

  const sections: SectionCard[] = [
    {
      id: 'hero',
      title: 'Section Hero',
      description: 'Titre principal, description et vidéo de fond',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 2 heures'
    },
    {
      id: 'brands',
      title: 'Clients & Marques',
      description: 'Logos et noms de vos clients',
      icon: <Users className="h-5 w-5" />,
      status: 'draft',
      lastModified: 'Il y a 1 jour'
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Vos 3 services principaux',
      icon: <Briefcase className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 3 jours'
    },
    {
      id: 'offer',
      title: 'Proposition de Valeur',
      description: 'Points clés de votre offre',
      icon: <Target className="h-5 w-5" />,
      status: 'draft',
      lastModified: 'Il y a 1 semaine'
    },
    {
      id: 'testimonials',
      title: 'Témoignages',
      description: 'Avis et retours clients',
      icon: <MessageSquare className="h-5 w-5" />,
      status: 'empty'
    },
    {
      id: 'footer',
      title: 'Footer',
      description: 'Informations de contact et liens',
      icon: <Phone className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 2 semaines'
    }
  ];

  const getStatusColor = (status: SectionCard['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'empty':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: SectionCard['status']) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'draft':
        return 'Brouillon';
      case 'empty':
        return 'Vide';
      default:
        return 'Inconnu';
    }
  };

  const handlePreview = (data: any) => {
    setPreviewData(data);
    // TODO: Open preview modal or navigate to preview page
    console.log('Preview data:', data);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Home className="h-8 w-8" />
            Homepage CMS
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez le contenu de votre page d'accueil en toute simplicité
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Prévisualiser
          </Button>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Publier les changements
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sections</p>
                <p className="text-2xl font-bold">{sections.length}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complétées</p>
                <p className="text-2xl font-bold text-green-600">
                  {sections.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sections.filter(s => s.status === 'draft').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vides</p>
                <p className="text-2xl font-bold text-gray-600">
                  {sections.filter(s => s.status === 'empty').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveSection(section.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(section.status)}>
                  {getStatusText(section.status)}
                </Badge>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {section.lastModified && (
                <p className="text-sm text-gray-500">
                  Modifié {section.lastModified}
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection(section.id);
                }}
              >
                Éditer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSectionEditor = () => {
    switch (activeSection) {
      case 'hero':
        return <HeroEditor onPreview={handlePreview} />;
      case 'brands':
        return <BrandsEditor onPreview={handlePreview} />;
      case 'services':
        return (
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Section Services</CardTitle>
              <CardDescription>Fonctionnalité à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                L'éditeur pour la section services sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        );
      case 'offer':
        return (
          <Card>
            <CardHeader>
              <CardTitle>🎯 Section Proposition de Valeur</CardTitle>
              <CardDescription>Fonctionnalité à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                L'éditeur pour la section proposition de valeur sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        );
      case 'testimonials':
        return (
          <Card>
            <CardHeader>
              <CardTitle>💬 Section Témoignages</CardTitle>
              <CardDescription>Fonctionnalité à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                L'éditeur pour la section témoignages sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        );
      case 'footer':
        return (
          <Card>
            <CardHeader>
              <CardTitle>📞 Section Footer</CardTitle>
              <CardDescription>Fonctionnalité à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                L'éditeur pour la section footer sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      {activeSection !== 'dashboard' && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveSection('dashboard')}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retour au Dashboard
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Homepage CMS</span>
            <span>/</span>
            <span className="font-medium">
              {sections.find(s => s.id === activeSection)?.title}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {renderSectionEditor()}
    </div>
  );
}