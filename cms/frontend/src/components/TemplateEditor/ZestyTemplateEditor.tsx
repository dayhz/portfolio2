import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { templateProjectService, type ZestyProjectData } from '@/services/templateProjectService';
import { Plus, Save, Eye, Upload } from 'lucide-react';



interface ZestyTemplateEditorProps {
  projectData: ZestyProjectData;
  onDataChange: (data: ZestyProjectData) => void;
  projectId?: string;
}

export const ZestyTemplateEditor: React.FC<ZestyTemplateEditorProps> = ({ 
  projectData, 
  onDataChange,
  projectId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const updateField = (field: keyof ZestyProjectData, value: string) => {
    const newData = { ...projectData, [field]: value };
    onDataChange(newData);
  };

  const updateScope = (scopeText: string) => {
    const newData = { 
      ...projectData, 
      scope: scopeText.split('\n').filter(s => s.trim()) 
    };
    onDataChange(newData);
  };

  const saveProject = async () => {
    if (!projectData.title.trim()) {
      alert('Veuillez saisir un titre pour le projet.');
      return;
    }

    if (!projectData.client.trim()) {
      alert('Veuillez saisir le nom du client.');
      return;
    }

    setIsLoading(true);
    try {
      const savedProject = await templateProjectService.saveProject(projectData, projectId);
      setLastSaved(new Date().toLocaleTimeString());
      alert(`Projet "${savedProject.title}" sauvegardé avec succès !`);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Éditeur Template Zesty</h1>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière sauvegarde : {lastSaved}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={saveProject} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Section Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre principal</label>
            <Input
              value={projectData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Talk with strangers until the chat resets"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Image Hero</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions recommandées: 1920x1080px • Format: JPG, PNG, WEBP • Ratio: 16:9
            </div>
            <ImageUploadZone
              value={projectData.heroImage}
              onChange={(src) => updateField('heroImage', src)}
              label="Image Hero principale"
              dimensions="1920x1080px"
              format="JPG, PNG, WEBP"
            />
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>Section À Propos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Challenge</label>
            <Textarea
              value={projectData.challenge}
              onChange={(e) => updateField('challenge', e.target.value)}
              rows={4}
              placeholder="The internet is overwhelming..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Approach</label>
            <Textarea
              value={projectData.approach}
              onChange={(e) => updateField('approach', e.target.value)}
              rows={4}
              placeholder="I started this project by mapping out..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <Input
                value={projectData.client}
                onChange={(e) => updateField('client', e.target.value)}
                placeholder="Zesty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Année</label>
              <Input
                value={projectData.year}
                onChange={(e) => updateField('year', e.target.value)}
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durée</label>
              <Input
                value={projectData.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="9 weeks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Input
                value={projectData.type}
                onChange={(e) => updateField('type', e.target.value)}
                placeholder="Mobile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industrie</label>
              <Input
                value={projectData.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder="Messaging"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Scope (un par ligne)</label>
            <Textarea
              value={projectData.scope.join('\n')}
              onChange={(e) => updateScope(e.target.value)}
              placeholder="Concept&#10;UI/UX&#10;Digital Design&#10;Icon Design&#10;Motion Prototype"
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Sections - Exact Template Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Sections de Contenu (Structure Template)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Image 1 - Full width */}
          <div>
            <label className="block text-sm font-medium mb-2">Image 1 (Pleine largeur)</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 1200x675px • Format: JPG, PNG, WEBP, AVIF • Ratio: 16:9
            </div>
            <ImageUploadZone
              value={projectData.image1}
              onChange={(src) => updateField('image1', src)}
              label="Image Section 1"
              dimensions="1200x675px"
              format="JPG, PNG, WEBP, AVIF"
            />
          </div>

          {/* Text Section 1 */}
          <div>
            <label className="block text-sm font-medium mb-2">Texte Section 1</label>
            <Textarea
              value={projectData.textSection1}
              onChange={(e) => updateField('textSection1', e.target.value)}
              rows={3}
              placeholder="For Zesty, I chose to use a dark UI..."
            />
          </div>

          {/* Image 2 - Full width */}
          <div>
            <label className="block text-sm font-medium mb-2">Image 2 (Pleine largeur)</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 1200x675px • Format: JPG, PNG, WEBP, AVIF • Ratio: 16:9
            </div>
            <ImageUploadZone
              value={projectData.image2}
              onChange={(src) => updateField('image2', src)}
              label="Image Section 2"
              dimensions="1200x675px"
              format="JPG, PNG, WEBP, AVIF"
            />
          </div>

          {/* Image Grid - 2 images side by side */}
          <div>
            <label className="block text-sm font-medium mb-2">Grille d'Images (2 côte à côte)</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 580x400px chacune • Format: JPG, PNG, WEBP • Ratio: 3:2
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadZone
                value={projectData.image3}
                onChange={(src) => updateField('image3', src)}
                label="Image Gauche"
                dimensions="580x400px"
                format="JPG, PNG, WEBP"
              />
              <ImageUploadZone
                value={projectData.image4}
                onChange={(src) => updateField('image4', src)}
                label="Image Droite"
                dimensions="580x400px"
                format="JPG, PNG, WEBP"
              />
            </div>
          </div>

          {/* Video Sections */}
          <div>
            <label className="block text-sm font-medium mb-2">Vidéo 1</label>
            <div className="text-xs text-gray-500 mb-2">
              🎥 Vidéo: 1200x675px, MP4, max 50MB • 🖼️ Poster: 1200x675px, JPG/PNG • Ratio: 16:9
            </div>
            <div className="space-y-2">
              <VideoUploadZone
                videoSrc={projectData.video1}
                posterSrc={projectData.video1Poster}
                onVideoChange={(src) => updateField('video1', src)}
                onPosterChange={(src) => updateField('video1Poster', src)}
                label="Vidéo 1"
                videoDimensions="1200x675px"
                posterDimensions="1200x675px"
                videoFormat="MP4 (max 50MB)"
                posterFormat="JPG, PNG"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vidéo 2</label>
            <div className="text-xs text-gray-500 mb-2">
              🎥 Vidéo: 1200x675px, MP4, max 50MB • 🖼️ Poster: 1200x675px, JPG/PNG • Ratio: 16:9
            </div>
            <div className="space-y-2">
              <VideoUploadZone
                videoSrc={projectData.video2}
                posterSrc={projectData.video2Poster}
                onVideoChange={(src) => updateField('video2', src)}
                onPosterChange={(src) => updateField('video2Poster', src)}
                label="Vidéo 2"
                videoDimensions="1200x675px"
                posterDimensions="1200x675px"
                videoFormat="MP4 (max 50MB)"
                posterFormat="JPG, PNG"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial Section */}
      <Card>
        <CardHeader>
          <CardTitle>Section Témoignage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Citation</label>
            <Textarea
              value={projectData.testimonialQuote}
              onChange={(e) => updateField('testimonialQuote', e.target.value)}
              rows={3}
              placeholder="Zesty is a little passion project of mine..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Auteur</label>
              <Input
                value={projectData.testimonialAuthor}
                onChange={(e) => updateField('testimonialAuthor', e.target.value)}
                placeholder="Lawson Sydney"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rôle</label>
              <Input
                value={projectData.testimonialRole}
                onChange={(e) => updateField('testimonialRole', e.target.value)}
                placeholder="Independent Product Designer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Photo de profil</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 120x120px (affichée 60x60px) • Format: JPG, PNG • Ratio: 1:1 (carré)
            </div>
            <ImageUploadZone
              value={projectData.testimonialImage}
              onChange={(src) => updateField('testimonialImage', src)}
              label="Photo Profil"
              dimensions="120x120px"
              format="JPG, PNG"
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Sections Finales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Big final image */}
          <div>
            <label className="block text-sm font-medium mb-2">Grande Image Finale</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 1920x1080px • Format: JPG, PNG, WEBP, AVIF • Ratio: 16:9 • Pleine largeur
            </div>
            <ImageUploadZone
              value={projectData.finalImage}
              onChange={(src) => updateField('finalImage', src)}
              label="Grande Image Finale"
              dimensions="1920x1080px"
              format="JPG, PNG, WEBP, AVIF"
            />
          </div>

          {/* Final text */}
          <div>
            <label className="block text-sm font-medium mb-2">Texte Final</label>
            <Textarea
              value={projectData.textSection2}
              onChange={(e) => updateField('textSection2', e.target.value)}
              rows={3}
              placeholder="For this project, I also created some fun..."
            />
          </div>

          {/* Last two images */}
          <div>
            <label className="block text-sm font-medium mb-2">Dernières Images</label>
            <div className="text-xs text-gray-500 mb-2">
              📐 Dimensions: 1200x675px chacune • Format: JPG, PNG, WEBP, AVIF • Ratio: 16:9
            </div>
            <div className="space-y-4">
              <ImageUploadZone
                value={projectData.finalImage1}
                onChange={(src) => updateField('finalImage1', src)}
                label="Avant-dernière Image"
                dimensions="1200x675px"
                format="JPG, PNG, WEBP, AVIF"
              />
              <ImageUploadZone
                value={projectData.finalImage2}
                onChange={(src) => updateField('finalImage2', src)}
                label="Dernière Image"
                dimensions="1200x675px"
                format="JPG, PNG, WEBP, AVIF"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour l'upload d'images utilisant le système existant
const ImageUploadZone: React.FC<{
  value: string;
  onChange: (src: string) => void;
  label: string;
  dimensions?: string;
  format?: string;
}> = ({ value, onChange, label, dimensions, format }) => {
  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        {dimensions && (
          <p className="text-xs text-gray-500 mb-1">📐 {dimensions}</p>
        )}
        {format && (
          <p className="text-xs text-gray-500 mb-2">📄 {format}</p>
        )}
      </div>
      <ImageUpload
        value={value}
        onChange={(value) => {
          if (typeof value === 'string') {
            onChange(value);
          } else {
            // Si c'est un File, créer une URL temporaire
            const url = URL.createObjectURL(value);
            onChange(url);
          }
        }}
        onRemove={handleRemove}
        placeholder={`Glissez ${label.toLowerCase()} ici ou cliquez pour parcourir`}
        className="min-h-[200px]"
      />
    </div>
  );
};

// Composant pour l'upload de vidéos
const VideoUploadZone: React.FC<{
  videoSrc: string;
  posterSrc: string;
  onVideoChange: (src: string) => void;
  onPosterChange: (src: string) => void;
  label: string;
  videoDimensions?: string;
  posterDimensions?: string;
  videoFormat?: string;
  posterFormat?: string;
}> = ({ videoSrc, posterSrc, onVideoChange, onPosterChange, label, videoDimensions, posterDimensions, videoFormat, posterFormat }) => {
  const handleVideoUpload = async (file: File) => {
    try {
      // Créer une URL temporaire pour l'aperçu immédiat
      const tempUrl = URL.createObjectURL(file);
      onVideoChange(tempUrl);
      
      // TODO: Implémenter l'upload vers le serveur
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await axiosInstance.post('/media/video', formData);
      // onVideoChange(response.data.url);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Erreur lors de l\'upload de la vidéo. Veuillez réessayer.');
    }
  };

  const handlePosterUpload = async (file: File) => {
    try {
      // Créer une URL temporaire pour l'aperçu immédiat
      const tempUrl = URL.createObjectURL(file);
      onPosterChange(tempUrl);
      
      // TODO: Implémenter l'upload vers le serveur
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await axiosInstance.post('/media', formData);
      // onPosterChange(response.data.url);
    } catch (error) {
      console.error('Error uploading poster:', error);
      alert('Erreur lors de l\'upload du poster. Veuillez réessayer.');
    }
  };

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoUpload(file);
    }
  };

  const handlePosterFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handlePosterUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        {videoDimensions && (
          <div className="text-xs text-gray-500 mb-2">
            <p>🎥 Vidéo: {videoDimensions}</p>
            <p>🖼️ Poster: {posterDimensions}</p>
          </div>
        )}
        {videoFormat && (
          <div className="text-xs text-gray-500 mb-2">
            <p>📄 Vidéo: {videoFormat}</p>
            <p>📄 Poster: {posterFormat}</p>
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]">
        {videoSrc ? (
          <div className="relative">
            <video 
              src={videoSrc} 
              poster={posterSrc}
              className="max-h-48 mx-auto rounded"
              controls
            />
            <div className="flex gap-2 mt-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVideoChange('')}
              >
                Supprimer Vidéo
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Plus className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-2 font-medium">Vidéo</p>
            <label htmlFor={`upload-video-${label}`} className="cursor-pointer">
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter Vidéo
              </Button>
            </label>
          </div>
        )}
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoFileSelect}
          className="hidden"
          id={`upload-video-${label}`}
        />
      </div>

      {/* Poster Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[150px]">
        {posterSrc ? (
          <div className="relative">
            <img 
              src={posterSrc} 
              alt="Poster"
              className="max-h-32 mx-auto rounded"
            />
            <div className="flex gap-2 mt-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPosterChange('')}
              >
                Supprimer Poster
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-2 text-sm">Poster (optionnel)</p>
            <label htmlFor={`upload-poster-${label}`} className="cursor-pointer">
              <Button variant="outline" size="sm" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter Poster
              </Button>
            </label>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePosterFileSelect}
          className="hidden"
          id={`upload-poster-${label}`}
        />
      </div>
    </div>
  );
};