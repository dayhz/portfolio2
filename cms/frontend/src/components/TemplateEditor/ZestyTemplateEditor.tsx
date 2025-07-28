import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { templateProjectService, type ZestyProjectData } from '@/services/templateProjectService';
import { ProjectShareService } from '@/services/projectShareService';
import { ScopeSelector } from './ScopeSelector';
import { Plus, Save, Eye, Upload, Share, ExternalLink } from 'lucide-react';



interface ZestyTemplateEditorProps {
  projectData: ZestyProjectData;
  onDataChange: (data: ZestyProjectData) => void;
  projectId?: string;
  onPreview?: () => void;
}

export const ZestyTemplateEditor: React.FC<ZestyTemplateEditorProps> = ({ 
  projectData, 
  onDataChange,
  projectId,
  onPreview 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sauvegarde automatique toutes les 30 secondes si il y a des changements
  useEffect(() => {
    if (hasUnsavedChanges && projectId) {
      // Annuler le timeout précédent
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Programmer une sauvegarde automatique dans 30 secondes
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 30000); // 30 secondes
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, projectData, projectId]);

  const autoSave = async () => {
    if (!hasUnsavedChanges || !projectId) return;
    
    try {
      await templateProjectService.saveProject(projectData, projectId);
      setLastSaved(new Date().toLocaleTimeString('fr-FR'));
      setHasUnsavedChanges(false);
      
      // Notification discrète de sauvegarde automatique
      const notification = document.createElement('div');
      notification.innerHTML = `💾 Sauvegarde automatique effectuée`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6b7280;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        opacity: 0.9;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const updateField = (field: keyof ZestyProjectData, value: string) => {
    const newData = { ...projectData, [field]: value };
    onDataChange(newData);
    setHasUnsavedChanges(true); // Marquer comme ayant des changements non sauvegardés
  };

  const updateScope = (scopes: string[]) => {
    const newData = { 
      ...projectData, 
      scope: scopes
    };
    onDataChange(newData);
  };

  const saveProject = async () => {
    // Validation des champs obligatoires
    if (!projectData.title.trim()) {
      alert('⚠️ Veuillez saisir un titre pour le projet.');
      return;
    }

    if (!projectData.client.trim()) {
      alert('⚠️ Veuillez saisir le nom du client.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving project data:', projectData);
      const savedProject = await templateProjectService.saveProject(projectData, projectId);
      setLastSaved(new Date().toLocaleTimeString('fr-FR'));
      setHasUnsavedChanges(false); // Réinitialiser le flag de changements
      
      // Notification de succès plus discrète
      const notification = document.createElement('div');
      notification.innerHTML = `✅ Projet "${savedProject.title}" sauvegardé !`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('❌ Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const shareProject = async () => {
    if (!projectData.title.trim()) {
      alert('⚠️ Veuillez saisir un titre avant de partager.');
      return;
    }

    try {
      let shareUrl: string;
      
      // Si le projet est sauvegardé, utiliser l'ID
      if (projectId) {
        shareUrl = ProjectShareService.generateProjectURL(projectId);
      } else {
        // Sinon, encoder les données dans l'URL
        shareUrl = ProjectShareService.generateDataURL(projectData);
      }

      // Copier dans le presse-papiers
      const success = await ProjectShareService.copyToClipboard(shareUrl);
      
      if (success) {
        // Notification de succès
        const notification = document.createElement('div');
        notification.innerHTML = `🔗 Lien de partage copié dans le presse-papiers !`;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 1000;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
        
        console.log('Share URL:', shareUrl);
      } else {
        // Fallback: afficher l'URL dans une modal
        prompt('Copiez ce lien pour partager votre projet:', shareUrl);
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      alert('❌ Erreur lors de la génération du lien de partage.');
    }
  };

  const openInNewTab = () => {
    if (!projectData.title.trim()) {
      alert('⚠️ Veuillez saisir un titre avant d\'ouvrir l\'aperçu.');
      return;
    }

    try {
      let url: string;
      
      if (projectId) {
        url = ProjectShareService.generateProjectURL(projectId);
      } else {
        url = ProjectShareService.generateDataURL(projectData);
      }
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening project:', error);
      alert('❌ Erreur lors de l\'ouverture de l\'aperçu.');
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
              {hasUnsavedChanges && (
                <span className="ml-2 text-orange-500">• Modifications non sauvegardées</span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={saveProject} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button variant="outline" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button 
            variant="outline" 
            onClick={shareProject}
            title="Copier le lien de partage du projet"
          >
            <Share className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button 
            variant="outline" 
            onClick={openInNewTab}
            title="Ouvrir le projet dans un nouvel onglet"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir
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
            <label className="block text-sm font-medium mb-2">Scope</label>
            <ScopeSelector
              selectedScopes={projectData.scope}
              onChange={updateScope}
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
        key={value || 'empty'} // Force re-render when value changes
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

// Composant simplifié pour l'upload de vidéos
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
  
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const posterInputRef = React.useRef<HTMLInputElement>(null);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Video file selected:', file.name, file.type, file.size);
      
      if (!file.type.startsWith('video/')) {
        alert('Veuillez sélectionner un fichier vidéo');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB
        alert('Fichier trop volumineux (max 100MB)');
        return;
      }
      
      try {
        // Créer une URL temporaire pour l'aperçu immédiat
        const tempUrl = URL.createObjectURL(file);
        onVideoChange(tempUrl);
        
        // Uploader le fichier vers l'API media
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('description', `Vidéo pour ${label}`);
        
        console.log('Uploading video to media API...');
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const mediaFile = await response.json();
        console.log('Video uploaded successfully:', mediaFile);
        
        // Remplacer l'URL temporaire par l'URL permanente
        // Ne pas révoquer immédiatement pour éviter les problèmes d'affichage
        onVideoChange(mediaFile.url);
        
        // Révoquer l'URL temporaire après un délai pour laisser le temps au navigateur
        setTimeout(() => {
          URL.revokeObjectURL(tempUrl);
        }, 1000);
        
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Erreur lors de l\'upload de la vidéo');
      }
    }
  };

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Poster file selected:', file.name, file.type);
      
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      
      try {
        // Créer une URL temporaire pour l'aperçu immédiat
        const tempUrl = URL.createObjectURL(file);
        onPosterChange(tempUrl);
        
        // Uploader le fichier vers l'API media
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('description', `Poster pour ${label}`);
        
        console.log('Uploading poster to media API...');
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const mediaFile = await response.json();
        console.log('Poster uploaded successfully:', mediaFile);
        
        // Remplacer l'URL temporaire par l'URL permanente
        // Ne pas révoquer immédiatement pour éviter les problèmes d'affichage
        onPosterChange(mediaFile.url);
        
        // Révoquer l'URL temporaire après un délai pour laisser le temps au navigateur
        setTimeout(() => {
          URL.revokeObjectURL(tempUrl);
        }, 1000);
        
      } catch (error) {
        console.error('Error uploading poster:', error);
        alert('Erreur lors de l\'upload du poster');
      }
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

      {/* Video Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]">
        {videoSrc ? (
          <div className="text-center">
            <video 
              src={videoSrc} 
              poster={posterSrc}
              className="max-h-48 mx-auto rounded mb-2"
              controls
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVideoChange('')}
            >
              Supprimer Vidéo
            </Button>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Plus className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-3 font-medium">Cliquez pour ajouter une vidéo</p>
            <Button 
              variant="outline" 
              onClick={() => videoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Sélectionner Vidéo
            </Button>
          </div>
        )}
      </div>

      {/* Poster Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px]">
        {posterSrc ? (
          <div className="text-center">
            <img 
              src={posterSrc} 
              alt="Poster"
              className="max-h-24 mx-auto rounded mb-2"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPosterChange('')}
            >
              Supprimer Poster
            </Button>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-2 text-sm">Poster (optionnel)</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => posterInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Sélectionner Poster
            </Button>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/mov"
        onChange={handleVideoChange}
        style={{ display: 'none' }}
      />
      <input
        ref={posterInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handlePosterChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};