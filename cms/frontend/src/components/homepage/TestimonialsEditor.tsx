import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Eye, Plus, Trash2, GripVertical, AlertCircle, Upload, User, ExternalLink, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { TestimonialsSection, TestimonialItem } from '../../../../shared/types/homepage';

interface TestimonialsEditorProps {
  onPreview?: (data: TestimonialsSection) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface DragItem {
  id: number;
  index: number;
}

interface NewTestimonialForm {
  text: string;
  clientName: string;
  clientTitle: string;
  clientPhoto: string;
  projectLink: string;
  projectImage: string;
}

const initialNewTestimonial: NewTestimonialForm = {
  text: '',
  clientName: '',
  clientTitle: '',
  clientPhoto: '',
  projectLink: '',
  projectImage: ''
};

export function TestimonialsEditor({ onPreview, onUnsavedChanges }: TestimonialsEditorProps) {
  const [formData, setFormData] = useState<TestimonialsSection>({
    testimonials: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<NewTestimonialForm>(initialNewTestimonial);
  const [editTestimonialForm, setEditTestimonialForm] = useState<NewTestimonialForm>(initialNewTestimonial);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch testimonials content
  const { data: testimonialsData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'testimonials'],
    queryFn: () => homepageAPI.getTestimonialsContent(),
  });

  // Update testimonials content mutation
  const updateMutation = useMutation({
    mutationFn: (data: TestimonialsSection) => homepageAPI.updateTestimonialsContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'testimonials'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Témoignages mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating testimonials section:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Add testimonial mutation
  const addTestimonialMutation = useMutation({
    mutationFn: (testimonial: Omit<TestimonialItem, 'id' | 'order'>) => 
      homepageAPI.addTestimonial(testimonial),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'testimonials'], result.testimonials);
      setFormData(result.testimonials);
      setIsAddDialogOpen(false);
      setNewTestimonial(initialNewTestimonial);
      setHasUnsavedChanges(true);
      toast.success('Témoignage ajouté avec succès');
    },
    onError: (error: Error) => {
      console.error('Error adding testimonial:', error);
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    },
  });

