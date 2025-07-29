import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { ServicesSection, ServiceItem } from '../../../../shared/types/homepage';

interface ServicesEditorProps {
  onPreview?: (data: ServicesSection) => void;
}

const COLOR_CLASS_OPTIONS = [
  { value: 'services_bg_colored', label: 'Coloré (services_bg_colored)' },
  { value: 'services_bg_colored is-green', label: 'Vert (services_bg_colored is-green)' },
  { value: 'services_bg_colored is-minty_green', label: 'Vert menthe (services_bg_colored is-minty_green)' },
  { value: '', label: 'Aucun' }
];

export function ServicesEditor({ onPreview }: ServicesEditorProps) {
  const [formData, setFormData] = useState<ServicesSection>({
    title: '',
    description: '',
    services: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch services content
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'services'],
    queryFn: () => homepageAPI.getServicesContent(),
  });

  // Update services content mutation
  const updateMutation = useMutation({
    mutationFn: (data: ServicesSection) => homepageAPI.updateServicesContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'services'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Services mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating services section:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Initialize form data when services data is loaded
  useEffect(() => {
    if (servicesData) {
      setFormData(servicesData);
      setHasUnsavedChanges(false);
    }
  }, [servicesData]);

  // Handle field changes
  const handleFieldChange = (field: keyof ServicesSection, value: string) => {
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

  // Handle service field changes
  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Services...</span>
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
              Erreur lors du chargement de la section Services: {error.message}
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
          🛠️ Section Services
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre, la description et les services proposés sur la homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="services-title">Titre de la section *</Label>
          <Input
            id="services-title"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Ex: Services"
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="services-description">Description *</Label>
          <Textarea
            id="services-description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Décrivez vos services..."
            rows={3}
            className={validationErrors.description ? 'border-red-500' : ''}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <Label>Services ({formData.services.length})</Label>
          
          {formData.services.map((service, index) => (
            <Card key={service.id} className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`service-${index}-number`}>Numéro</Label>
                  <Input
                    id={`service-${index}-number`}
                    value={service.number}
                    onChange={(e) => handleServiceChange(index, 'number', e.target.value)}
                    placeholder="Ex: 1., 2., 3..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`service-${index}-colorClass`}>Classe de couleur</Label>
                  <Select
                    value={service.colorClass}
                    onValueChange={(value) => handleServiceChange(index, 'colorClass', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_CLASS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`service-${index}-title`}>Titre</Label>
                  <Input
                    id={`service-${index}-title`}
                    value={service.title}
                    onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                    placeholder="Ex: Produits, Apps, Sites Web..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`service-${index}-description`}>Description</Label>
                  <Textarea
                    id={`service-${index}-description`}
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    placeholder="Décrivez ce service..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`service-${index}-link`}>Lien</Label>
                  <Input
                    id={`service-${index}-link`}
                    value={service.link}
                    onChange={(e) => handleServiceChange(index, 'link', e.target.value)}
                    placeholder="Ex: work@filter=website.html#options"
                  />
                </div>
              </div>
            </Card>
          ))}
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