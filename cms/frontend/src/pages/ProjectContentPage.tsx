import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalEditor } from '@/components/UniversalEditor';
import { ProjectPreview } from '@/components/ProjectPreview';
import { ArrowLeft } from 'react-iconly';
import { toast } from 'sonner';

export default function ProjectContentPage() {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    console.log('ProjectContentPage: useEffect triggered');
    
    // Récupérer les données de l'étape 1 depuis le localStorage
    const savedData = localStorage.getItem('projectDraft');
    console.log('ProjectContentPage: savedData from localStorage:', savedData);
    
    if (!savedData) {
      console.log('ProjectContentPage: No saved data, redirecting to step 1');
      toast.error('Données du projet non trouvées. Redirection vers l\'étape 1.');
      navigate('/projects/new');
      return;
    }

    try {
      const data = JSON.parse(savedData);
      console.log('ProjectContentPage: Parsed data:', data);
      setProjectData(data);
    } catch (error) {
      console.error('ProjectContentPage: Error parsing data:', error);
      toast.error('Erreur lors de la récupération des données.');
      navigate('/projects/new');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/projects/new');
  };

  const handleComplete = async () => {
    if (!projectData) return;

    setIsSubmitting(true);
    try {
      // Simuler la création du projet
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        content: content,
        heroImage: projectData.heroImagePreview || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ici, on ferait normalement un appel API
      console.log('Nouveau projet créé:', newProject);

      // Nettoyer le localStorage
      localStorage.removeItem('projectDraft');

      toast.success('Projet créé avec succès !');
      navigate('/projects');
    } catch (error) {
      toast.error('Erreur lors de la création du projet');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('ProjectContentPage: Rendering, projectData:', projectData);

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-500">Chargement des données du projet...</p>
          <p className="text-xs text-gray-400 mt-2">Vérifiez la console pour plus de détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size="small" />
            <span>Précédent</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <ProjectPreview 
            projectData={projectData}
            content={content}
          />
          <Button
            variant="outline"
            onClick={() => navigate('/projects')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer le projet'}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{projectData.title}</h1>
        <p className="text-gray-600 mt-2">Étape 2/2 - Contenu du projet</p>
      </div>

      {/* Résumé du projet */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Résumé du projet</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Catégorie:</span>
              <p className="capitalize">{projectData.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Client:</span>
              <p>{projectData.client}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Année:</span>
              <p>{projectData.year}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Durée:</span>
              <p>{projectData.duration}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Éditeur de contenu */}
      <Card className="min-h-96">
        <CardHeader>
          <CardTitle>Contenu du projet</CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Utilisez la barre d'outils pour formater votre contenu</p>
            <p>• Tapez des raccourcis Markdown pour un formatage rapide</p>
            <p>• Glissez-déposez des images directement dans l'éditeur</p>
            <p>• L'éditeur sauvegarde automatiquement vos modifications</p>
          </div>
        </CardHeader>
        <CardContent>
          <UniversalEditor
            content={content}
            onChange={setContent}
            projectId={projectData?.id}
            autoSave={true}
          />
        </CardContent>
      </Card>

      {/* Actions en bas */}
      <div className="flex justify-between items-center py-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          ← Précédent
        </Button>
        
        <div className="flex items-center space-x-3">
          <ProjectPreview 
            projectData={projectData}
            content={content}
          />
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le projet'}
          </Button>
        </div>
      </div>
    </div>
  );
}