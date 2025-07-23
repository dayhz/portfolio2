import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalEditor } from '@/components/UniversalEditor';
import { ProjectPreview } from '@/components/ProjectPreview';
import { AuthDebugger } from '@/components/AuthDebugger';
import { ApiDebugger } from '@/components/ApiDebugger';
import { ArrowLeft } from 'react-iconly';
import { toast } from 'sonner';
import ProjectService from '@/services/ProjectService';

export default function ProjectContentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [projectData, setProjectData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    console.log('ProjectContentPage: useEffect triggered');
    
    // Vérifier l'authentification
    if (!isAuthenticated) {
      console.log('ProjectContentPage: User not authenticated, redirecting to login');
      toast.error('Vous devez être connecté pour créer un projet.');
      navigate('/login?redirect=/projects/new');
      return;
    }
    
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
  }, [navigate, isAuthenticated]);

  // Fonction de débogage pour vérifier l'état de l'authentification
  const debugAuth = () => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('auth-user');
    
    console.group('🔍 Débogage Authentification');
    console.log('isAuthenticated (from context):', isAuthenticated);
    console.log('Token in localStorage:', token);
    console.log('User in localStorage:', user);
    
    // Vérifier si le token est valide
    if (token) {
      try {
        // Pour un token JWT, on peut vérifier sa structure
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Token expiration:', new Date(payload.exp * 1000).toLocaleString());
        } else if (token === 'dummy-token-for-testing') {
          console.log('Token de test détecté');
        } else {
          console.log('Format de token non reconnu');
        }
      } catch (e) {
        console.log('Erreur lors de l\'analyse du token:', e);
      }
    }
    
    console.groupEnd();
    
    return { token, user };
  };

  const handleBack = () => {
    navigate('/projects/new');
  };

  const handleComplete = async () => {
    if (!projectData) return;

    // Débogage de l'authentification
    const authDebug = debugAuth();

    // Vérifier l'authentification avant de soumettre
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour créer un projet.');
      navigate('/login?redirect=/projects/new');
      return;
    }

    // Vérifier explicitement que le token est présent
    const token = authDebug.token;
    if (!token) {
      toast.error('Token d\'authentification manquant. Veuillez vous reconnecter.');
      navigate('/login?redirect=/projects/new');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Préparation des données du projet pour création...');
      
      // Préparer les données pour l'API
      const projectFormData = {
        title: projectData.title,
        description: projectData.subtitle || projectData.description || '',
        category: projectData.category.toUpperCase(),
        thumbnail: projectData.heroImagePreview || '/uploads/default-thumbnail.jpg',
        images: [projectData.heroImagePreview || '/uploads/default-thumbnail.jpg'],
        year: projectData.year,
        client: projectData.client,
        duration: projectData.duration,
        industry: projectData.industry,
        scope: projectData.scope,
        challenge: projectData.challenge,
        approach: projectData.approach,
        testimonial: projectData.testimonial ? JSON.stringify(projectData.testimonial) : undefined,
        isPublished: projectData.status === 'published'
      };

      console.log('Données du projet préparées:', projectFormData);
      console.log('Statut d\'authentification:', isAuthenticated);
      console.log('Token d\'authentification présent:', !!token);
      console.log('Token d\'authentification:', token); // Log the actual token for debugging

      // Appel à l'API pour créer le projet
      console.log('Envoi de la requête de création de projet...');
      const newProject = await ProjectService.createProject(projectFormData);
      console.log('Nouveau projet créé:', newProject);

      // Nettoyer le localStorage
      localStorage.removeItem('projectDraft');

      toast.success('Projet créé avec succès !');
      navigate('/projects');
    } catch (error) {
      console.error('Erreur détaillée lors de la création du projet:', error);
      
      // Afficher des informations plus détaillées sur l'erreur
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Statut de l\'erreur:', axiosError.response?.status);
        console.error('Données de l\'erreur:', axiosError.response?.data);
        
        if (axiosError.response?.status === 401) {
          toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
          navigate('/login?redirect=/projects/new');
        } else {
          toast.error(`Erreur lors de la création du projet: ${axiosError.response?.data?.error || axiosError.message || 'Erreur inconnue'}`);
        }
      } else {
        toast.error('Erreur lors de la création du projet: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
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
    <>
      <AuthDebugger />
      <ApiDebugger />
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
    </>
  );
}