  // Remove testimonial mutation
  const removeTestimonialMutation = useMutation({
    mutationFn: (testimonialId: number) => homepageAPI.removeTestimonial(testimonialId),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'testimonials'], result.testimonials);
      setFormData(result.testimonials);
      setHasUnsavedChanges(true);
      toast.success('Témoignage supprimé avec succès');
    },
    onError: (error: Error) => {
      console.error('Error removing testimonial:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });

  // Reorder testimonials mutation
  const reorderMutation = useMutation({
    mutationFn: (testimonialIds: number[]) => homepageAPI.reorderTestimonials(testimonialIds),
    onSuccess: (result) => {
      queryClient.setQueryData(['homepage', 'testimonials'], result.testimonials);
      setFormData(result.testimonials);
      setHasUnsavedChanges(true);
      toast.success('Témoignages réorganisés avec succès');
    },
    onError: (error: Error) => {
      console.error('Error reordering testimonials:', error);
      toast.error(`Erreur lors de la réorganisation: ${error.message}`);
    },
  });

  // Initialize form data when testimonials data is loaded
  useEffect(() => {
    if (testimonialsData) {
      setFormData(testimonialsData);
      setHasUnsavedChanges(false);
    }
  }, [testimonialsData]);

  // Notify parent component about unsaved changes
  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChanges]);

  // Update testimonial mutation
  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<TestimonialItem, 'id' | 'order'> }) => {
      // Since there's no direct update API, we'll simulate it by removing and adding
      // In a real implementation, you'd want a proper update endpoint
      return Promise.resolve({ testimonial: { ...data, id, order: editingTestimonial?.order || 1 }, testimonials: formData });
    },
    onSuccess: (result) => {
      // Update the testimonial in the current data
      const updatedTestimonials = formData.testimonials.map(t => 
        t.id === result.testimonial.id ? result.testimonial : t
      );
      const updatedData = { testimonials: updatedTestimonials };
      setFormData(updatedData);
      queryClient.setQueryData(['homepage', 'testimonials'], updatedData);
      setIsEditDialogOpen(false);
      setEditingTestimonial(null);
      setEditTestimonialForm(initialNewTestimonial);
      setHasUnsavedChanges(true);
      toast.success('Témoignage modifié avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating testimonial:', error);
      toast.error(`Erreur lors de la modification: ${error.message}`);
    },
  });

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

  // Validate testimonial form
  const validateTestimonialForm = (testimonial: NewTestimonialForm): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!testimonial.text.trim()) {
      errors.text = 'Le texte du témoignage est requis';
    } else if (testimonial.text.trim().length < 10) {
      errors.text = 'Le témoignage doit contenir au moins 10 caractères';
    }

    if (!testimonial.clientName.trim()) {
      errors.clientName = 'Le nom du client est requis';
    }

    if (!testimonial.clientTitle.trim()) {
      errors.clientTitle = 'Le titre/poste du client est requis';
    }

    if (testimonial.projectLink && testimonial.projectLink.trim()) {
      try {
        new URL(testimonial.projectLink);
      } catch {
        errors.projectLink = 'Veuillez entrer une URL valide pour le lien projet';
      }
    }

    return errors;
  };

  // Handle add testimonial
  const handleAddTestimonial = () => {
    const errors = validateTestimonialForm(newTestimonial);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    addTestimonialMutation.mutate({
      text: newTestimonial.text.trim(),
      clientName: newTestimonial.clientName.trim(),
      clientTitle: newTestimonial.clientTitle.trim(),
      clientPhoto: newTestimonial.clientPhoto.trim(),
      projectLink: newTestimonial.projectLink.trim(),
      projectImage: newTestimonial.projectImage.trim()
    });
  };

  // Handle edit testimonial
  const handleEditTestimonial = (testimonial: TestimonialItem) => {
    setEditingTestimonial(testimonial);
    setEditTestimonialForm({
      text: testimonial.text,
      clientName: testimonial.clientName,
      clientTitle: testimonial.clientTitle,
      clientPhoto: testimonial.clientPhoto,
      projectLink: testimonial.projectLink,
      projectImage: testimonial.projectImage
    });
    setValidationErrors({});
    setIsEditDialogOpen(true);
  };

  // Handle update testimonial
  const handleUpdateTestimonial = () => {
    if (!editingTestimonial) return;
    
    const errors = validateTestimonialForm(editTestimonialForm);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    updateTestimonialMutation.mutate({
      id: editingTestimonial.id,
      data: {
        text: editTestimonialForm.text.trim(),
        clientName: editTestimonialForm.clientName.trim(),
        clientTitle: editTestimonialForm.clientTitle.trim(),
        clientPhoto: editTestimonialForm.clientPhoto.trim(),
        projectLink: editTestimonialForm.projectLink.trim(),
        projectImage: editTestimonialForm.projectImage.trim()
      }
    });
  };

  // Handle remove testimonial with confirmation
  const handleRemoveTestimonial = (testimonialId: number) => {
    setDeleteConfirmId(testimonialId);
  };

  const confirmRemoveTestimonial = () => {
    if (deleteConfirmId) {
      removeTestimonialMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelRemoveTestimonial = () => {
    setDeleteConfirmId(null);
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'clientPhoto' | 'projectImage',
    isEdit: boolean = false
  ) => {
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
      if (field === 'clientPhoto') {
        setIsUploadingPhoto(true);
      } else {
        setIsUploadingProjectImage(true);
      }

      const uploadedFile = await homepageAPI.uploadMedia(file);
      if (isEdit) {
        setEditTestimonialForm(prev => ({ ...prev, [field]: uploadedFile.url }));
      } else {
        setNewTestimonial(prev => ({ ...prev, [field]: uploadedFile.url }));
      }
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      if (field === 'clientPhoto') {
        setIsUploadingPhoto(false);
      } else {
        setIsUploadingProjectImage(false);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, testimonial: TestimonialItem, index: number) => {
    setDraggedItem({ id: testimonial.id, index });
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
    const newTestimonials = [...formData.testimonials];
    const draggedTestimonial = newTestimonials[dragIndex];
    
    // Remove dragged item
    newTestimonials.splice(dragIndex, 1);
    
    // Insert at new position
    newTestimonials.splice(dropIndex, 0, draggedTestimonial);

    // Update order and reorder on server
    const testimonialIds = newTestimonials.map(testimonial => testimonial.id);
    reorderMutation.mutate(testimonialIds);
    
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
          <span className="ml-2">Chargement de la section Témoignages...</span>
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
              Erreur lors du chargement de la section Témoignages: {error.message}
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
          💬 Section Témoignages
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez les témoignages de vos clients avec leurs informations et photos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Testimonials Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Témoignages ({formData.testimonials.length})</Label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un témoignage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau témoignage</DialogTitle>
                  <DialogDescription>
                    Ajoutez un témoignage client avec toutes les informations nécessaires
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Testimonial Text */}
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-text">Texte du témoignage *</Label>
                    <Textarea
                      id="testimonial-text"
                      value={newTestimonial.text}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Ex: J'ai eu le privilège de travailler avec [nom] sur..."
                      rows={4}
                      className={validationErrors.text ? 'border-red-500' : ''}
                    />
                    {validationErrors.text && (
                      <p className="text-sm text-red-600">{validationErrors.text}</p>
                    )}
                  </div>

                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nom du client *</Label>
                      <Input
                        id="client-name"
                        value={newTestimonial.clientName}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Ex: Jasen Dowell"
                        className={validationErrors.clientName ? 'border-red-500' : ''}
                      />
                      {validationErrors.clientName && (
                        <p className="text-sm text-red-600">{validationErrors.clientName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-title">Titre/Poste du client *</Label>
                      <Input
                        id="client-title"
                        value={newTestimonial.clientTitle}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, clientTitle: e.target.value }))}
                        placeholder="Ex: CEO, Savills Stacker"
                        className={validationErrors.clientTitle ? 'border-red-500' : ''}
                      />
                      {validationErrors.clientTitle && (
                        <p className="text-sm text-red-600">{validationErrors.clientTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Client Photo */}
                  <div className="space-y-2">
                    <Label htmlFor="client-photo">Photo du client</Label>
                    <div className="flex gap-2">
                      <Input
                        id="client-photo"
                        value={newTestimonial.clientPhoto}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, clientPhoto: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'clientPhoto')}
                        className="hidden"
                        id="client-photo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('client-photo-upload')?.click()}
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {newTestimonial.clientPhoto && (
                      <div className="space-y-2">
                        <Label>Aperçu photo client</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={newTestimonial.clientPhoto}
                            alt="Aperçu photo client"
                            className="h-16 w-16 object-cover rounded-full mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Information */}
                  <div className="space-y-2">
                    <Label htmlFor="project-link">Lien vers le projet</Label>
                    <Input
                      id="project-link"
                      value={newTestimonial.projectLink}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, projectLink: e.target.value }))}
                      placeholder="https://apps.apple.com/..."
                      className={validationErrors.projectLink ? 'border-red-500' : ''}
                    />
                    {validationErrors.projectLink && (
                      <p className="text-sm text-red-600">{validationErrors.projectLink}</p>
                    )}
                  </div>

                  {/* Project Image */}
                  <div className="space-y-2">
                    <Label htmlFor="project-image">Image du projet</Label>
                    <div className="flex gap-2">
                      <Input
                        id="project-image"
                        value={newTestimonial.projectImage}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, projectImage: e.target.value }))}
                        placeholder="https://example.com/project-image.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'projectImage')}
                        className="hidden"
                        id="project-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('project-image-upload')?.click()}
                        disabled={isUploadingProjectImage}
                      >
                        {isUploadingProjectImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {newTestimonial.projectImage && (
                      <div className="space-y-2">
                        <Label>Aperçu image projet</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={newTestimonial.projectImage}
                            alt="Aperçu image projet"
                            className="max-h-24 max-w-32 object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewTestimonial(initialNewTestimonial);
                      setValidationErrors({});
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddTestimonial}
                    disabled={addTestimonialMutation.isPending}
                  >
                    {addTestimonialMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Testimonial Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifier le témoignage</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations du témoignage
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Testimonial Text */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-testimonial-text">Texte du témoignage *</Label>
                    <Textarea
                      id="edit-testimonial-text"
                      value={editTestimonialForm.text}
                      onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Ex: J'ai eu le privilège de travailler avec [nom] sur..."
                      rows={4}
                      className={validationErrors.text ? 'border-red-500' : ''}
                    />
                    {validationErrors.text && (
                      <p className="text-sm text-red-600">{validationErrors.text}</p>
                    )}
                  </div>

                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-client-name">Nom du client *</Label>
                      <Input
                        id="edit-client-name"
                        value={editTestimonialForm.clientName}
                        onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Ex: Jasen Dowell"
                        className={validationErrors.clientName ? 'border-red-500' : ''}
                      />
                      {validationErrors.clientName && (
                        <p className="text-sm text-red-600">{validationErrors.clientName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-client-title">Titre/Poste du client *</Label>
                      <Input
                        id="edit-client-title"
                        value={editTestimonialForm.clientTitle}
                        onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, clientTitle: e.target.value }))}
                        placeholder="Ex: CEO, Savills Stacker"
                        className={validationErrors.clientTitle ? 'border-red-500' : ''}
                      />
                      {validationErrors.clientTitle && (
                        <p className="text-sm text-red-600">{validationErrors.clientTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Client Photo */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-client-photo">Photo du client</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-client-photo"
                        value={editTestimonialForm.clientPhoto}
                        onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, clientPhoto: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'clientPhoto', true)}
                        className="hidden"
                        id="edit-client-photo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('edit-client-photo-upload')?.click()}
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {editTestimonialForm.clientPhoto && (
                      <div className="space-y-2">
                        <Label>Aperçu photo client</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={editTestimonialForm.clientPhoto}
                            alt="Aperçu photo client"
                            className="h-16 w-16 object-cover rounded-full mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Information */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-project-link">Lien vers le projet</Label>
                    <Input
                      id="edit-project-link"
                      value={editTestimonialForm.projectLink}
                      onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, projectLink: e.target.value }))}
                      placeholder="https://apps.apple.com/..."
                      className={validationErrors.projectLink ? 'border-red-500' : ''}
                    />
                    {validationErrors.projectLink && (
                      <p className="text-sm text-red-600">{validationErrors.projectLink}</p>
                    )}
                  </div>

                  {/* Project Image */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-project-image">Image du projet</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-project-image"
                        value={editTestimonialForm.projectImage}
                        onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, projectImage: e.target.value }))}
                        placeholder="https://example.com/project-image.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'projectImage', true)}
                        className="hidden"
                        id="edit-project-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('edit-project-image-upload')?.click()}
                        disabled={isUploadingProjectImage}
                      >
                        {isUploadingProjectImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {editTestimonialForm.projectImage && (
                      <div className="space-y-2">
                        <Label>Aperçu image projet</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={editTestimonialForm.projectImage}
                            alt="Aperçu image projet"
                            className="max-h-24 max-w-32 object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingTestimonial(null);
                      setEditTestimonialForm(initialNewTestimonial);
                      setValidationErrors({});
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpdateTestimonial}
                    disabled={updateTestimonialMutation.isPending}
                  >
                    {updateTestimonialMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Modifier
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce témoignage ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={cancelRemoveTestimonial}>
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmRemoveTestimonial}
                    disabled={removeTestimonialMutation.isPending}
                  >
                    {removeTestimonialMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Supprimer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Testimonials List */}
          {formData.testimonials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun témoignage ajouté pour le moment</p>
              <p className="text-sm">Cliquez sur "Ajouter un témoignage" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, testimonial, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex gap-4 p-4 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-colors ${
                    draggedItem?.id === testimonial.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  
                  {/* Client Photo */}
                  <div className="flex-shrink-0">
                    {testimonial.clientPhoto ? (
                      <img
                        src={testimonial.clientPhoto}
                        alt={testimonial.clientName}
                        className="h-12 w-12 object-cover rounded-full bg-gray-50 border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{testimonial.clientName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{testimonial.clientTitle}</span>
                        </div>
                        {testimonial.projectLink && (
                          <a
                            href={testimonial.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Voir le projet
                          </a>
                        )}
                      </div>
                      
                      {/* Project Image */}
                      {testimonial.projectImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={testimonial.projectImage}
                            alt="Projet"
                            className="h-16 w-20 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-gray-400">#{testimonial.order}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTestimonial(testimonial)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTestimonial(testimonial.id)}
                      disabled={removeTestimonialMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      {removeTestimonialMutation.isPending && deleteConfirmId === testimonial.id ? (
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