import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Save, 
  Eye, 
  AlertCircle, 
  Users, 
  Plus, 
  Trash2, 
  GripVertical,
  Upload,
  X,
  Edit,
  Building,
  Filter,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ClientsData, ClientItem, ValidationError } from '../../../../shared/types/services';
import { MediaSelector } from '@/components/media/MediaSelector';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClientsEditorProps {
  data: ClientsData;
  onChange: (data: ClientsData) => void;
  onSave?: (data: ClientsData) => Promise<void>;
  onPreview?: (data: ClientsData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
  isSaving?: boolean;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface ClientFormData {
  name: string;
  logo: string;
  description: string;
  industry: string;
  isActive: boolean;
}

interface SortableClientItemProps {
  client: ClientItem;
  index: number;
  onEdit: (client: ClientItem) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  errors: Record<string, string>;
  isRemoving?: boolean;
}

// Industry options for categorization
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technologie' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'retail', label: 'Commerce' },
  { value: 'manufacturing', label: 'Industrie' },
  { value: 'consulting', label: 'Conseil' },
  { value: 'media', label: 'Médias' },
  { value: 'nonprofit', label: 'Associatif' },
  { value: 'government', label: 'Public' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Autre' }
];

function SortableClientItem({ 
  client, 
  index, 
  onEdit, 
  onRemove, 
  onToggleActive,
  errors,
  isRemoving = false
}: SortableClientItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemove = () => {
    setShowRemoveDialog(false);
    onRemove(client.id);
  };

  const getIndustryLabel = (industry: string) => {
    return INDUSTRY_OPTIONS.find(option => option.value === industry)?.label || industry;
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={`transition-all duration-200 ${isDragging ? 'shadow-lg' : ''} ${isRemoving ? 'opacity-50' : ''} ${!client.isActive ? 'opacity-75 border-gray-300' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                role="button"
                aria-label="Glisser pour réorganiser"
                tabIndex={0}
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {client.name}
                  {client.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={client.isActive}
                onCheckedChange={(checked) => onToggleActive(client.id, checked)}
                aria-label={`${client.isActive ? 'Désactiver' : 'Activer'} ${client.name}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(client)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                aria-label="Modifier le client"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isRemoving}
                aria-label="Supprimer le client"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {client.logo ? (
                  <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center p-2">
                    <img
                      src={client.logo}
                      alt={`Logo ${client.name}`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{client.name}</h4>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {getIndustryLabel(client.industry)}
                  </Badge>
                </div>
                
                {client.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {client.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    Statut: {client.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client "{client.name}" ? 
              Cette action est irréversible et l'ordre des clients suivants sera automatiquement mis à jour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ClientsEditor({
  data,
  onChange,
  onSave,
  onPreview,
  errors = [],
  isLoading = false,
  isSaving = false,
  onUnsavedChanges
}: ClientsEditorProps) {
  const [formData, setFormData] = useState<ClientsData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [removingClientId, setRemovingClientId] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  
  // Form states
  const [newClientForm, setNewClientForm] = useState<ClientFormData>({
    name: '',
    logo: '',
    description: '',
    industry: '',
    isActive: true
  });
  const [editClientForm, setEditClientForm] = useState<ClientFormData>({
    name: '',
    logo: '',
    description: '',
    industry: '',
    isActive: true
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Media selector states
  const [isLogoSelectorOpen, setIsLogoSelectorOpen] = useState(false);
  const [currentEditMode, setCurrentEditMode] = useState<'add' | 'edit'>('add');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize form data when prop data changes
  useEffect(() => {
    setFormData(data);
    setHasUnsavedChanges(false);
  }, [data]);

  // Process validation errors
  useEffect(() => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      if (error.section === 'clients') {
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

  // Generate unique ID for new clients
  const generateClientId = () => {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Update client order
  const updateClientOrder = (clients: ClientItem[]): ClientItem[] => {
    return clients.map((client, index) => ({
      ...client,
      order: index + 1
    }));
  };

  // Filter clients based on search and filters
  const filteredClients = formData.clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || client.industry === filterIndustry;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && client.isActive) ||
                         (filterStatus === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  // Group clients by industry
  const clientsByIndustry = formData.clients.reduce((acc, client) => {
    if (!acc[client.industry]) {
      acc[client.industry] = [];
    }
    acc[client.industry].push(client);
    return acc;
  }, {} as Record<string, ClientItem[]>);

  // Validate client form
  const validateClientForm = (formData: ClientFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du client est requis';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    } else if (formData.description.trim().length > 300) {
      errors.description = 'La description ne peut pas dépasser 300 caractères';
    }

    if (!formData.industry) {
      errors.industry = 'Le secteur d\'activité est requis';
    }

    return errors;
  };

  // Handle media selection from MediaSelector
  const handleMediaSelect = (media: any) => {
    const logoUrl = media.url;
    
    if (currentEditMode === 'edit') {
      setEditClientForm(prev => ({
        ...prev,
        logo: logoUrl
      }));
    } else {
      setNewClientForm(prev => ({
        ...prev,
        logo: logoUrl
      }));
    }
    
    toast.success('Logo sélectionné avec succès');
  };

  // Open media selector for logo
  const openLogoSelector = (isEdit: boolean = false) => {
    setCurrentEditMode(isEdit ? 'edit' : 'add');
    setIsLogoSelectorOpen(true);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.clients.findIndex(client => client.id === active.id);
      const newIndex = formData.clients.findIndex(client => client.id === over.id);

      const reorderedClients = arrayMove(formData.clients, oldIndex, newIndex);
      const orderedClients = updateClientOrder(reorderedClients);
      
      const newData = {
        ...formData,
        clients: orderedClients
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      
      toast.success('Ordre des clients mis à jour');
    }
  };

  // Toggle client active status
  const handleToggleActive = (clientId: string, isActive: boolean) => {
    const updatedClients = formData.clients.map(client =>
      client.id === clientId ? { ...client, isActive } : client
    );

    const newData = {
      ...formData,
      clients: updatedClients
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    toast.success(`Client ${isActive ? 'activé' : 'désactivé'} avec succès`);
  };

  // Add new client
  const handleAddClient = () => {
    const errors = validateClientForm(newClientForm);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const newClient: ClientItem = {
      id: generateClientId(),
      name: newClientForm.name.trim(),
      logo: newClientForm.logo.trim(),
      description: newClientForm.description.trim(),
      industry: newClientForm.industry,
      isActive: newClientForm.isActive,
      order: formData.clients.length + 1
    };

    const newData = {
      ...formData,
      clients: [...formData.clients, newClient]
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    // Reset form and close dialog
    setNewClientForm({
      name: '',
      logo: '',
      description: '',
      industry: '',
      isActive: true
    });
    setValidationErrors({});
    setIsAddDialogOpen(false);
    
    toast.success('Client ajouté avec succès');
  };

  // Edit client
  const handleEditClient = (client: ClientItem) => {
    setEditingClient(client);
    setEditClientForm({
      name: client.name,
      logo: client.logo,
      description: client.description,
      industry: client.industry,
      isActive: client.isActive
    });
    setValidationErrors({});
    setIsEditDialogOpen(true);
  };

  // Update client
  const handleUpdateClient = () => {
    if (!editingClient) return;
    
    const errors = validateClientForm(editClientForm);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedClients = formData.clients.map(client =>
      client.id === editingClient.id
        ? {
            ...client,
            name: editClientForm.name.trim(),
            logo: editClientForm.logo.trim(),
            description: editClientForm.description.trim(),
            industry: editClientForm.industry,
            isActive: editClientForm.isActive
          }
        : client
    );

    const newData = {
      ...formData,
      clients: updatedClients
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    // Reset form and close dialog
    setEditingClient(null);
    setEditClientForm({
      name: '',
      logo: '',
      description: '',
      industry: '',
      isActive: true
    });
    setValidationErrors({});
    setIsEditDialogOpen(false);
    
    toast.success('Client modifié avec succès');
  };

  // Remove client
  const handleRemoveClient = (clientId: string) => {
    setRemovingClientId(clientId);
    
    setTimeout(() => {
      const filteredClients = formData.clients.filter(client => client.id !== clientId);
      const reorderedClients = updateClientOrder(filteredClients);
      
      const newData = {
        ...formData,
        clients: reorderedClients
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      setRemovingClientId(null);
      
      toast.success('Client supprimé avec succès');
    }, 150);
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      toast.success('Section Clients sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving clients section:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
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
          <span className="ml-2">Chargement de la section Clients...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Section Clients
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez vos clients avec catégorisation par secteur et glisser-déposer pour réorganiser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {INDUSTRY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clients Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Clients ({formData.clients.length})
              {filteredClients.length !== formData.clients.length && (
                <span className="text-sm text-gray-500 font-normal">
                  - {filteredClients.length} affichés
                </span>
              )}
            </Label>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={formData.clients.length >= 50}
            >
              <Plus className="h-4 w-4" />
              Ajouter un client
            </Button>
          </div>

          {formData.clients.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun client défini
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter votre premier client
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter le premier client
              </Button>
            </Card>
          ) : filteredClients.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun client trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Aucun client ne correspond aux critères de recherche
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterIndustry('all');
                  setFilterStatus('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredClients.map(client => client.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {filteredClients.map((client, index) => (
                    <SortableClientItem
                      key={client.id}
                      client={client}
                      index={index}
                      onEdit={handleEditClient}
                      onRemove={handleRemoveClient}
                      onToggleActive={handleToggleActive}
                      errors={validationErrors}
                      isRemoving={removingClientId === client.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {formData.clients.length >= 50 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint le nombre maximum de clients (50). Supprimez un client existant pour en ajouter un nouveau.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Industry Grouping Preview */}
        {formData.clients.length > 0 && (
          <div className="space-y-2">
            <Label>Aperçu par secteur d'activité</Label>
            <Card className="p-6 bg-gray-50">
              <div className="space-y-4">
                {Object.entries(clientsByIndustry).map(([industry, clients]) => (
                  <div key={industry} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {INDUSTRY_OPTIONS.find(option => option.value === industry)?.label || industry}
                      </h4>
                      <Badge variant="secondary">{clients.length}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {clients.slice(0, 6).map((client) => (
                        <div key={client.id} className="bg-white p-3 rounded-lg border text-center">
                          {client.logo ? (
                            <img
                              src={client.logo}
                              alt={client.name}
                              className="w-8 h-8 mx-auto mb-2 object-contain"
                            />
                          ) : (
                            <Building className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          )}
                          <p className="text-xs font-medium truncate">{client.name}</p>
                          {!client.isActive && (
                            <p className="text-xs text-gray-500">Inactif</p>
                          )}
                        </div>
                      ))}
                      {clients.length > 6 && (
                        <div className="bg-white p-3 rounded-lg border text-center flex items-center justify-center">
                          <p className="text-xs text-gray-500">
                            +{clients.length - 6} autres
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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

        {/* Add Client Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Ajoutez un client avec son logo, sa description et son secteur d'activité
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client-name">
                  Nom du client *
                  <span className="text-xs text-gray-500 ml-1">
                    ({newClientForm.name.length}/100)
                  </span>
                </Label>
                <Input
                  id="client-name"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Apple Inc."
                  className={validationErrors.name ? 'border-red-500' : ''}
                  maxLength={100}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo du client</Label>
                <div className="flex items-center gap-4">
                  {newClientForm.logo ? (
                    <div className="relative">
                      <div className="w-20 h-20 bg-white rounded-lg border flex items-center justify-center p-2">
                        <img
                          src={newClientForm.logo}
                          alt="Logo du client"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewClientForm(prev => ({ ...prev, logo: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLogoSelector(false)}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {newClientForm.logo ? 'Changer' : 'Ajouter'} le logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      SVG, PNG, JPG, WebP (max 2MB)
                      <br />
                      SVG recommandé pour la meilleure qualité
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="client-description">
                  Description *
                  <span className="text-xs text-gray-500 ml-1">
                    ({newClientForm.description.length}/300)
                  </span>
                </Label>
                <Textarea
                  id="client-description"
                  value={newClientForm.description}
                  onChange={(e) => setNewClientForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Leader mondial de la technologie, spécialisé dans les produits électroniques grand public..."
                  rows={3}
                  className={validationErrors.description ? 'border-red-500' : ''}
                  maxLength={300}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="client-industry">Secteur d'activité *</Label>
                <Select 
                  value={newClientForm.industry} 
                  onValueChange={(value) => setNewClientForm(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger className={validationErrors.industry ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.industry && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.industry}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="client-active"
                  checked={newClientForm.isActive}
                  onCheckedChange={(checked) => setNewClientForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="client-active">Client actif</Label>
                <p className="text-xs text-gray-500">
                  Les clients inactifs ne seront pas affichés sur le site public
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddClient}>
                Ajouter le client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-client-name">
                  Nom du client *
                  <span className="text-xs text-gray-500 ml-1">
                    ({editClientForm.name.length}/100)
                  </span>
                </Label>
                <Input
                  id="edit-client-name"
                  value={editClientForm.name}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Apple Inc."
                  className={validationErrors.name ? 'border-red-500' : ''}
                  maxLength={100}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo du client</Label>
                <div className="flex items-center gap-4">
                  {editClientForm.logo ? (
                    <div className="relative">
                      <div className="w-20 h-20 bg-white rounded-lg border flex items-center justify-center p-2">
                        <img
                          src={editClientForm.logo}
                          alt="Logo du client"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditClientForm(prev => ({ ...prev, logo: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLogoSelector(true)}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {editClientForm.logo ? 'Changer' : 'Ajouter'} le logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      SVG, PNG, JPG, WebP (max 2MB)
                      <br />
                      SVG recommandé pour la meilleure qualité
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-client-description">
                  Description *
                  <span className="text-xs text-gray-500 ml-1">
                    ({editClientForm.description.length}/300)
                  </span>
                </Label>
                <Textarea
                  id="edit-client-description"
                  value={editClientForm.description}
                  onChange={(e) => setEditClientForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Leader mondial de la technologie, spécialisé dans les produits électroniques grand public..."
                  rows={3}
                  className={validationErrors.description ? 'border-red-500' : ''}
                  maxLength={300}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="edit-client-industry">Secteur d'activité *</Label>
                <Select 
                  value={editClientForm.industry} 
                  onValueChange={(value) => setEditClientForm(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger className={validationErrors.industry ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.industry && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.industry}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-client-active"
                  checked={editClientForm.isActive}
                  onCheckedChange={(checked) => setEditClientForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-client-active">Client actif</Label>
                <p className="text-xs text-gray-500">
                  Les clients inactifs ne seront pas affichés sur le site public
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateClient}>
                Sauvegarder les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    {/* Media Selector */}
    <MediaSelector
      isOpen={isLogoSelectorOpen}
      onClose={() => setIsLogoSelectorOpen(false)}
      onSelect={handleMediaSelect}
      allowedTypes={['logo']}
      title="Sélectionner un logo"
      description="Choisissez un logo pour le client (SVG recommandé)"
    />
  </>
  );
}