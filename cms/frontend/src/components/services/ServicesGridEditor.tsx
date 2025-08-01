import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Loader2, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle, 
  Edit,
  Palette,
  Grid3X3
} from 'lucide-react';
import { toast } from 'sonner';
import { ServiceItem, ServicesGridData, ValidationError } from '../../../../shared/types/services';

interface ServicesGridEditorProps {
  data: ServicesGridData;
  onChange: (data: ServicesGridData) => void;
  onSave?: (data: ServicesGridData) => Promise<void>;
  onPreview?: (data: ServicesGridData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
}

interface ColorOption {
  value: string;
  label: string;
  colorClass: string;
  preview: string;
}

// Predefined color palette for services
const COLOR_OPTIONS: ColorOption[] = [
  {
    value: '#3B82F6',
    label: 'Bleu',
    colorClass: 'service-blue',
    preview: 'bg-blue-500'
  },
  {
    value: '#10B981',
    label: 'Vert',
    colorClass: 'service-green',
    preview: 'bg-green-500'
  },
  {
    value: '#F59E0B',
    label: 'Orange',
    colorClass: 'service-orange',
    preview: 'bg-amber-500'
  },
  {
    value: '#EF4444',
    label: 'Rouge',
    colorClass: 'service-red',
    preview: 'bg-red-500'
  },
  {
    value: '#8B5CF6',
    label: 'Violet',
    colorClass: 'service-purple',
    preview: 'bg-purple-500'
  },
  {
    value: '#06B6D4',
    label: 'Cyan',
    colorClass: 'service-cyan',
    preview: 'bg-cyan-500'
  },
  {
    value: '#EC4899',
    label: 'Rose',
    colorClass: 'service-pink',
    preview: 'bg-pink-500'
  },
  {
    value: '#6B7280',
    label: 'Gris',
    colorClass: 'service-gray',
    preview: 'bg-gray-500'
  }
];

interface ServiceFormData {
  title: string;
  description: string;
  color: string;
  colorClass: string;
}

interface DragItem {
  id: string;
  index: number;
}

export function ServicesGridEditor({ 
  data, 
  onChange, 
  onSave, 
  onPreview, 
  errors = [], 
  isLoading = false 
}: ServicesGridEditorProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    title: '',
    description: '',
    color: COLOR_OPTIONS[0].value,
    colorClass: COLOR_OPTIONS[0].colorClass
  });
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update validation errors when props change
  useEffect(() => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      if (error.section === 'services') {
        errorMap[error.field] = error.message;
      }
    });
    setValidationErrors(errorMap);
  }, [errors]);

  // Handle service data changes
  const handleDataChange = (newData: ServicesGridData) => {
    onChange(newData);
    setHasUnsavedChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    if (onSave) {
      try {
        toast.info('💾 Sauvegarde et publication en cours...');
        await onSave(data);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving and publishing services:', error);
        toast.error('❌ Erreur lors de la sauvegarde et publication');
      }
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(data);
    }
  };

  // Color picker component
  const ColorPicker = ({ 
    value, 
    onChange, 
    label = "Couleur" 
  }: { 
    value: string; 
    onChange: (color: string, colorClass: string) => void;
    label?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedColor = COLOR_OPTIONS.find(c => c.value === value) || COLOR_OPTIONS[0];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-start gap-2"
          >
            <div 
              className={`w-4 h-4 rounded-full ${selectedColor.preview}`}
            />
            {selectedColor.label}
            <Palette className="h-4 w-4 ml-auto" />
          </Button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-3">
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      onChange(color.value, color.colorClass);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      value === color.value ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.preview}`} />
                    <span className="text-xs">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Validate service form
  const validateServiceForm = (form: ServiceFormData): boolean => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = 'Le titre est obligatoire';
    } else if (form.title.length > 100) {
      errors.title = 'Le titre ne peut pas dépasser 100 caractères';
    }

    if (!form.description.trim()) {
      errors.description = 'La description est obligatoire';
    } else if (form.description.length > 200) {
      errors.description = 'La description ne peut pas dépasser 200 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add service
  const handleAddService = () => {
    if (!validateServiceForm(serviceForm)) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Generate new service
    const newId = `service-${Date.now()}`;
    const newNumber = data.services.length + 1;
    
    const newService: ServiceItem = {
      id: newId,
      number: newNumber,
      title: serviceForm.title.trim(),
      description: serviceForm.description.trim(),
      color: serviceForm.color,
      colorClass: serviceForm.colorClass,
      order: data.services.length
    };

    const newData: ServicesGridData = {
      services: [...data.services, newService]
    };

    handleDataChange(newData);
    setIsAddDialogOpen(false);
    resetServiceForm();
    toast.success('Service ajouté avec succès');
  };

  // Handle edit service
  const handleEditService = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      color: service.color,
      colorClass: service.colorClass
    });
    setIsEditDialogOpen(true);
  };

  // Handle update service
  const handleUpdateService = () => {
    if (!editingService || !validateServiceForm(serviceForm)) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const updatedServices = data.services.map(service => 
      service.id === editingService.id 
        ? {
            ...service,
            title: serviceForm.title.trim(),
            description: serviceForm.description.trim(),
            color: serviceForm.color,
            colorClass: serviceForm.colorClass
          }
        : service
    );

    const newData: ServicesGridData = {
      services: updatedServices
    };

    handleDataChange(newData);
    setIsEditDialogOpen(false);
    setEditingService(null);
    resetServiceForm();
    toast.success('Service modifié avec succès');
  };

  // Handle remove service
  const handleRemoveService = (serviceId: string) => {
    const updatedServices = data.services
      .filter(service => service.id !== serviceId)
      .map((service, index) => ({
        ...service,
        number: index + 1,
        order: index
      }));

    const newData: ServicesGridData = {
      services: updatedServices
    };

    handleDataChange(newData);
    toast.success('Service supprimé avec succès');
  };

  // Reset service form
  const resetServiceForm = () => {
    setServiceForm({
      title: '',
      description: '',
      color: COLOR_OPTIONS[0].value,
      colorClass: COLOR_OPTIONS[0].colorClass
    });
    setValidationErrors({});
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
    const newServices = [...data.services];
    const draggedService = newServices[dragIndex];
    
    // Remove dragged item
    newServices.splice(dragIndex, 1);
    
    // Insert at new position
    newServices.splice(dropIndex, 0, draggedService);

    // Update numbers and order
    const reorderedServices = newServices.map((service, index) => ({
      ...service,
      number: index + 1,
      order: index
    }));

    const newData: ServicesGridData = {
      services: reorderedServices
    };

    handleDataChange(newData);
    setDraggedItem(null);
    toast.success('Services réorganisés avec succès');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la grille des services...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Grille des Services
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez vos services avec des couleurs personnalisées et un système de réorganisation par glisser-déposer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Services ({data.services.length}/5)
            </Label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  disabled={data.services.length >= 5}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau service</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau service avec une couleur personnalisée
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-title">Titre du service *</Label>
                    <Input
                      id="service-title"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Développement Web, Applications Mobile..."
                      className={validationErrors.title ? 'border-red-500' : ''}
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-red-600">{validationErrors.title}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service-description">Description *</Label>
                    <Textarea
                      id="service-description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez ce service en détail..."
                      rows={3}
                      className={validationErrors.description ? 'border-red-500' : ''}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>

                  <ColorPicker
                    value={serviceForm.color}
                    onChange={(color, colorClass) => 
                      setServiceForm(prev => ({ ...prev, color, colorClass }))
                    }
                    label="Couleur du service"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetServiceForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddService}>
                    Ajouter le service
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List */}
          {data.services.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service</h3>
              <p className="text-gray-500 mb-4">
                Commencez par ajouter votre premier service
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un service
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.services.map((service, index) => (
                <div
                  key={service.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, service, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-4 p-4 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-all duration-200 ${
                    draggedItem?.id === service.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold">
                        {service.number}
                      </span>
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {service.colorClass}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="text-blue-600 hover:text-blue-700"
                      aria-label={`Modifier le service ${service.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Supprimer le service ${service.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.services.length >= 5 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint la limite de 5 services. Supprimez un service existant pour en ajouter un nouveau.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le service</DialogTitle>
              <DialogDescription>
                Modifiez les informations et la couleur du service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-title">Titre du service *</Label>
                <Input
                  id="edit-service-title"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Développement Web, Applications Mobile..."
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service-description">Description *</Label>
                <Textarea
                  id="edit-service-description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez ce service en détail..."
                  rows={3}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>

              <ColorPicker
                value={serviceForm.color}
                onChange={(color, colorClass) => 
                  setServiceForm(prev => ({ ...prev, color, colorClass }))
                }
                label="Couleur du service"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingService(null);
                  resetServiceForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateService}>
                Modifier le service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !onSave}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder et Publier
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!onPreview}
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