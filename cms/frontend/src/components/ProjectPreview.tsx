/**
 * Composant d'aperçu du projet
 * Affiche le rendu final du projet tel qu'il apparaîtra sur le site
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Show, Send } from 'react-iconly';

interface ProjectPreviewProps {
  projectData: {
    title: string;
    category: string;
    client: string;
    year: number | string;
    duration?: string;
    heroImage?: string;
    heroImagePreview?: string; // Ajout pour supporter la structure de données actuelle
    description?: string;
    subtitle?: string; // Ajout pour supporter la structure de données actuelle
  };
  content: string;
  className?: string;
}

export function ProjectPreview({ projectData, content, className = '' }: ProjectPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  console.log('ProjectPreview - content:', content ? content.substring(0, 50) + '...' : 'No content');
  console.log('ProjectPreview - projectData:', projectData);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Show size="small" />
          <span className="ml-2">Aperçu</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu du projet - {projectData.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Sauvegarder temporairement le contenu pour l'aperçu
                localStorage.setItem('projectContent', content);
                window.open('/preview-project', '_blank');
              }}
            >
              <Send size="small" />
              <span className="ml-1">Ouvrir dans un nouvel onglet</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="preview-container">
          {/* Simulation du rendu final du site */}
          <div className="site-preview">
            {/* Header du projet */}
            <div className="project-header">
              {(projectData.heroImage || projectData.heroImagePreview) && (
                <div className="hero-image">
                  <img 
                    src={projectData.heroImage || projectData.heroImagePreview} 
                    alt={projectData.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="project-meta mt-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {projectData.title}
                </h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
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
              </div>
            </div>

            {/* Contenu du projet */}
            <div className="project-content">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>

        <style>{`
          .preview-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }

          .site-preview {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
          }

          .project-header {
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }

          .hero-image img {
            border-radius: 8px;
          }

          .project-meta h1 {
            color: #1a1a1a;
            line-height: 1.2;
          }

          .project-meta .grid > div {
            padding: 8px 0;
          }

          .project-meta .grid span {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .project-content {
            line-height: 1.7;
          }

          /* Styles pour le contenu généré par l'éditeur */
          .project-content .section {
            margin: 2rem 0;
          }

          .project-content .u-container {
            max-width: 100%;
          }

          .project-content .temp-img_container {
            margin: 2rem 0;
          }

          .project-content .img-wrp {
            border-radius: 8px;
            overflow: hidden;
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
            gap: 2rem;
            margin: 2rem 0;
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

          .project-content .temp-img.none-ratio {
            aspect-ratio: auto;
            height: 100%;
            width: 100%;
          }

          .project-content .temp-img.none-ratio .img-wrp {
            height: 100%;
            width: 100%;
            border-radius: 8px;
            overflow: hidden;
          }

          .project-content .temp-img.none-ratio .comp-img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Important pour maintenir le ratio tout en remplissant */
          }

          .project-content .video-wrp {
            margin: 2rem 0;
            border-radius: 8px;
            overflow: hidden;
          }

          .project-content .video {
            width: 100%;
            height: auto;
          }

          .project-content h1,
          .project-content h2,
          .project-content h3 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #1a1a1a;
          }

          .project-content p {
            margin-bottom: 1rem;
            color: #4a4a4a;
          }

          .project-content blockquote {
            border-left: 4px solid #007bff;
            padding-left: 1rem;
            margin: 2rem 0;
            font-style: italic;
            color: #666;
          }

          @media (max-width: 768px) {
            .site-preview {
              padding: 20px;
            }
            
            .project-meta .grid {
              grid-template-columns: 1fr 1fr;
            }

            .project-content .temp-comp-img_grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .project-content .img_grid-container {
              height: 250px; /* Hauteur réduite sur mobile */
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}