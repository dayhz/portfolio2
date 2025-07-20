/**
 * Page d'aperçu dédiée pour les projets
 * Simule le rendu final sur le site portfolio
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ProjectData {
  title: string;
  category: string;
  client: string;
  year: string;
  duration: string;
  heroImage?: string;
  content: string;
}

export function ProjectPreviewPage() {
  const [searchParams] = useSearchParams();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  useEffect(() => {
    // Récupérer les données depuis les paramètres URL ou localStorage
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setProjectData(data);
      } catch (error) {
        console.error('Erreur lors du parsing des données:', error);
      }
    } else {
      // Fallback: récupérer depuis localStorage
      const savedData = localStorage.getItem('projectDraft');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setProjectData({
            ...data,
            content: localStorage.getItem('projectContent') || ''
          });
        } catch (error) {
          console.error('Erreur lors du parsing des données localStorage:', error);
        }
      }
    }
  }, [searchParams]);

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de prévisualisation */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center">
        <p className="text-sm">
          📋 Mode Aperçu - Ceci est une simulation du rendu final sur le site portfolio
        </p>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        <div className="px-8 py-12">
          {/* Hero Image */}
          {projectData.heroImage && (
            <div className="mb-8">
              <img 
                src={projectData.heroImage} 
                alt={projectData.title}
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Titre et métadonnées */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {projectData.title}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                <span className="font-semibold text-gray-500 uppercase tracking-wide text-xs">
                  Catégorie
                </span>
                <p className="text-gray-900 capitalize font-medium">
                  {projectData.category}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-gray-500 uppercase tracking-wide text-xs">
                  Client
                </span>
                <p className="text-gray-900 font-medium">
                  {projectData.client}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-gray-500 uppercase tracking-wide text-xs">
                  Année
                </span>
                <p className="text-gray-900 font-medium">
                  {projectData.year}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-gray-500 uppercase tracking-wide text-xs">
                  Durée
                </span>
                <p className="text-gray-900 font-medium">
                  {projectData.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200 mb-12"></div>

          {/* Contenu du projet */}
          <div className="project-content">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: projectData.content }}
            />
          </div>
        </div>
      </div>

      <style>{`
        /* Styles spécifiques pour l'aperçu */
        .project-content {
          line-height: 1.8;
          color: #374151;
        }

        /* Styles pour les blocs de l'éditeur universel */
        .project-content .section {
          margin: 3rem 0;
        }

        .project-content .u-container {
          max-width: 100%;
        }

        .project-content .temp-img_container {
          margin: 3rem 0;
        }

        .project-content .img-wrp {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .project-content .comp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .project-content .temp-comp-img_grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          margin: 3rem 0;
        }

        .project-content .img_grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .project-content .temp-img.none-ratio {
          aspect-ratio: auto;
          height: 100%;
          width: 100%;
        }
        
        .project-content .img-wrp {
          height: 300px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }
        
        /* Tailles d'images */
        .project-content .section[data-size="small"] .temp-img_container {
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .project-content .section[data-size="medium"] .temp-img_container {
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .project-content .section[data-size="large"] .temp-img_container {
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }

        .project-content .temp-img.none-ratio .img-wrp {
          height: 100%;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .project-content .temp-img.none-ratio .comp-img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Important pour maintenir le ratio tout en remplissant */
        }

        .project-content .video-wrp {
          margin: 3rem 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .project-content .video {
          width: 100%;
          height: auto;
        }

        .project-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #111827;
          line-height: 1.2;
        }

        .project-content h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          color: #1f2937;
          line-height: 1.3;
        }

        .project-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #374151;
          line-height: 1.4;
        }

        .project-content p {
          margin-bottom: 1.5rem;
          color: #4b5563;
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .project-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2.5rem 0;
          font-style: italic;
          color: #6b7280;
          font-size: 1.25rem;
          line-height: 1.6;
        }

        .project-content ul,
        .project-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        .project-content li {
          margin-bottom: 0.5rem;
          color: #4b5563;
          line-height: 1.7;
        }

        .project-content strong {
          color: #111827;
          font-weight: 600;
        }

        .project-content em {
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .project-content .temp-comp-img_grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .project-content .img_grid-container {
            height: 300px; /* Hauteur réduite sur mobile */
          }
          
          .project-content h1 {
            font-size: 1.875rem;
          }
          
          .project-content h2 {
            font-size: 1.5rem;
          }
          
          .project-content p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}