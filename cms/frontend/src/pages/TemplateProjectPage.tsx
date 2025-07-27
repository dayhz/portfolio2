import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZestyTemplateEditor } from '@/components/TemplateEditor/ZestyTemplateEditor';
import { ZestyTemplateRenderer } from '@/components/TemplateEditor/ZestyTemplateRenderer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templateProjectService, type ZestyProjectData } from '@/services/templateProjectService';
import { ArrowLeft } from 'lucide-react';

interface ZestyProjectData {
  title: string;
  heroImage: string;
  challenge: string;
  approach: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  image1: string;
  textSection1: string;
  image2: string;
  image3: string;
  image4: string;
  video1: string;
  video1Poster: string;
  video2: string;
  video2Poster: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  testimonialImage: string;
  finalImage: string;
  textSection2: string;
  finalImage1: string;
  finalImage2: string;
}

export const TemplateProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState<ZestyProjectData>({
    title: '',
    heroImage: '',
    challenge: '',
    approach: '',
    client: '',
    year: new Date().getFullYear().toString(),
    duration: '',
    type: '',
    industry: '',
    scope: [],
    image1: '',
    textSection1: '',
    image2: '',
    image3: '',
    image4: '',
    video1: '',
    video1Poster: '',
    video2: '',
    video2Poster: '',
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialRole: '',
    testimonialImage: '',
    finalImage: '',
    textSection2: '',
    finalImage1: '',
    finalImage2: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadProject(id);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const project = templateProjectService.getProject(projectId);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement du projet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {id === 'new' ? 'Nouveau Projet' : 'Éditer le Projet'}
                </h1>
                {projectData.title && (
                  <p className="text-gray-600">{projectData.title}</p>
                )}
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
              <TabsList>
                <TabsTrigger value="edit">Édition</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="edit" className="mt-0">
            <div className="p-6">
              <ZestyTemplateEditor 
                projectData={projectData}
                onDataChange={setProjectData}
                projectId={id !== 'new' ? id : undefined}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="bg-white min-h-screen">
              <ZestyTemplateRenderer projectData={projectData} isPreview={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};