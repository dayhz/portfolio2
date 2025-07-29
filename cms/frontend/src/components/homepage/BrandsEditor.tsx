import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Eye, Plus, Trash2, GripVertical, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { BrandsSection, BrandLogo } from '../../../../shared/types/homepage';

interface BrandsEditorProps {
  onPreview?: (data: BrandsSection) => void;
}

interface DragItem {
  id: number;
  index: number;
}

export function BrandsEditor({ onPreview }: BrandsEditorProps) {
  const [formData, setFormData] = useState<BrandsSection>({
    title: '',
    logos: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLogo, setNewLogo] = useState({ name: '', logoUrl: '' });
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const queryClient = useQueryClient();

  // Fetch brands content
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'brands'],
    queryFn: () => homepageAPI.getBrandsContent(),
  });

  // Update brands content mutation
  const updateMutation = useMutation({
    mutationFn: (data: BrandsSection) => homepageAPI.updateBrandsContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'brands'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Brands mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating brands section:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Add logo mutation
  const addLogoMutation = useMutation({
    mutationFn: ({ name, logoUrl }: { name: string; logoUrl: string }) => 
      homepageAPI.addBrandLogo(name, logoUrl),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'brands'], result.brands);
      setFormData(result.brands);
      setIsAddDialogOpen(false);
      setNewLogo({ name: '', logoUrl: '' });
      toast.success('Logo ajouté avec succès');
    },
    onError: (error: Error) => {
      console.error('Error adding logo:', error);
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    },
  });

  // Remove logo mutation
  const removeLogoMutation = useMutation({
    mutationFn: (logoId: number) => homepageAPI.removeBrandLogo(logoId),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'brands'], result.brands);
      setFormData(result.brands);
      toast.success('Logo supprimé avec succès');
    },
    onError: (error: Error) => {
      console.error('Error removing logo:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });

  // Reorder logos mutation
  const reorderMutation = useMutation({
    mutationFn: (logoIds: number[]) => homepageAPI.reorderBrandLogos(logoIds),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'brands'], result.brands);
      setFormData(result.brands);
      toast.success('Logos réorganisés avec succès');
    },
    onError: (error: Error) => {
      console.error('Error reordering logos:', error);
      toast.error(`Erreur lors de la réorganisation: ${error.message}`);
    },
  });

  // Initialize form data when brands data is loaded
  useEffect(() => {
    if (brandsData) {
      setFormData(brandsData);
      setHasUnsavedChanges(false);
    }
  }, [brandsData]);

  // Handle title change
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value
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

  // Handle add logo
  const handleAddLogo = () => {
    if (!newLogo.name.trim() || !newLogo.logoUrl.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Validate URL
    try {
      new URL(newLogo.logoUrl);
    } catch {
      toast.error('Veuillez entrer une URL valide');
      return;
    }

    addLogoMutation.mutate({
      name: newLogo.name.trim(),
      logoUrl: newLogo.logoUrl.trim()
    });
  };

  // Handle remove logo
  const handleRemoveLogo = (logoId: number) => {
    removeLogoMutation.mutate(logoId);
  };

  // Handle logo file upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Le fichier image est trop volumineux (max 5MB)');
      return;
    }

    try {
      const uploadedFile = await homepageAPI.uploadMedia(file);
      setNewLogo(prev => ({ ...prev, logoUrl: uploadedFile.url }));
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, logo: BrandLogo, index: number) => {
    setDraggedItem({ id: logo.id, index });
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
    const newLogos = [...formData.logos];
    const draggedLogo = newLogos[dragIndex];
    
    // Remove dragged item
    newLogos.splice(dragIndex, 1);
    
    // Insert at new position
    newLogos.splice(dropIndex, 0, draggedLogo);

    // Update order and reorder on server
    const logoIds = newLogos.map(logo => logo.id);
    reorderMutation.mutate(logoIds);
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Brands...</span>
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
              Erreur lors du chargement de la section Brands: {error.message}
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
          🏢 Section Brands/Clients
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre et les logos de vos clients dans la section brands
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="brands-title">Titre de la section *</Label>
          <Input
            id="brands-title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Je travaille avec des clients fabuleux"
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Logos Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Logos des clients ({formData.logos.length})</Label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un logo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau logo</DialogTitle>
                  <DialogDescription>
                    Ajoutez un logo de client à votre section brands
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-name">Nom du client *</Label>
                    <Input
                      id="logo-name"
                      value={newLogo.name}
                      onChange={(e) => setNewLogo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Apple, Google, Microsoft..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">URL du logo *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo-url"
                        value={newLogo.logoUrl}
                        onChange={(e) => setNewLogo(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {newLogo.logoUrl && (
                    <div className="space-y-2">
                      <Label>Aperçu</Label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <img
                          src={newLogo.logoUrl}
                          alt="Aperçu du logo"
                          className="max-h-16 max-w-32 object-contain mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewLogo({ name: '', logoUrl: '' });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddLogo}
                    disabled={addLogoMutation.isPending}
                  >
                    {addLogoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Logos List */}
          {formData.logos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun logo ajouté pour le moment</p>
              <p className="text-sm">Cliquez sur "Ajouter un logo" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.logos.map((logo, index) => (
                <div
                  key={logo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, logo, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-4 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-colors ${
                    draggedItem?.id === logo.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  
                  <div className="flex-shrink-0">
                    <img
                      src={logo.logoUrl}
                      alt={logo.name}
                      className="h-12 w-16 object-contain bg-gray-50 rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{logo.name}</p>
                    <p className="text-sm text-gray-500 truncate">{logo.logoUrl}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#{logo.order}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveLogo(logo.id)}
                      disabled={removeLogoMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      {removeLogoMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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