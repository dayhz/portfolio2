import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Eye } from 'lucide-react';

interface ProjectData {
  id?: string;
  title: string;
  subtitle: string;
  heroImage: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  challenge: string;
  approach: string;
  sections: ContentSection[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    image: string;
  };
}

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'image-grid';
  content: any;
}

export const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    subtitle: '',
    heroImage: '',
    client: '',
    year: new Date().getFullYear().toString(),
    duration: '',
    type: '',
    industry: '',
    scope: [],
    challenge: '',
    approach: '',
    sections: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectData(data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async () => {
    try {
      setIsLoading(true);
      const url = id && id !== 'new' ? `/api/projects/${id}` : '/api/projects';
      const method = id && id !== 'new' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const savedProject = await response.json();
        if (id === 'new') {
          navigate(`/admin/projects/${savedProject.id}/edit`);
        }
        alert('Projet sauvegardé avec succès !');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    setProjectData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const getDefaultContent = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return { text: 'Votre texte ici...' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'video':
        return { src: '', poster: '', caption: '' };
      case 'image-grid':
        return { images: [{ src: '', alt: '' }, { src: '', alt: '' }] };
      default:
        return {};
    }
  };

  const updateSection = (sectionId: string, content: any) => {
    setProjectData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      )
    }));
  };

  const removeSection = (sectionId: string) => {
    setProjectData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Nouveau Projet' : 'Modifier le Projet'}
        </h1>
        <div className="flex gap-2">
          <Button onClick={saveProject} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre</label>
              <Input
                value={projectData.title}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre du projet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sous-titre</label>
              <Input
                value={projectData.subtitle}
                onChange={(e) => setProjectData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Sous-titre"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Image Hero</label>
            <ImageUploadZone
              value={projectData.heroImage}
              onChange={(src) => setProjectData(prev => ({ ...prev, heroImage: src }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <Input
                value={projectData.client}
                onChange={(e) => setProjectData(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Année</label>
              <Input
                value={projectData.year}
                onChange={(e) => setProjectData(prev => ({ ...prev, year: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durée</label>
              <Input
                value={projectData.duration}
                onChange={(e) => setProjectData(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Input
                value={projectData.type}
                onChange={(e) => setProjectData(prev => ({ ...prev, type: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industrie</label>
              <Input
                value={projectData.industry}
                onChange={(e) => setProjectData(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Scope (un par ligne)</label>
            <Textarea
              value={projectData.scope.join('\n')}
              onChange={(e) => setProjectData(prev => ({ 
                ...prev, 
                scope: e.target.value.split('\n').filter(s => s.trim()) 
              }))}
              placeholder="Concept&#10;UI/UX&#10;Digital Design"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Challenge & Approach */}
      <Card>
        <CardHeader>
          <CardTitle>Challenge & Approche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Challenge</label>
            <Textarea
              value={projectData.challenge}
              onChange={(e) => setProjectData(prev => ({ ...prev, challenge: e.target.value }))}
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Approche</label>
            <Textarea
              value={projectData.approach}
              onChange={(e) => setProjectData(prev => ({ ...prev, approach: e.target.value }))}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Sections de contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectData.sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={(content) => updateSection(section.id, content)}
                onRemove={() => removeSection(section.id)}
              />
            ))}
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => addSection('text')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Texte
              </Button>
              <Button
                variant="outline"
                onClick={() => addSection('image')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Image
              </Button>
              <Button
                variant="outline"
                onClick={() => addSection('video')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Vidéo
              </Button>
              <Button
                variant="outline"
                onClick={() => addSection('image-grid')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Grille d'images
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour l'upload d'images
const ImageUploadZone: React.FC<{
  value: string;
  onChange: (src: string) => void;
}> = ({ value, onChange }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Ici on uploadera le fichier et on récupérera l'URL
      // Pour l'instant, on simule avec un URL temporaire
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      {value ? (
        <div className="relative">
          <img src={value} alt="Preview" className="max-h-48 mx-auto rounded" />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onChange('')}
          >
            Supprimer
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 mb-2">Cliquez pour ajouter une image</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Button variant="outline" type="button">
              Choisir une image
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

// Composant pour éditer une section
const SectionEditor: React.FC<{
  section: ContentSection;
  onUpdate: (content: any) => void;
  onRemove: () => void;
}> = ({ section, onUpdate, onRemove }) => {
  const renderEditor = () => {
    switch (section.type) {
      case 'text':
        return (
          <Textarea
            value={section.content.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={4}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <ImageUploadZone
              value={section.content.src || ''}
              onChange={(src) => onUpdate({ ...section.content, src })}
            />
            <Input
              placeholder="Texte alternatif"
              value={section.content.alt || ''}
              onChange={(e) => onUpdate({ ...section.content, alt: e.target.value })}
            />
          </div>
        );
      
      default:
        return <div>Type de section non supporté</div>;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium capitalize">{section.type}</h4>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          Supprimer
        </Button>
      </div>
      {renderEditor()}
    </div>
  );
};