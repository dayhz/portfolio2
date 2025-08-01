import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  FileText,
  Grid3X3,
  Play,
  Route,
  MessageSquare,
  Users,
  Edit3,
  ArrowLeft,
  Wifi,
  WifiOff
} from 'lucide-react';
import { HeroSectionEditor } from '../components/services/HeroSectionEditor';
import { ServicesGridEditor } from '../components/services/ServicesGridEditor';
import { SkillsVideoEditor } from '../components/services/SkillsVideoEditor';
import { ApproachEditor } from '../components/services/ApproachEditor';
import { TestimonialsEditor } from '../components/services/TestimonialsEditor';
import { ClientsEditor } from '../components/services/ClientsEditor';
import { HeroSectionData, ServicesGridData, SkillsVideoData, ApproachData, TestimonialsData, ClientsData } from '../../../shared/types/services';
import { toast } from 'sonner';
import servicesDataService from '../services/servicesDataService';

type ActiveSection = 'dashboard' | 'hero' | 'services' | 'skills' | 'approach' | 'testimonials' | 'clients';

export default function ServicesPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [heroData, setHeroData] = useState<HeroSectionData>({
    title: '',
    description: '',
    highlightText: ''
  });
  const [servicesGridData, setServicesGridData] = useState<ServicesGridData>({
    services: []
  });
  const [skillsVideoData, setSkillsVideoData] = useState<SkillsVideoData>({
    description: '',
    skills: [],
    ctaText: '',
    ctaUrl: '',
    video: {
      url: '',
      caption: '',
      autoplay: true,
      loop: true,
      muted: true
    }
  });
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsData>({
    testimonials: []
  });
  const [clientsData, setClientsData] = useState<ClientsData>({
    clients: []
  });
  const [approachData, setApproachData] = useState<ApproachData>({
    description: '',
    steps: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiMode, setApiMode] = useState(false);

  // Initialisation du service et chargement des données
  useEffect(() => {
    const initializeService = async () => {
      setIsLoading(true);
      try {
        await servicesDataService.initialize();
        const heroDataFromService = await servicesDataService.getHeroData();
        setHeroData(heroDataFromService);
        
        // Load services grid data
        const servicesGridDataFromService = await servicesDataService.getServicesGridData();
        setServicesGridData(servicesGridDataFromService);
        
        // Load skills & video data
        const skillsVideoDataFromService = await servicesDataService.getSkillsVideoData();
        setSkillsVideoData(skillsVideoDataFromService);
        
        // Load approach data
        const approachDataFromService = await servicesDataService.getApproachData();
        setApproachData(approachDataFromService);
        
        // Load testimonials data
        const testimonialsDataFromService = await servicesDataService.getTestimonialsData();
        setTestimonialsData(testimonialsDataFromService);
        
        // Load clients data
        const clientsDataFromService = await servicesDataService.getClientsData();
        setClientsData(clientsDataFromService);
        
        // Détermine si on est en mode API
        const apiAvailable = await servicesDataService.testApiConnection();
        setApiMode(apiAvailable);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        toast.error('Erreur lors de l\'initialisation des services');
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, []);

  const sections = [
    {
      id: 'hero' as const,
      title: 'Section Hero',
      description: 'Titre principal et description de la page Services',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed' as const
    },
    {
      id: 'services' as const,
      title: 'Grille des Services',
      description: 'Gestion des 3 services principaux avec couleurs',
      icon: <Grid3X3 className="h-5 w-5" />,
      status: 'completed' as const
    },
    {
      id: 'skills' as const,
      title: 'Compétences & Vidéo',
      description: 'Liste des compétences et vidéo de présentation',
      icon: <Play className="h-5 w-5" />,
      status: 'completed' as const
    },
    {
      id: 'approach' as const,
      title: 'Processus de Travail',
      description: 'Les 4 étapes de votre méthodologie',
      icon: <Route className="h-5 w-5" />,
      status: 'completed' as const
    },
    {
      id: 'testimonials' as const,
      title: 'Témoignages',
      description: 'Avis clients avec slider et projets',
      icon: <MessageSquare className="h-5 w-5" />,
      status: 'draft' as const
    },
    {
      id: 'clients' as const,
      title: 'Liste des Clients',
      description: 'Logos et informations des clients',
      icon: <Users className="h-5 w-5" />,
      status: 'completed' as const
    }
  ];

  const getStatusColor = (status: 'completed' | 'draft' | 'empty') => {
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

  const getStatusText = (status: 'completed' | 'draft' | 'empty') => {
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

  const handleSaveHero = async (data: HeroSectionData) => {
    try {
      await servicesDataService.saveHeroData(data);
      setHeroData(data);
    } catch (error) {
      console.error('Failed to save hero data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewHero = (data: HeroSectionData) => {
    console.log('Preview hero data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const handleSaveServicesGrid = async (data: ServicesGridData) => {
    try {
      await servicesDataService.saveServicesGridData(data);
      setServicesGridData(data);
    } catch (error) {
      console.error('Failed to save services grid data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewServicesGrid = (data: ServicesGridData) => {
    console.log('Preview services grid data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const handleSaveSkillsVideo = async (data: SkillsVideoData) => {
    try {
      await servicesDataService.saveSkillsVideoData(data);
      setSkillsVideoData(data);
    } catch (error) {
      console.error('Failed to save skills & video data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewSkillsVideo = (data: SkillsVideoData) => {
    console.log('Preview skills & video data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const handleSaveApproach = async (data: ApproachData) => {
    try {
      await servicesDataService.saveApproachData(data);
      setApproachData(data);
    } catch (error) {
      console.error('Failed to save approach data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewApproach = (data: ApproachData) => {
    console.log('Preview approach data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const handleSaveTestimonials = async (data: TestimonialsData) => {
    try {
      await servicesDataService.saveTestimonialsData(data);
      setTestimonialsData(data);
    } catch (error) {
      console.error('Failed to save testimonials data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewTestimonials = (data: TestimonialsData) => {
    console.log('Preview testimonials data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const handleSaveClients = async (data: ClientsData) => {
    try {
      await servicesDataService.saveClientsData(data);
      setClientsData(data);
    } catch (error) {
      console.error('Failed to save clients data:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handlePreviewClients = (data: ClientsData) => {
    console.log('Preview clients data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-6 w-6 lg:h-8 lg:w-8" />
            Services Page CMS
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez le contenu de votre page Services en toute simplicité
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Mode développement - Version avec intégration API progressive
          </p>
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
                <p className="text-sm text-gray-600">Mode</p>
                <p className="text-2xl font-bold text-blue-600">
                  {apiMode ? 'API' : 'LOCAL'}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                apiMode ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {apiMode ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveSection(section.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <CardTitle className="text-base lg:text-lg">{section.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(section.status)}>
                  {getStatusText(section.status)}
                </Badge>
              </div>
              <CardDescription className="text-sm">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection(section.id);
                }}
              >
                <Edit3 className="h-4 w-4" />
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
        return (
          <div className="p-6">
            <HeroSectionEditor
              data={heroData}
              onChange={setHeroData}
              onSave={handleSaveHero}
              onPreview={handlePreviewHero}
              errors={[]}
            />
          </div>
        );
      case 'services':
        return (
          <div className="p-6">
            <ServicesGridEditor
              data={servicesGridData}
              onChange={setServicesGridData}
              onSave={handleSaveServicesGrid}
              onPreview={handlePreviewServicesGrid}
              errors={[]}
            />
          </div>
        );
      case 'skills':
        return (
          <div className="p-6">
            <SkillsVideoEditor
              data={skillsVideoData}
              onChange={setSkillsVideoData}
              onSave={handleSaveSkillsVideo}
              onPreview={handlePreviewSkillsVideo}
              errors={[]}
            />
          </div>
        );
      case 'approach':
        return (
          <div className="p-6">
            <ApproachEditor
              data={approachData}
              onChange={setApproachData}
              onSave={handleSaveApproach}
              onPreview={handlePreviewApproach}
              errors={[]}
            />
          </div>
        );
      case 'testimonials':
        return (
          <div className="p-6">
            <TestimonialsEditor
              data={testimonialsData}
              onChange={setTestimonialsData}
              onSave={handleSaveTestimonials}
              onPreview={handlePreviewTestimonials}
              errors={[]}
            />
          </div>
        );
      case 'clients':
        return (
          <div className="p-6">
            <ClientsEditor
              data={clientsData}
              onChange={setClientsData}
              onSave={handleSaveClients}
              onPreview={handlePreviewClients}
              errors={[]}
            />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {sections.find(s => s.id === activeSection)?.title} Editor
            </h2>
            <p className="text-gray-600">
              Cet éditeur sera implémenté dans une tâche future.
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Navigation */}
          {activeSection !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                      {sections.find(s => s.id === activeSection)?.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={activeSection === 'dashboard' ? '' : 'bg-white rounded-lg shadow-sm'}>
            {activeSection === 'dashboard' ? renderDashboard() : renderSectionEditor()}
          </div>
        </div>
      </div>
    </div>
  );
}