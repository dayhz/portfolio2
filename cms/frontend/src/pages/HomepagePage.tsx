import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { HeroEditor } from '../components/homepage/HeroEditor';
import { BrandsEditor } from '../components/homepage/BrandsEditor';
import { ServicesEditor } from '../components/homepage/ServicesEditorBasic';
import { WorkEditor } from '../components/homepage/WorkEditor';
import { OfferEditor } from '../components/homepage/OfferEditor';
import { TestimonialsEditor } from '../components/homepage/TestimonialsEditor';
import { FooterEditor } from '../components/homepage/FooterEditor';
import { PreviewModal } from '../components/homepage/PreviewModal';
import { PublishConfirmDialog } from '../components/homepage/PublishConfirmDialog';
import { UnsavedChangesDialog } from '../components/homepage/UnsavedChangesDialog';
import { homepageAPI } from '../api/homepage';
import { toast } from 'sonner';

type HomepageSection = 'dashboard' | 'hero' | 'brands' | 'services' | 'work' | 'offer' | 'testimonials' | 'footer';

interface SectionCard {
  id: HomepageSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'draft' | 'empty';
  lastModified?: string;
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
}

interface UnsavedChangesState {
  [key: string]: boolean;
}

export default function HomepagePage() {
  const [activeSection, setActiveSection] = useState<HomepageSection>('dashboard');
  const [previewData, setPreviewData] = useState<any>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<UnsavedChangesState>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSectionType, setPreviewSectionType] = useState<string | undefined>();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<HomepageSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Track unsaved changes across sections
  const handleUnsavedChanges = (sectionId: string, hasChanges: boolean) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [sectionId]: hasChanges
    }));
  };

  // Check if there are any unsaved changes
  const hasAnyUnsavedChanges = Object.values(unsavedChanges).some(Boolean);

  // Handle navigation with unsaved changes warning
  const handleSectionNavigation = (sectionId: HomepageSection) => {
    if (hasAnyUnsavedChanges && activeSection !== 'dashboard') {
      setPendingNavigation(sectionId);
      setIsUnsavedChangesDialogOpen(true);
      return;
    }
    setActiveSection(sectionId);
  };

  // Handle unsaved changes dialog actions
  const handleContinueWithoutSaving = () => {
    if (pendingNavigation) {
      setActiveSection(pendingNavigation);
      setPendingNavigation(null);
    }
    setIsUnsavedChangesDialogOpen(false);
  };

  const handleSaveAndContinue = async () => {
    try {
      setIsSaving(true);
      await homepageAPI.saveAllChanges();
      setUnsavedChanges({});
      setLastSaved(new Date());
      toast.success('Modifications sauvegardées avec succès');
      
      if (pendingNavigation) {
        setActiveSection(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
      setIsUnsavedChangesDialogOpen(false);
    }
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyUnsavedChanges]);

  const sections: SectionCard[] = [
    {
      id: 'hero',
      title: 'Section Hero',
      description: 'Titre principal, description et vidéo de fond',
      icon: <FileText className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 2 heures',
      hasUnsavedChanges: unsavedChanges.hero || false
    },
    {
      id: 'brands',
      title: 'Clients & Marques',
      description: 'Logos et noms de vos clients',
      icon: <Users className="h-5 w-5" />,
      status: 'draft',
      lastModified: 'Il y a 1 jour',
      hasUnsavedChanges: unsavedChanges.brands || false
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Vos 3 services principaux',
      icon: <Briefcase className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 3 jours',
      hasUnsavedChanges: unsavedChanges.services || false
    },
    {
      id: 'work',
      title: 'Section Work',
      description: 'Titre et description de vos projets',
      icon: <Briefcase className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a quelques minutes',
      hasUnsavedChanges: unsavedChanges.work || false
    },
    {
      id: 'offer',
      title: 'Proposition de Valeur',
      description: 'Points clés de votre offre',
      icon: <Target className="h-5 w-5" />,
      status: 'draft',
      lastModified: 'Il y a 1 semaine',
      hasUnsavedChanges: unsavedChanges.offer || false
    },
    {
      id: 'testimonials',
      title: 'Témoignages',
      description: 'Avis et retours clients',
      icon: <MessageSquare className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a quelques minutes',
      hasUnsavedChanges: unsavedChanges.testimonials || false
    },
    {
      id: 'footer',
      title: 'Footer',
      description: 'Informations de contact et liens',
      icon: <Phone className="h-5 w-5" />,
      status: 'completed',
      lastModified: 'Il y a 2 semaines',
      hasUnsavedChanges: unsavedChanges.footer || false
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

  const handlePreview = (data: any, sectionType?: string) => {
    setPreviewData(data);
    setPreviewSectionType(sectionType || activeSection);
    setIsPreviewOpen(true);
  };

  const handleGlobalPreview = () => {
    setPreviewData(null);
    setPreviewSectionType(undefined);
    setIsPreviewOpen(true);
  };

  const handlePublishAll = () => {
    if (!hasAnyUnsavedChanges) {
      toast.info('Aucune modification à publier');
      return;
    }
    setIsPublishDialogOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    try {
      const result = await homepageAPI.publishAllChanges();
      setUnsavedChanges({});
      setLastSaved(new Date());
      toast.success(`${result.publishedSections.length} section(s) publiée(s) avec succès`);
      console.log('Published sections:', result.publishedSections);
    } catch (error) {
      console.error('Error publishing changes:', error);
      toast.error('Erreur lors de la publication');
    } finally {
      setIsPublishing(false);
      setIsPublishDialogOpen(false);
    }
  };

  const handleSaveAll = async () => {
    if (!hasAnyUnsavedChanges) {
      toast.info('Aucune modification à sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      const result = await homepageAPI.saveAllChanges();
      setUnsavedChanges({});
      setLastSaved(new Date());
      toast.success(`${result.savedSections.length} section(s) sauvegardée(s) avec succès`);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Home className="h-6 w-6 lg:h-8 lg:w-8" />
            Homepage CMS
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez le contenu de votre page d'accueil en toute simplicité
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleGlobalPreview}
          >
            <Eye className="h-4 w-4" />
            Prévisualiser
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleSaveAll}
            disabled={!hasAnyUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder tout'}
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handlePublishAll}
            disabled={!hasAnyUnsavedChanges || isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isPublishing ? 'Publication...' : 'Publier les changements'}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasAnyUnsavedChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Vous avez des modifications non sauvegardées dans {Object.keys(unsavedChanges).filter(key => unsavedChanges[key]).length} section(s). 
            N'oubliez pas de publier vos changements.
          </AlertDescription>
        </Alert>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
              section.hasUnsavedChanges ? 'ring-2 ring-orange-200 border-orange-300' : ''
            }`}
            onClick={() => handleSectionNavigation(section.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <CardTitle className="text-base lg:text-lg">{section.title}</CardTitle>
                  {section.hasUnsavedChanges && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-orange-600 font-medium">Non sauvé</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={getStatusColor(section.status)}>
                    {getStatusText(section.status)}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                {section.lastModified && (
                  <p className="text-xs text-gray-500">
                    Modifié {section.lastModified}
                  </p>
                )}
                {section.hasUnsavedChanges && (
                  <p className="text-xs text-orange-600 font-medium">
                    Modifications en attente
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSectionNavigation(section.id);
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
    const commonProps = {
      onPreview: (data: any) => handlePreview(data, activeSection),
      onUnsavedChanges: (hasChanges: boolean) => handleUnsavedChanges(activeSection, hasChanges)
    };

    switch (activeSection) {
      case 'hero':
        return <HeroEditor {...commonProps} />;
      case 'brands':
        return <BrandsEditor {...commonProps} />;
      case 'services':
        return <ServicesEditor {...commonProps} />;
      case 'work':
        return <WorkEditor {...commonProps} />;
      case 'offer':
        return <OfferEditor {...commonProps} />;
      case 'testimonials':
        return <TestimonialsEditor {...commonProps} />;
      case 'footer':
        return <FooterEditor {...commonProps} />;
      default:
        return renderDashboard();
    }
  };

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
                    onClick={() => handleSectionNavigation('dashboard')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
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
                
                {/* Section-level actions */}
                <div className="flex items-center gap-2">
                  {unsavedChanges[activeSection] && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Non sauvegardé
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(previewData, activeSection)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Prévisualiser
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={activeSection === 'dashboard' ? '' : 'bg-white rounded-lg shadow-sm'}>
            {renderSectionEditor()}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        sectionData={previewData}
        sectionType={previewSectionType}
      />

      {/* Publish Confirmation Dialog */}
      <PublishConfirmDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
        isPublishing={isPublishing}
        unsavedSections={Object.keys(unsavedChanges).filter(key => unsavedChanges[key])}
        totalSections={sections.length}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={isUnsavedChangesDialogOpen}
        onClose={() => {
          setIsUnsavedChangesDialogOpen(false);
          setPendingNavigation(null);
        }}
        onContinue={handleContinueWithoutSaving}
        onSaveAndContinue={handleSaveAndContinue}
        description="Vous avez des modifications non sauvegardées dans cette section. Que souhaitez-vous faire ?"
      />
    </div>
  );
}