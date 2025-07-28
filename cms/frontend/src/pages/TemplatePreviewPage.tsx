import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZestyTemplateRenderer } from '@/components/TemplateEditor/ZestyTemplateRenderer';
import { Button } from '@/components/ui/button';
import { templateProjectService, type ZestyProjectData } from '@/services/templateProjectService';
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react';

export const TemplatePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ZestyProjectData | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const project = await templateProjectService.getProject(projectId);
      if (project) {
        const { id: _, createdAt: __, updatedAt: ___, ...projectData } = project;
        setProjectData(projectData);
      } else {
        alert('Projet non trouvé');
        navigate('/template-projects');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Erreur lors du chargement du projet');
      navigate('/template-projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/template-projects');
  };

  const handleEdit = () => {
    navigate(`/template-editor/${id}`);
  };

  const handleOpenInNewTab = () => {
    // Ouvrir l'aperçu dans un nouvel onglet via la route dynamique
    if (id) {
      const url = `/project/${id}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Chargement de l'aperçu...</div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Projet non trouvé</h2>
          <Button onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de prévisualisation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{projectData.title}</h1>
                <p className="text-sm text-gray-600">
                  {projectData.client} • {projectData.year}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenInNewTab}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Éditer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de l'aperçu */}
      <div className="bg-white">
        <ZestyTemplateRenderer projectData={projectData} isPreview={true} />
      </div>
    </div>
  );
};