import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { WorkSection } from '../../../../shared/types/homepage';

interface WorkEditorProps {
  onPreview?: (data: WorkSection) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export function WorkEditor({ onPreview, onUnsavedChanges }: WorkEditorProps) {
  const [formData, setFormData] = useState<WorkSection>({
    title: '',
    description: '',
    linkText: '',
    linkUrl: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch work content
  const { data: workData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'work'],
    queryFn: () => homepageAPI.getWorkContent(),
  });

  // Update work content mutation
  const updateMutation = useMutation({
    mutationFn: (data: WorkSection) => homepageAPI.updateWorkContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'work'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Work mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating work section:', error);
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

  // Initialize form data when work data is loaded
  useEffect(() => {
    if (workData) {
      setFormData(workData);
      setHasUnsavedChanges(false);
    }
  }, [workData]);

  // Notify parent component about unsaved changes
  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChanges]);

  // Handle field changes
  const handleFieldChange = (field: keyof WorkSection, value: string) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Work...</span>
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
              Erreur lors du chargement de la section Work: {error.message}
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
          💼 Section Work
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre, la description et le lien de la section Work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="work-title">Titre *</Label>
          <Input
            id="work-title"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Ex: Work"
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="work-description">Description *</Label>
          <Textarea
            id="work-description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Décrivez vos projets et votre approche..."
            rows={4}
            className={validationErrors.description ? 'border-red-500' : ''}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        {/* Link Text Field */}
        <div className="space-y-2">
          <Label htmlFor="work-link-text">Texte du lien *</Label>
          <Input
            id="work-link-text"
            value={formData.linkText}
            onChange={(e) => handleFieldChange('linkText', e.target.value)}
            placeholder="Ex: See all projects"
            className={validationErrors.linkText ? 'border-red-500' : ''}
          />
          {validationErrors.linkText && (
            <p className="text-sm text-red-600">{validationErrors.linkText}</p>
          )}
        </div>

        {/* Link URL Field */}
        <div className="space-y-2">
          <Label htmlFor="work-link-url">URL du lien *</Label>
          <Input
            id="work-link-url"
            value={formData.linkUrl}
            onChange={(e) => handleFieldChange('linkUrl', e.target.value)}
            placeholder="Ex: work.html"
            className={validationErrors.linkUrl ? 'border-red-500' : ''}
          />
          {validationErrors.linkUrl && (
            <p className="text-sm text-red-600">{validationErrors.linkUrl}</p>
          )}
        </div>

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