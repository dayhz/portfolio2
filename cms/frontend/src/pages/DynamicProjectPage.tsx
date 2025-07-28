import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ZestyTemplateRenderer } from '@/components/TemplateEditor/ZestyTemplateRenderer';
import { templateProjectService, type ZestyProjectData } from '@/services/templateProjectService';
import { ResponsivePreview } from '@/components/TemplateEditor/ResponsivePreview';

/**
 * Page template dynamique qui charge n'importe quel projet
 * URL: /project/:id ou /project?data=base64encodeddata
 */
export const DynamicProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [projectData, setProjectData] = useState<ZestyProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponsive, setShowResponsive] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [id, searchParams]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Method 1: Load from ID (saved projects)
      if (id) {
        const project = await templateProjectService.getProject(id);
        if (project) {
          // Vérifier si le projet est publié
          if (project.status !== 'published') {
            setError('Ce projet n\'est pas encore publié');
            return;
          }
          const { id: _, createdAt: __, updatedAt: ___, publishedAt: ____, ...data } = project;
          setProjectData(data);
        } else {
          setError('Projet non trouvé');
        }
      }
      // Method 2: Load from URL data parameter (direct data)
      else {
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            const decodedData = JSON.parse(atob(dataParam));
            setProjectData(decodedData);
          } catch (e) {
            setError('Données de projet invalides');
          }
        } else {
          setError('Aucun projet spécifié');
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Erreur lors du chargement du projet');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Projet non trouvé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Ce projet n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const content = <ZestyTemplateRenderer projectData={projectData} isPreview={false} />;

  return (
    <div className="min-h-screen bg-white">
      {/* Render clean portfolio content */}
      {content}
    </div>
  );
};