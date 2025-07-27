import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalEditor } from '@/components/UniversalEditor';
import { SimpleHtmlEditor, SimpleHtmlPreview } from '@/components/SimpleHtmlEditor';
import { ProjectPreview } from '@/components/ProjectPreview';
import { AuthDebugger } from '@/components/AuthDebugger';
import { ApiDebugger } from '@/components/ApiDebugger';
import { ArrowLeft } from 'react-iconly';
import { toast } from 'sonner';
import ProjectService from '@/services/ProjectService';

export default function ProjectContentPage() {
  console.log('ProjectContentPage: Composant monté');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [projectData, setProjectData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialiser le choix de l'éditeur s'il n'existe pas déjà
  useEffect(() => {
    if (localStorage.getItem('useUniversalEditor') === null) {
      localStorage.setItem('useUniversalEditor', 'false'); // Par défaut, utiliser l'éditeur simple
    }
  }, []);
  
  // Nous n'utilisons plus l'ID du projet depuis l'URL
  console.log('ProjectContentPage: URL actuelle:', window.location.href);

  useEffect(() => {
    console.log('ProjectContentPage: useEffect triggered');
    
    // Vérifier l'authentification
    if (!isAuthenticated) {
      console.log('ProjectContentPage: User not authenticated, redirecting to login');
      toast.error('Vous devez être connecté pour créer ou modifier un projet.');
      navigate('/login?redirect=/projects');
      return;
    }
    
    // Récupérer les données depuis le localStorage
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
      
      // Définir les données du projet
      setProjectData(data);
      
      // Si c'est un projet existant, charger son contenu depuis l'API
      if (data.id) {
        setIsLoading(true);
        
        // Fonction pour charger le contenu du projet
        const loadProjectContent = async () => {
          try {
            console.log('ProjectContentPage: Chargement du contenu pour le projet ID:', data.id);
            
            // Récupérer le projet complet pour avoir toutes les données
            const fullProject = await ProjectService.getProject(data.id);
            console.log('ProjectContentPage: Projet complet récupéré:', fullProject);
            
            // Récupérer le contenu du projet
            const projectContent = await ProjectService.getProjectContent(data.id);
            console.log('ProjectContentPage: Contenu du projet récupéré:', 
              projectContent ? `Contenu présent (${projectContent.length} caractères)` : 'Pas de contenu');
            
            if (projectContent) {
              console.log('ProjectContentPage: Aperçu du contenu récupéré:', projectContent.substring(0, 200) + '...');
            }
            
            // Si le contenu est disponible, l'utiliser
            if (projectContent && typeof projectContent === 'string' && projectContent.length > 0) {
              console.log('ProjectContentPage: Contenu trouvé dans l\'API, mise à jour du state');
              setContent(projectContent);
            } else if (fullProject && fullProject.content && fullProject.content.length > 0) {
              // Sinon, essayer d'utiliser le contenu du projet complet
              console.log('ProjectContentPage: Utilisation du contenu du projet complet');
              console.log('ProjectContentPage: Aperçu du contenu du projet complet:', fullProject.content.substring(0, 200) + '...');
              setContent(fullProject.content);
            } else if (data.content && data.content.length > 0) {
              // Sinon, utiliser le contenu des données sauvegardées
              console.log('ProjectContentPage: Utilisation du contenu des données sauvegardées');
              console.log('ProjectContentPage: Aperçu du contenu des données sauvegardées:', data.content.substring(0, 200) + '...');
              setContent(data.content);
            } else {
              // Si aucun contenu n'est disponible, initialiser avec un contenu par défaut
              console.log('ProjectContentPage: Pas de contenu disponible, utilisation du contenu par défaut');
              const defaultContent = `
                <div data-type="universal-text" class="section">
                  <div class="u-container">
                    <div class="temp-rich u-color-dark w-richtext">
                      <h1>Contenu du projet ${data.title}</h1>
                      <p>Commencez à éditer votre contenu ici...</p>
                    </div>
                  </div>
                </div>
                <div data-type="universal-image" class="section" data-wf--template-section-image--variant="auto">
                  <div class="u-container">
                    <div class="temp-img_container">
                      <div class="temp-img">
                        <div class="img-wrp">
                          <div class="block-placeholder" style="min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <div class="block-placeholder-icon">🖼️</div>
                            <div class="block-placeholder-text">Image standard</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              setContent(defaultContent);
            }
          } catch (error) {
            console.error('Erreur lors du chargement du contenu du projet:', error);
            
            // En cas d'erreur, utiliser le contenu des données sauvegardées s'il existe
            if (data.content && data.content.length > 0) {
              console.log('ProjectContentPage: Utilisation du contenu des données sauvegardées après erreur');
              console.log('ProjectContentPage: Aperçu du contenu des données sauvegardées:', data.content.substring(0, 200) + '...');
              setContent(data.content);
            } else {
              // Sinon, initialiser avec un contenu par défaut
              console.log('ProjectContentPage: Initialisation avec un contenu par défaut après erreur');
              const defaultContent = `
                <div data-type="universal-text" class="section">
                  <div class="u-container">
                    <div class="temp-rich u-color-dark w-richtext">
                      <h1>Contenu du projet ${data.title}</h1>
                      <p>Commencez à éditer votre contenu ici...</p>
                    </div>
                  </div>
                </div>
                <div data-type="universal-image" class="section" data-wf--template-section-image--variant="auto">
                  <div class="u-container">
                    <div class="temp-img_container">
                      <div class="temp-img">
                        <div class="img-wrp">
                          <div class="block-placeholder" style="min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <div class="block-placeholder-icon">🖼️</div>
                            <div class="block-placeholder-text">Image standard</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              setContent(defaultContent);
            }
          } finally {
            setIsLoading(false);
          }
        };
        
        loadProjectContent();
      } else {
        // Nouveau projet, initialiser avec le contenu des données sauvegardées ou un contenu par défaut
        if (data.content && data.content.length > 0) {
          console.log('ProjectContentPage: Nouveau projet avec contenu dans les données sauvegardées');
          setContent(data.content);
        } else {
          console.log('ProjectContentPage: Nouveau projet sans contenu, utilisation du contenu par défaut');
          const defaultContent = `
            <div data-type="universal-text" class="section">
              <div class="u-container">
                <div class="temp-rich u-color-dark w-richtext">
                  <h1>Nouveau projet: ${data.title}</h1>
                  <p>Commencez à éditer votre contenu ici...</p>
                </div>
              </div>
            </div>
            <div data-type="universal-image" class="section" data-wf--template-section-image--variant="auto">
              <div class="u-container">
                <div class="temp-img_container">
                  <div class="temp-img">
                    <div class="img-wrp">
                      <div class="block-placeholder" style="min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <div class="block-placeholder-icon">🖼️</div>
                        <div class="block-placeholder-text">Image standard</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          setContent(defaultContent);
        }
        setIsLoading(false);
      }
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
    // Si c'est un projet existant, retourner à la liste des projets
    // Sinon, retourner à l'étape 1 de la création
    if (projectData.id) {
      navigate('/projects');
    } else {
      navigate('/projects/new');
    }
  };

  const handleComplete = async () => {
    if (!projectData) return;

    // Débogage de l'authentification
    const authDebug = debugAuth();

    // Vérifier l'authentification avant de soumettre
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour créer ou modifier un projet.');
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
      // Préparer les données pour l'API
      const projectFormData = {
        title: projectData.title,
        description: projectData.subtitle || projectData.description || '',
        category: projectData.category.toUpperCase(),
        thumbnail: projectData.heroImagePreview || projectData.heroImage || '/uploads/default-thumbnail.jpg',
        images: [projectData.heroImagePreview || projectData.heroImage || '/uploads/default-thumbnail.jpg'],
        year: projectData.year,
        client: projectData.client,
        duration: projectData.duration,
        industry: projectData.industry,
        scope: projectData.scope,
        challenge: projectData.challenge,
        approach: projectData.approach,
        testimonial: projectData.testimonial ? JSON.stringify(projectData.testimonial) : undefined,
        content: content, // Ajouter le contenu du projet
        isPublished: projectData.status === 'published'
      };

      console.log('Données du projet préparées:', projectFormData);
      
      let successMessage = '';
      
      // Vérifier si c'est une création ou une mise à jour
      if (projectData.id) {
        // Mise à jour d'un projet existant
        console.log('Mise à jour du projet existant:', projectData.id);
        await ProjectService.updateProject(projectData.id, projectFormData);
        successMessage = 'Projet mis à jour avec succès !';
      } else {
        // Création d'un nouveau projet
        console.log('Création d\'un nouveau projet');
        await ProjectService.createProject(projectFormData);
        successMessage = 'Projet créé avec succès !';
      }

      // Nettoyer le localStorage
      localStorage.removeItem('projectDraft');

      toast.success(successMessage);
      navigate('/projects');
    } catch (error) {
      console.error('Erreur détaillée lors de la sauvegarde du projet:', error);
      
      // Afficher des informations plus détaillées sur l'erreur
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Statut de l\'erreur:', axiosError.response?.status);
        console.error('Données de l\'erreur:', axiosError.response?.data);
        
        if (axiosError.response?.status === 401) {
          toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
          navigate('/login?redirect=/projects/new');
        } else {
          toast.error(`Erreur lors de la sauvegarde du projet: ${axiosError.response?.data?.error || axiosError.message || 'Erreur inconnue'}`);
        }
      } else {
        toast.error('Erreur lors de la sauvegarde du projet: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('ProjectContentPage: Rendering, projectData:', projectData);
  console.log('ProjectContentPage: Content:', content ? `${content.substring(0, 100)}...` : 'Pas de contenu');
  console.log('ProjectContentPage: Content:', content ? `${content.substring(0, 50)}...` : 'Pas de contenu');

  if (!projectData || isLoading) {
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
              {isSubmitting 
                ? (projectData.id ? 'Mise à jour...' : 'Création...') 
                : (projectData.id ? 'Mettre à jour' : 'Créer le projet')
              }
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{projectData.title}</h1>
          <p className="text-gray-600 mt-2">
            {projectData.id ? 'Édition du projet' : 'Étape 2/2 - Contenu du projet'}
          </p>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Éditeur HTML</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Basculer entre l'éditeur universel et l'éditeur simple
                    const useUniversalEditor = localStorage.getItem('useUniversalEditor') === 'true';
                    localStorage.setItem('useUniversalEditor', (!useUniversalEditor).toString());
                    window.location.reload();
                  }}
                >
                  {localStorage.getItem('useUniversalEditor') === 'true' ? 'Utiliser l\'éditeur simple' : 'Utiliser l\'éditeur universel'}
                </Button>
              </div>
              
              {localStorage.getItem('useUniversalEditor') === 'true' ? (
                <UniversalEditor
                  content={content}
                  onChange={(newContent) => {
                    console.log('UniversalEditor onChange - newContent:', newContent ? newContent.substring(0, 50) + '...' : 'No content');
                    
                    // Vérifier si le contenu est valide pour l'éditeur universel
                    const isValidUniversalContent = newContent && (
                      newContent.includes('data-type="universal-text"') || 
                      newContent.includes('data-type="universal-image"') ||
                      newContent.includes('data-type="testimony"') ||
                      newContent.includes('data-type="imageGrid"') ||
                      newContent.includes('data-type="universalVideo"')
                    );
                    
                    if (!isValidUniversalContent) {
                      console.warn('Le contenu ne semble pas contenir de blocs universels valides');
                      console.log('Contenu complet:', newContent);
                    }
                    
                    setContent(newContent);
                    
                    // Sauvegarde automatique si c'est un projet existant
                    if (projectData?.id) {
                      console.log('Projet existant, configuration de la sauvegarde automatique');
                      const saveTimeout = setTimeout(async () => {
                        try {
                          console.log('Sauvegarde automatique du contenu...');
                          await ProjectService.updateProjectContent(projectData.id, newContent);
                          console.log('Contenu du projet sauvegardé automatiquement');
                        } catch (error) {
                          console.error('Erreur lors de la sauvegarde automatique du contenu:', error);
                        }
                      }, 2000); // Délai de 2 secondes pour éviter trop d'appels API
                      
                      return () => clearTimeout(saveTimeout);
                    } else {
                      console.log('Nouveau projet, pas de sauvegarde automatique');
                    }
                  }}
                  projectId={projectData?.id}
                  autoSave={true}
                />
              ) : (
                <div className="space-y-4">
                  <SimpleHtmlEditor
                    content={content}
                    onChange={(newContent) => {
                      console.log('SimpleHtmlEditor onChange - newContent:', newContent ? newContent.substring(0, 50) + '...' : 'No content');
                      
                      // Vérifier si le contenu est valide pour l'éditeur universel
                      const isValidUniversalContent = newContent && (
                        newContent.includes('data-type="universal-text"') || 
                        newContent.includes('data-type="universal-image"') ||
                        newContent.includes('data-type="testimony"') ||
                        newContent.includes('data-type="imageGrid"') ||
                        newContent.includes('data-type="universalVideo"')
                      );
                      
                      if (!isValidUniversalContent) {
                        console.warn('Le contenu ne semble pas contenir de blocs universels valides');
                        console.log('Contenu complet:', newContent);
                      }
                      
                      setContent(newContent);
                      
                      // Sauvegarde automatique si c'est un projet existant
                      if (projectData?.id) {
                        console.log('Projet existant, configuration de la sauvegarde automatique');
                        const saveTimeout = setTimeout(async () => {
                          try {
                            console.log('Sauvegarde automatique du contenu...');
                            await ProjectService.updateProjectContent(projectData.id, newContent);
                            console.log('Contenu du projet sauvegardé automatiquement');
                          } catch (error) {
                            console.error('Erreur lors de la sauvegarde automatique du contenu:', error);
                          }
                        }, 2000); // Délai de 2 secondes pour éviter trop d'appels API
                        
                        return () => clearTimeout(saveTimeout);
                      }
                    }}
                    height="300px"
                  />
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Aperçu</h3>
                    <SimpleHtmlPreview content={content} />
                  </div>
                </div>
              )}
            </div>
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
              {isSubmitting 
                ? (projectData.id ? 'Mise à jour en cours...' : 'Création en cours...') 
                : (projectData.id ? 'Mettre à jour le projet' : 'Créer le projet')
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}