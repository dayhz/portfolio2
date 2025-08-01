import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Eye, AlertCircle, Type, Highlighter } from 'lucide-react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/TiptapEditor';
import { HeroSectionData, ValidationError } from '../../../../shared/types/services';

interface HeroSectionEditorProps {
  data: HeroSectionData;
  onChange: (data: HeroSectionData) => void;
  onSave?: (data: HeroSectionData) => Promise<void>;
  onPreview?: (data: HeroSectionData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
  isSaving?: boolean;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export function HeroSectionEditor({
  data,
  onChange,
  onSave,
  onPreview,
  errors = [],
  isLoading = false,
  isSaving = false,
  onUnsavedChanges
}: HeroSectionEditorProps) {
  const [formData, setFormData] = useState<HeroSectionData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when prop data changes
  useEffect(() => {
    setFormData(data);
    setHasUnsavedChanges(false);
  }, [data]);

  // Process validation errors
  useEffect(() => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      if (error.section === 'hero') {
        errorMap[error.field] = error.message;
      }
    });
    setValidationErrors(errorMap);
  }, [errors]);

  // Notify parent about unsaved changes
  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChanges]);

  // Handle field changes with debounced onChange
  const handleFieldChange = useCallback((field: keyof HeroSectionData, value: string) => {
    const newData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Debounced onChange to parent
    const timeoutId = setTimeout(() => {
      onChange(newData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, validationErrors, onChange]);

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      toast.success('Section Hero sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving hero section:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  // Real-time validation
  const getFieldError = (field: string): string | undefined => {
    return validationErrors[field];
  };

  const isFieldValid = (field: string): boolean => {
    return !validationErrors[field];
  };

  // Character count helpers
  const getTitleCharCount = () => formData.title?.length || 0;
  const getDescriptionCharCount = () => {
    // Count characters in plain text (strip HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.description || '';
    return tempDiv.textContent?.length || 0;
  };
  const getHighlightCharCount = () => formData.highlightText?.length || 0;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Section Hero
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre principal, la description et le texte en surbrillance de votre page Services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="hero-title" className="flex items-center gap-2">
            Titre Principal *
            <span className="text-xs text-gray-500">
              ({getTitleCharCount()}/200)
            </span>
          </Label>
          <Input
            id="hero-title"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Ex: Services de Design & Développement"
            className={!isFieldValid('title') ? 'border-red-500' : ''}
            maxLength={200}
            aria-invalid={!isFieldValid('title')}
          />
          {getFieldError('title') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('title')}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Le titre principal de votre page Services (10-200 caractères)
          </p>
        </div>

        {/* Description Field with Rich Text Editor */}
        <div className="space-y-2">
          <Label htmlFor="hero-description" className="flex items-center gap-2">
            Description *
            <span className="text-xs text-gray-500">
              ({getDescriptionCharCount()}/1000)
            </span>
          </Label>
          <div className={!isFieldValid('description') ? 'border border-red-500 rounded-md' : ''}>
            <TiptapEditor
              content={formData.description || ''}
              onChange={(content) => handleFieldChange('description', content)}
            />
          </div>
          {getFieldError('description') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('description')}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Description détaillée de vos services avec formatage riche (50-1000 caractères)
          </p>
        </div>

        {/* Highlight Text Field */}
        <div className="space-y-2">
          <Label htmlFor="hero-highlight" className="flex items-center gap-2">
            <Highlighter className="h-4 w-4" />
            Texte en Surbrillance
            <span className="text-xs text-gray-500">
              ({getHighlightCharCount()}/50)
            </span>
          </Label>
          <Input
            id="hero-highlight"
            value={formData.highlightText || ''}
            onChange={(e) => handleFieldChange('highlightText', e.target.value)}
            placeholder="Ex: 17+ années d'expérience"
            className={!isFieldValid('highlightText') ? 'border-red-500' : ''}
            maxLength={50}
            aria-invalid={!isFieldValid('highlightText')}
          />
          {getFieldError('highlightText') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('highlightText')}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Texte court à mettre en évidence (optionnel, max 50 caractères)
          </p>
        </div>

        {/* Content Preview */}
        {(formData.title || formData.description || formData.highlightText) && (
          <div className="space-y-2">
            <Label>Aperçu du contenu</Label>
            <Card className="p-4 bg-gray-50">
              <div className="space-y-3">
                {formData.title && (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {formData.title}
                  </h1>
                )}
                {formData.highlightText && (
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {formData.highlightText}
                  </div>
                )}
                {formData.description && (
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" data-testid="loading-spinner" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Sauvegarder et Publier
            </Button>
          )}
          
          {onPreview && (
            <Button
              variant="outline"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Prévisualiser
            </Button>
          )}
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder et publier vos changements.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Erreurs de validation détectées :</p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field} className="text-sm">
                      <strong>{field}:</strong> {message}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}