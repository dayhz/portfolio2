import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Eye, Plus, Trash2, GripVertical, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { ServicesSection, ServiceItem } from '../../../../shared/types/homepage';

interface ServicesEditorProps {
  onPreview?: (data: ServicesSection) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface DragItem {
  id: number;
  index: number;
}

const COLOR_CLASS_OPTIONS = [
  { value: 'services_bg_colored', label: 'Coloré (services_bg_colored)' },
  { value: 'services_bg_default', label: 'Par défaut (services_bg_default)' },
  { value: '', label: 'Aucun' }
];

export function ServicesEditor({ onPreview, onUnsavedChanges }: ServicesEditorProps) {
  const [formData, setFormData] = useState<ServicesSection>({
    title: '',
    description: '',
    services: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [newService, setNewService] = useState({
    number: '',
    title: '',
    description: '',
    link: '',
    colorClass: 'services_bg_default'
  });
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

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

  // Note: We don't need separate mutations for add/remove/reorder services
  // We'll handle everything through the main updateServicesContent mutation

  // Initialize form data when services data is loaded
  useEffect(() => {
    if (servicesData) {
      setFormData(servicesData);
      setHasUnsavedChanges(false);
    }
  }, [servicesData]);

  // Notify parent component about unsaved changes
  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChanges]);

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

  // Handle add service
  const handleAddService = () => {
    if (!newService.number.trim() || !newService.title.trim() || !newService.description.trim() || !newService.link.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Generate a temporary ID for the new service
    const newId = Math.max(0, ...formData.services.map(s => s.id)) + 1;
    
    const newServiceItem: ServiceItem = {
      id: newId,
      number: newService.number.trim(),
      title: newService.title.trim(),
      description: newService.description.trim(),
      link: newService.link.trim(),
      colorClass: newService.colorClass
    };

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newServiceItem]
    }));
    
    setHasUnsavedChanges(true);
    setIsAddDialogOpen(false);
    setNewService({
      number: '',
      title: '',
      description: '',
      link: '',
      colorClass: 'services_bg_default'
    });
    toast.success('Service ajouté (n\'oubliez pas de sauvegarder)');
  };

  // Handle edit service
  const handleEditService = (service: ServiceItem) => {
    setEditingService(service);
    setNewService({
      number: service.number,
      title: service.title,
      description: service.description,
      link: service.link,
      colorClass: service.colorClass
    });
    setIsEditDialogOpen(true);
  };

  // Handle update service
  const handleUpdateService = () => {
    if (!editingService) return;

    if (!newService.number.trim() || !newService.title.trim() || !newService.description.trim() || !newService.link.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Update the service in the current form data
    const updatedServices = formData.services.map(service => 
      service.id === editingService.id 
        ? {
            ...service,
            number: newService.number.trim(),
            title: newService.title.trim(),
            description: newService.description.trim(),
            link: newService.link.trim(),
            colorClass: newService.colorClass
          }
        : service
    );

    const updatedFormData = {
      ...formData,
      services: updatedServices
    };

    setFormData(updatedFormData);
    setHasUnsavedChanges(true);
    setIsEditDialogOpen(false);
    setEditingService(null);
    setNewService({
      number: '',
      title: '',
      description: '',
      link: '',
      colorClass: 'services_bg_default'
    });
    toast.success('Service modifié (n\'oubliez pas de sauvegarder)');
  };

  // Handle remove service
  const handleRemoveService = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    }));
    setHasUnsavedChanges(true);
    toast.success('Service supprimé (n\'oubliez pas de sauvegarder)');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, service: ServiceItem, index: number) => {
    setDraggedItem({ id: service.id, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const dragIndex = draggedItem.index;
    if (dragIndex === dropIndex) return;

    // Create new order
    const newServices = [...formData.services];
    const draggedService = newServices[dragIndex];
    
    // Remove dragged item
    newServices.splice(dragIndex, 1);
    
    // Insert at new position
    newServices.splice(dropIndex, 0, draggedService);

    // Update form data
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
    
    setHasUnsavedChanges(true);
    setDraggedItem(null);
    toast.success('Services réorganisés (n\'oubliez pas de sauvegarder)');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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
          Gérez le titre, la description et les services proposés
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

        {/* Services Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Services ({formData.services.length})</Label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau service</DialogTitle>
                  <DialogDescription>
                    Ajoutez un service à votre section services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-number">Numéro *</Label>
                      <Input
                        id="service-number"
                        value={newService.number}
                        onChange={(e) => setNewService(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="Ex: 1., 2., 3..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-color">Classe de couleur</Label>
                      <Select
                        value={newService.colorClass}
                        onValueChange={(value) => setNewService(prev => ({ ...prev, colorClass: value }))}
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
                  <div className="space-y-2">
                    <Label htmlFor="service-title">Titre *</Label>
                    <Input
                      id="service-title"
                      value={newService.title}
                      onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Produits, Apps, Sites Web..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-description">Description *</Label>
                    <Textarea
                      id="service-description"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez ce service..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-link">Lien *</Label>
                    <Input
                      id="service-link"
                      value={newService.link}
                      onChange={(e) => setNewService(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="Ex: work@filter=website.html#options"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewService({
                        number: '',
                        title: '',
                        description: '',
                        link: '',
                        colorClass: 'services_bg_default'
                      });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddService}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List */}
          {formData.services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun service ajouté pour le moment</p>
              <p className="text-sm">Cliquez sur "Ajouter un service" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div
                  key={service.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, service, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-4 p-4 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-colors ${
                    draggedItem?.id === service.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {service.number}
                      </span>
                      <h4 className="font-semibold">{service.title}</h4>
                      {service.colorClass && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {service.colorClass}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-xs text-gray-500 font-mono">{service.link}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le service</DialogTitle>
              <DialogDescription>
                Modifiez les informations du service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-service-number">Numéro *</Label>
                  <Input
                    id="edit-service-number"
                    value={newService.number}
                    onChange={(e) => setNewService(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="Ex: 1., 2., 3..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-service-color">Classe de couleur</Label>
                  <Select
                    value={newService.colorClass}
                    onValueChange={(value) => setNewService(prev => ({ ...prev, colorClass: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="edit-service-title">Titre *</Label>
                <Input
                  id="edit-service-title"
                  value={newService.title}
                  onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Produits, Apps, Sites Web..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service-description">Description *</Label>
                <Textarea
                  id="edit-service-description"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez ce service..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service-link">Lien *</Label>
                <Input
                  id="edit-service-link"
                  value={newService.link}
                  onChange={(e) => setNewService(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="Ex: work@filter=website.html#options"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingService(null);
                  setNewService({
                    number: '',
                    title: '',
                    description: '',
                    link: '',
                    colorClass: 'services_bg_default'
                  });
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateService}>
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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