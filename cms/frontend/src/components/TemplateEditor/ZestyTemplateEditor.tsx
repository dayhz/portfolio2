import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Eye, Upload } from 'lucide-react';

interface ZestyProjectData {
  // Header section
  title: string;
  heroImage: string;
  
  // About section
  challenge: string;
  approach: string;
  
  // Project info
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  
  // Content images (exact positions from template)
  image1: string; // First full-width image
  textSection1: string; // Text between images
  image2: string; // Second full-width image
  image3: string; // First image in grid
  image4: string; // Second image in grid
  video1: string; // First video
  video1Poster: string;
  video2: string; // Second video
  video2Poster: string;
  
  // Testimonial
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  testimonialImage: string;
  
  // Final images
  finalImage: string; // Big final image
  textSection2: string; // Final text section
  finalImage1: string; // Last section image 1
  finalImage2: string; // Last section image 2
}

export const ZestyTemplateEditor: React.FC = () => {
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

  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof ZestyProjectData, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const updateScope = (scopeText: string) => {
    setProjectData(prev => ({ 
      ...prev, 
      scope: scopeText.split('\n').filter(s => s.trim()) 
    }));
  };

  const saveProject = async () => {
    setIsLoading(true);
    // Simulate save
    setTimeout(() => {
      setIsLoading(false);
      alert('Projet sauvegardé !');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Éditeur Template Zesty</h1>
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

// Composant pour l'upload d'images
const ImageUploadZone: React.FC<{
  value: string;
  onChange: (src: string) => void;
  label: string;
  dimensions?: string;
  format?: string;
}> = ({ value, onChange, label, dimensions, format }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]">
      {value ? (
        <div className="relative">
          <img src={value} alt={label} className="max-h-48 mx-auto rounded" />
          <div className="flex gap-2 mt-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
            >
              Supprimer
            </Button>
            <label htmlFor={`upload-${label}`} className="cursor-pointer">
              <Button variant="outline" size="sm" type="button">
                Remplacer
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center justify-center h-full">
          <Plus className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-2 font-medium">{label}</p>
          {dimensions && (
            <p className="text-xs text-gray-400 mb-1">📐 {dimensions}</p>
          )}
          {format && (
            <p className="text-xs text-gray-400 mb-3">📄 {format}</p>
          )}
          <label htmlFor={`upload-${label}`} className="cursor-pointer">
            <Button variant="outline" type="button">
              <Upload className="w-4 h-4 mr-2" />
              Ajouter Image
            </Button>
          </label>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id={`upload-${label}`}
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
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onVideoChange(url);
    }
  };

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onPosterChange(url);
    }
  };

  return (
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
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center justify-center h-full">
          <Plus className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-2 font-medium">{label}</p>
          {videoDimensions && (
            <div className="text-xs text-gray-400 mb-2">
              <p>🎥 Vidéo: {videoDimensions}</p>
              <p>🖼️ Poster: {posterDimensions}</p>
            </div>
          )}
          {videoFormat && (
            <div className="text-xs text-gray-400 mb-3">
              <p>📄 Vidéo: {videoFormat}</p>
              <p>📄 Poster: {posterFormat}</p>
            </div>
          )}
          <div className="flex gap-2">
            <label htmlFor={`upload-video-${label}`} className="cursor-pointer">
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Vidéo
              </Button>
            </label>
            <label htmlFor={`upload-poster-${label}`} className="cursor-pointer">
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Poster
              </Button>
            </label>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
        id={`upload-video-${label}`}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handlePosterUpload}
        className="hidden"
        id={`upload-poster-${label}`}
      />
    </div>
  );
};