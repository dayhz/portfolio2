import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  FileText,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { servicesAPI } from '../api/services';
import { ServicesGridEditor } from '../components/services/ServicesGridEditor';
import { SkillsVideoEditor } from '../components/services/SkillsVideoEditor';
import { ServicesGridData, SkillsVideoData } from '../../../shared/types/services';

type ActiveSection = 'dashboard' | 'hero' | 'grid' | 'skills';

export default function ServicesPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Hero section data - chargé depuis l'API
  const [heroData, setHeroData] = useState({
    title: 'Services de développement web',
    description: 'Description par défaut de la section hero...',
    highlightText: '17+ years'
  });

  // Grid section data - chargé depuis l'API
  const [gridData, setGridData] = useState<ServicesGridData>({
    services: []
  });

  // Skills section data - chargé depuis l'API
  const [skillsData, setSkillsData] = useState<SkillsVideoData>({
    description: "My work adapts to each client's unique goals, and whether it's a website, a product, or a mobile app, I'm proficient in all the areas of expertise listed below.",
    skills: [],
    ctaText: "See all projects",
    ctaUrl: "/work",
    video: {
      url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/services-slideshow-small.mp4",
      caption: "Some of my work across the years — Lawson Sydney",
      autoplay: true,
      loop: true,
      muted: true
    }
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les données Hero
        const heroResponse = await servicesAPI.getSection('hero');
        if (heroResponse.success && heroResponse.data) {
          setHeroData(heroResponse.data);
        }

        // Charger les données Grid (section 'services' dans l'API)
        const gridResponse = await servicesAPI.getSection('services');
        if (gridResponse.success && gridResponse.data) {
          setGridData(gridResponse.data);
        }

        // Charger les données Skills (section 'skills' dans l'API)
        const skillsResponse = await servicesAPI.getSection('skills');
        if (skillsResponse.success && skillsResponse.data) {
          setSkillsData(skillsResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de charger les données des sections'
        });
        // Fallback vers des données par défaut
        setHeroData({
          title: 'Services de développement web',
          description: 'Description par défaut de la section hero...',
          highlightText: '17+ years'
        });
        setGridData({
          services: []
        });
        setSkillsData({
          description: "My work adapts to each client's unique goals, and whether it's a website, a product, or a mobile app, I'm proficient in all the areas of expertise listed below.",
          skills: [],
          ctaText: "See all projects",
          ctaUrl: "/work",
          video: {
            url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/services-slideshow-small.mp4",
            caption: "Some of my work across the years — Lawson Sydney",
            autoplay: true,
            loop: true,
            muted: true
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleHeroSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Sauvegarder via l'API
      const response = await servicesAPI.updateSection('hero', heroData);
      
      if (response.success) {
        setLastSaveTime(new Date());
        toast.success('Section Hero sauvegardée', {
          description: `Titre: "${heroData.title.substring(0, 30)}..."`
        });
        
        // Publier automatiquement les changements
        await servicesAPI.publish();
        toast.success('Changements publiés', {
          description: 'Les modifications sont maintenant visibles sur le site'
        });
      } else {
        throw new Error('Échec de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Une erreur est survenue lors de la sauvegarde'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGridSave = async (data: ServicesGridData) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Sauvegarder via l'API (section 'services' dans l'API)
      const response = await servicesAPI.updateSection('services', data);
      
      if (response.success) {
        setGridData(data);
        setLastSaveTime(new Date());
        toast.success('Section Grid sauvegardée', {
          description: `${data.services.length} service(s) configuré(s)`
        });
        
        // Publier automatiquement les changements
        await servicesAPI.publish();
        toast.success('Changements publiés', {
          description: 'Les modifications sont maintenant visibles sur le site'
        });
      } else {
        throw new Error('Échec de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Une erreur est survenue lors de la sauvegarde'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillsSave = async (data: SkillsVideoData) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Sauvegarder via l'API (section 'skills' dans l'API)
      const response = await servicesAPI.updateSection('skills', data);
      
      if (response.success) {
        setSkillsData(data);
        setLastSaveTime(new Date());
        toast.success('Section Skills & Video sauvegardée', {
          description: `${data.skills.length} compétence(s) configurée(s)`
        });
        
        // Publier automatiquement les changements
        await servicesAPI.publish();
        toast.success('Changements publiés', {
          description: 'Les modifications sont maintenant visibles sur le site'
        });
      } else {
        throw new Error('Échec de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Une erreur est survenue lors de la sauvegarde'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-6 w-6 lg:h-8 lg:w-8" />
          Services Page CMS
        </h1>
        <p className="text-gray-600 mt-2">
          Intégration progressive - Version simplifiée
        </p>
        {lastSaveTime && (
          <p className="text-xs text-gray-500 mt-1">
            Dernière sauvegarde: {lastSaveTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={() => setActiveSection('hero')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-base lg:text-lg">Section Hero</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Disponible
              </Badge>
            </div>
            <CardDescription className="text-sm">
              Titre principal et description de la page Services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSection('hero');
              }}
            >
              <Edit3 className="h-4 w-4" />
              Éditer
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={() => setActiveSection('grid')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <CardTitle className="text-base lg:text-lg">Section Grid</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Disponible
              </Badge>
            </div>
            <CardDescription className="text-sm">
              Grille des services avec couleurs personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {gridData.services.length} service(s) configuré(s)
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('grid');
                }}
              >
                <Edit3 className="h-4 w-4" />
                Éditer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={() => setActiveSection('skills')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-base lg:text-lg">Section Skills & Video</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Disponible
              </Badge>
            </div>
            <CardDescription className="text-sm">
              Compétences et vidéo de présentation de votre travail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {skillsData.skills.length} compétence(s) configurée(s)
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('skills');
                }}
              >
                <Edit3 className="h-4 w-4" />
                Éditer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHeroEditor = () => (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">
          Éditeur Section Hero
        </h2>
        
        <div className="space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="hero-title">Titre principal</Label>
            <Input
              id="hero-title"
              value={heroData.title}
              onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Entrez le titre principal..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="hero-description">Description</Label>
            <Textarea
              id="hero-description"
              value={heroData.description}
              onChange={(e) => setHeroData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Entrez la description..."
              rows={4}
            />
          </div>

          {/* Texte en surbrillance */}
          <div className="space-y-2">
            <Label htmlFor="hero-highlight">Texte en surbrillance</Label>
            <Input
              id="hero-highlight"
              value={heroData.highlightText}
              onChange={(e) => setHeroData(prev => ({ ...prev, highlightText: e.target.value }))}
              placeholder="Ex: 17+ years"
            />
          </div>

          {/* Aperçu simple */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu :</h3>
            <div className="space-y-2">
              <p className="font-semibold">{heroData.title}</p>
              <p className="text-sm text-gray-600">{heroData.description}</p>
              <p className="text-xs text-blue-600 font-medium">Surbrillance: {heroData.highlightText}</p>
            </div>
          </div>

          {/* Statut de connexion */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-xs">
              ✅ Connecté à l'API backend : Les modifications sont sauvegardées en base de données et publiées automatiquement.
            </p>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex gap-2">
            <Button 
              onClick={handleHeroSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.info('Aperçu', { description: 'Fonctionnalité à venir' })}
            >
              Aperçu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Navigation */}
          {activeSection !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour au Dashboard
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Services CMS</span>
                  <span>/</span>
                  <span className="font-medium">
                    {activeSection === 'hero' ? 'Section Hero' : 
                     activeSection === 'grid' ? 'Section Grid' : 
                     'Section Skills & Video'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={activeSection === 'dashboard' ? '' : 'bg-white rounded-lg shadow-sm'}>
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'hero' && renderHeroEditor()}
            {activeSection === 'grid' && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Section Grid des Services</h2>
                    <p className="text-gray-600">
                      Gérez vos services avec des couleurs personnalisées. Les modifications sont automatiquement publiées sur le site.
                    </p>
                  </div>
                  
                  <ServicesGridEditor
                    data={gridData}
                    onChange={setGridData}
                    onSave={handleGridSave}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
            {activeSection === 'skills' && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Section Skills & Video</h2>
                    <p className="text-gray-600">
                      Gérez vos compétences et la vidéo de présentation. Les modifications sont automatiquement publiées sur le site.
                    </p>
                  </div>
                  
                  <SkillsVideoEditor
                    data={skillsData}
                    onChange={setSkillsData}
                    onSave={handleSkillsSave}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}