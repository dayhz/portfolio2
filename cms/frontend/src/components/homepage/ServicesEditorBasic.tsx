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
import { ServicesSection } from '../../../../shared/types/homepage';

interface ServicesEditorProps {
  onPreview?: (data: ServicesSection) => void;
}

export function ServicesEditor({ onPreview }: ServicesEditorProps) {
  const [formData, setFormData] = useState<ServicesSection>({
    title: '',
    description: '',
    services: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
  };

  // Handle save
  const handleSave = () => {
    console.log('Données à envoyer:', formData);
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
          />
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
          />
        </div>

        {/* Services Editing */}
        <div className="space-y-4">
          <Label>Services ({formData.services.length})</Label>
          
          {formData.services.map((service, index) => (
            <Card key={service.id} className="p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`service-number-${service.id}`}>Numéro</Label>
                    <Input
                      id={`service-number-${service.id}`}
                      value={service.number}
                      onChange={(e) => {
                        const updatedServices = formData.services.map(s => 
                          s.id === service.id ? { ...s, number: e.target.value } : s
                        );
                        setFormData(prev => ({ ...prev, services: updatedServices }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: 1., 2., 3..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`service-colorClass-${service.id}`}>Classe de couleur</Label>
                    <Input
                      id={`service-colorClass-${service.id}`}
                      value={service.colorClass}
                      onChange={(e) => {
                        const updatedServices = formData.services.map(s => 
                          s.id === service.id ? { ...s, colorClass: e.target.value } : s
                        );
                        setFormData(prev => ({ ...prev, services: updatedServices }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: services_bg_colored"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`service-title-${service.id}`}>Titre du service</Label>
                  <Input
                    id={`service-title-${service.id}`}
                    value={service.title}
                    onChange={(e) => {
                      const updatedServices = formData.services.map(s => 
                        s.id === service.id ? { ...s, title: e.target.value } : s
                      );
                      setFormData(prev => ({ ...prev, services: updatedServices }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Ex: Produits, Apps, Sites Web..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`service-description-${service.id}`}>Description du service</Label>
                  <Textarea
                    id={`service-description-${service.id}`}
                    value={service.description}
                    onChange={(e) => {
                      const updatedServices = formData.services.map(s => 
                        s.id === service.id ? { ...s, description: e.target.value } : s
                      );
                      setFormData(prev => ({ ...prev, services: updatedServices }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Décrivez ce service..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`service-link-${service.id}`}>Lien du service</Label>
                  <Input
                    id={`service-link-${service.id}`}
                    value={service.link}
                    onChange={(e) => {
                      const updatedServices = formData.services.map(s => 
                        s.id === service.id ? { ...s, link: e.target.value } : s
                      );
                      setFormData(prev => ({ ...prev, services: updatedServices }));
                      setHasUnsavedChanges(true);
                    }}
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