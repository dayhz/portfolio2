import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Eye, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { FooterSection, FooterLink } from '../../../../shared/types/homepage';

interface FooterEditorProps {
  onPreview?: (data: FooterSection) => void;
}

export function FooterEditor({ onPreview }: FooterEditorProps) {
  const [formData, setFormData] = useState<FooterSection>({
    title: '',
    email: '',
    copyright: '',
    links: {
      site: [],
      professional: [],
      social: []
    }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch footer content
  const { data: footerData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'footer'],
    queryFn: () => homepageAPI.getFooterContent(),
  });

  // Update footer content mutation
  const updateMutation = useMutation({
    mutationFn: (data: FooterSection) => homepageAPI.updateFooterContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'footer'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Footer mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating footer section:', error);
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

  // Initialize form data when footer data is loaded
  useEffect(() => {
    if (footerData) {
      setFormData(footerData);
      setHasUnsavedChanges(false);
    }
  }, [footerData]);

  // Handle basic field changes
  const handleFieldChange = (field: keyof FooterSection, value: string) => {
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

  // Handle link changes
  const handleLinkChange = (category: keyof FooterSection['links'], index: number, field: keyof FooterLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [category]: prev.links[category].map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Add new link
  const addLink = (category: keyof FooterSection['links']) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [category]: [...prev.links[category], { text: '', url: '' }]
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Remove link
  const removeLink = (category: keyof FooterSection['links'], index: number) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [category]: prev.links[category].filter((_, i) => i !== index)
      }
    }));
    setHasUnsavedChanges(true);
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

  // Validate email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid for site links
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Render link section
  const renderLinkSection = (
    category: keyof FooterSection['links'],
    title: string,
    description: string,
    requireValidUrl: boolean = false
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">{title}</Label>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addLink(category)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
      
      <div className="space-y-3">
        {formData.links[category].map((link, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                value={link.text}
                onChange={(e) => handleLinkChange(category, index, 'text', e.target.value)}
                placeholder="Texte du lien"
                className="text-sm"
              />
              <Input
                value={link.url}
                onChange={(e) => handleLinkChange(category, index, 'url', e.target.value)}
                placeholder={requireValidUrl ? "https://example.com" : "page.html ou https://example.com"}
                className={`text-sm ${requireValidUrl && link.url && !isValidUrl(link.url) ? 'border-red-500' : ''}`}
              />
              {requireValidUrl && link.url && !isValidUrl(link.url) && (
                <p className="text-xs text-red-600">URL invalide</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLink(category, index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {formData.links[category].length === 0 && (
          <p className="text-sm text-gray-400 italic">Aucun lien ajouté</p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Footer...</span>
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
              Erreur lors du chargement de la section Footer: {error.message}
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
          🦶 Section Footer
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez les informations de contact, liens de navigation et réseaux sociaux du footer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Informations générales</h3>
          
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="footer-title">Titre *</Label>
            <Input
              id="footer-title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Ex: Construisons Ensemble"
              className={validationErrors.title ? 'border-red-500' : ''}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="footer-email">Email de contact *</Label>
            <Input
              id="footer-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="contact@example.com"
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600">{validationErrors.email}</p>
            )}
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-sm text-orange-600">
                Format d'email invalide
              </p>
            )}
          </div>

          {/* Copyright Field */}
          <div className="space-y-2">
            <Label htmlFor="footer-copyright">Copyright *</Label>
            <Input
              id="footer-copyright"
              value={formData.copyright}
              onChange={(e) => handleFieldChange('copyright', e.target.value)}
              placeholder="© 2025 Votre Nom — Votre signature"
              className={validationErrors.copyright ? 'border-red-500' : ''}
            />
            {validationErrors.copyright && (
              <p className="text-sm text-red-600">{validationErrors.copyright}</p>
            )}
          </div>
        </div>

        {/* Links Sections */}
        <div className="space-y-8">
          <h3 className="text-lg font-medium border-b pb-2">Liens de navigation</h3>
          
          {/* Site Links */}
          {renderLinkSection(
            'site',
            'Liens du site',
            'Liens de navigation interne (pages du site)',
            false
          )}

          {/* Professional Links */}
          {renderLinkSection(
            'professional',
            'Réseaux professionnels',
            'Liens vers vos profils professionnels (LinkedIn, Dribbble, etc.)',
            true
          )}

          {/* Social Links */}
          {renderLinkSection(
            'social',
            'Réseaux sociaux',
            'Liens vers vos réseaux sociaux (Facebook, Instagram, etc.)',
            true
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