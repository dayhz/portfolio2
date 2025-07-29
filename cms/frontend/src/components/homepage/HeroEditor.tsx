import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Eye, Upload, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { HeroSection } from '../../../../shared/types/homepage';

interface HeroEditorProps {
  onPreview?: (data: HeroSection) => void;
}

export function HeroEditor({ onPreview }: HeroEditorProps) {
  const [formData, setFormData] = useState<HeroSection>({
    title: '',
    description: '',
    videoUrl: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch hero content
  const { data: heroData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'hero'],
    queryFn: () => homepageAPI.getHeroContent(),
  });

  // Update hero content mutation
  const updateMutation = useMutation({
    mutationFn: (data: HeroSection) => homepageAPI.updateHeroContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'hero'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Hero mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating hero section:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
      
      // Handle validation errors
      if (error.message.includes('Validation failed')) {
        try {
          const errorData = JSON.parse(error.message.split('Validation failed: ')[1]);
          if (errorData.errors) {
            const errors: Record<string, string> = {};
            errorData.errors.forEach((err: any) => {
              errors[err.field] = err.message;
            });
            setValidationErrors(errors);
          }
        } catch (parseError) {
          console.error('Error parsing validation errors:', parseError);
        }
      }
    },
  });

  // Initialize form data when hero data is loaded
  useEffect(() => {
    if (heroData) {
      setFormData(heroData);
      setHasUnsavedChanges(false);
    }
  }, [heroData]);

  // Handle form field changes
  const handleFieldChange = (field: keyof HeroSection, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle save
  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  // Validate video URL
  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid (optional field)
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Handle video file upload
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo valide');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Le fichier vidéo est trop volumineux (max 50MB)');
      return;
    }

    try {
      const uploadedFile = await homepageAPI.uploadMedia(file);
      handleFieldChange('videoUrl', uploadedFile.url);
      toast.success('Vidéo uploadée avec succès');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Erreur lors de l\'upload de la vidéo');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Hero...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement de la section Hero: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 Section Hero
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre principal, la description et la vidéo de fond de votre homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="hero-title">Titre Principal *</Label>
          <Input
            id="hero-title"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Ex: Product Designer & Manager"
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="hero-description">Description *</Label>
          <Textarea
            id="hero-description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Décrivez-vous et votre expertise..."
            rows={4}
            className={validationErrors.description ? 'border-red-500' : ''}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-600">{validationErrors.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Minimum 10 caractères. Décrivez votre expertise et ce que vous apportez à vos clients.
          </p>
        </div>

        {/* Video URL Field */}
        <div className="space-y-2">
          <Label htmlFor="hero-video">Vidéo de fond</Label>
          <div className="flex gap-2">
            <Input
              id="hero-video"
              value={formData.videoUrl}
              onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
              placeholder="https://example.com/video.mp4"
              className={validationErrors.videoUrl ? 'border-red-500' : ''}
            />
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('video-upload')?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {validationErrors.videoUrl && (
            <p className="text-sm text-red-600">{validationErrors.videoUrl}</p>
          )}
          {formData.videoUrl && !isValidVideoUrl(formData.videoUrl) && (
            <p className="text-sm text-orange-600">
              L'URL de la vidéo ne semble pas valide
            </p>
          )}
          <p className="text-sm text-gray-500">
            URL de la vidéo de fond ou uploadez un fichier (optionnel, max 50MB)
          </p>
        </div>

        {/* Video Preview */}
        {formData.videoUrl && isValidVideoUrl(formData.videoUrl) && (
          <div className="space-y-2">
            <Label>Aperçu de la vidéo</Label>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={formData.videoUrl}
                className="w-full h-48 object-cover"
                controls
                muted
                preload="metadata"
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Prévisualiser
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos changements.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}