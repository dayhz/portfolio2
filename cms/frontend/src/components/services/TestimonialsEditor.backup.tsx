import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Loader2, 
  Save, 
  Eye, 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  Trash2, 
  GripVertical,
  Upload,
  X,
  Edit,
  User,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/TiptapEditor';
import { MediaSelector } from '@/components/media/MediaSelector';
import { TestimonialsData, Testimonial, TestimonialAuthor, TestimonialProject, ValidationError } from '../../../../shared/types/services';
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

interface TestimonialsEditorProps {
  data: TestimonialsData;
  onChange: (data: TestimonialsData) => void;
  onSave?: (data: TestimonialsData) => Promise<void>;
  onPreview?: (data: TestimonialsData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
  isSaving?: boolean;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface TestimonialFormData {
  text: string;
  author: TestimonialAuthor;
  project: TestimonialProject;
}

interface SortableTestimonialItemProps {
  testimonial: Testimonial;
  index: number;
  onEdit: (testimonial: Testimonial) => void;
  onRemove: (id: string) => void;
  errors: Record<string, string>;
  isRemoving?: boolean;
}

function SortableTestimonialItem({ 
  testimonial, 
  index, 
  onEdit, 
  onRemove, 
  errors,
  isRemoving = false
}: SortableTestimonialItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemove = () => {
    setShowRemoveDialog(false);
    onRemove(testimonial.id);
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={`transition-all duration-200 ${isDragging ? 'shadow-lg' : ''} ${isRemoving ? 'opacity-50' : ''}`}
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
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <CardTitle className="text-lg">Témoignage {index + 1}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(testimonial)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                aria-label="Modifier le témoignage"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isRemoving}
                aria-label="Supprimer le témoignage"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Testimonial Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <blockquote className="text-gray-700 italic mb-4">
              "{testimonial.text}"
            </blockquote>
            
            <div className="flex items-center gap-4">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                {testimonial.author.avatar && (
                  <img
                    src={testimonial.author.avatar}
                    alt={testimonial.author.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.author.title}</p>
                  {testimonial.author.company && (
                    <p className="text-sm text-gray-500">{testimonial.author.company}</p>
                  )}
                </div>
              </div>

              {/* Project Info */}
              {testimonial.project.name && (
                <div className="flex items-center gap-3 ml-auto">
                  {testimonial.project.image && (
                    <img
                      src={testimonial.project.image}
                      alt={testimonial.project.name}
                      className="w-12 h-12 rounded object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{testimonial.project.name}</p>
                    {testimonial.project.url && (
                      <a
                        href={testimonial.project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Voir le projet <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le témoignage</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce témoignage de {testimonial.author.name} ? 
              Cette action est irréversible et l'ordre des témoignages suivants sera automatiquement mis à jour.
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

export function TestimonialsEditor({
  data,
  onChange,
  onSave,
  onPreview,
  errors = [],
  isLoading = false,
  isSaving = false,
  onUnsavedChanges
}: TestimonialsEditorProps) {
  const [formData, setFormData] = useState<TestimonialsData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [removingTestimonialId, setRemovingTestimonialId] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  // Form states
  const [newTestimonialForm, setNewTestimonialForm] = useState<TestimonialFormData>({
    text: '',
    author: { name: '', title: '', company: '', avatar: '' },
    project: { name: '', image: '', url: '' }
  });
  const [editTestimonialForm, setEditTestimonialForm] = useState<TestimonialFormData>({
    text: '',
    author: { name: '', title: '', company: '', avatar: '' },
    project: { name: '', image: '', url: '' }
  });
  
  // Media selector states
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isProjectImageSelectorOpen, setIsProjectImageSelectorOpen] = useState(false);
  const [currentEditField, setCurrentEditField] = useState<'avatar' | 'projectImage' | null>(null);
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
      if (error.section === 'testimonials') {
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

  // Generate unique ID for new testimonials
  const generateTestimonialId = () => {
    return `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Update testimonial order
  const updateTestimonialOrder = (testimonials: Testimonial[]): Testimonial[] => {
    return testimonials.map((testimonial, index) => ({
      ...testimonial,
      order: index + 1
    }));
  };

  // Validate testimonial form
  const validateTestimonialForm = (formData: TestimonialFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.text.trim()) {
      errors.text = 'Le texte du témoignage est requis';
    } else if (formData.text.trim().length < 10) {
      errors.text = 'Le témoignage doit contenir au moins 10 caractères';
    } else if (formData.text.trim().length > 1000) {
      errors.text = 'Le témoignage ne peut pas dépasser 1000 caractères';
    }

    if (!formData.author.name.trim()) {
      errors.authorName = 'Le nom de l\'auteur est requis';
    } else if (formData.author.name.trim().length > 100) {
      errors.authorName = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (!formData.author.title.trim()) {
      errors.authorTitle = 'Le titre de l\'auteur est requis';
    } else if (formData.author.title.trim().length > 150) {
      errors.authorTitle = 'Le titre ne peut pas dépasser 150 caractères';
    }

    if (formData.author.company && formData.author.company.trim().length > 100) {
      errors.authorCompany = 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères';
    }

    if (formData.project.url && formData.project.url.trim()) {
      try {
        new URL(formData.project.url);
      } catch {
        errors.projectUrl = 'Veuillez entrer une URL valide pour le projet';
      }
    }

    if (formData.project.name && formData.project.name.trim().length > 100) {
      errors.projectName = 'Le nom du projet ne peut pas dépasser 100 caractères';
    }

    return errors;
  };

  // Handle media selection from MediaSelector
  const handleMediaSelect = (media: any, field: 'avatar' | 'projectImage') => {
    const imageUrl = media.url;
    
    if (currentEditMode === 'edit') {
      if (field === 'avatar') {
        setEditTestimonialForm(prev => ({
          ...prev,
          author: { ...prev.author, avatar: imageUrl }
        }));
      } else {
        setEditTestimonialForm(prev => ({
          ...prev,
          project: { ...prev.project, image: imageUrl }
        }));
      }
    } else {
      if (field === 'avatar') {
        setNewTestimonialForm(prev => ({
          ...prev,
          author: { ...prev.author, avatar: imageUrl }
        }));
      } else {
        setNewTestimonialForm(prev => ({
          ...prev,
          project: { ...prev.project, image: imageUrl }
        }));
      }
    }
    
    toast.success('Image sélectionnée avec succès');
  };

  // Open media selector for avatar
  const openAvatarSelector = (isEdit: boolean = false) => {
    setCurrentEditField('avatar');
    setCurrentEditMode(isEdit ? 'edit' : 'add');
    setIsAvatarSelectorOpen(true);
  };

  // Open media selector for project image
  const openProjectImageSelector = (isEdit: boolean = false) => {
    setCurrentEditField('projectImage');
    setCurrentEditMode(isEdit ? 'edit' : 'add');
    setIsProjectImageSelectorOpen(true);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.testimonials.findIndex(testimonial => testimonial.id === active.id);
      const newIndex = formData.testimonials.findIndex(testimonial => testimonial.id === over.id);

      const reorderedTestimonials = arrayMove(formData.testimonials, oldIndex, newIndex);
      const orderedTestimonials = updateTestimonialOrder(reorderedTestimonials);
      
      const newData = {
        ...formData,
        testimonials: orderedTestimonials
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      
      toast.success('Ordre des témoignages mis à jour');
    }
  };

  // Add new testimonial
  const handleAddTestimonial = () => {
    const errors = validateTestimonialForm(newTestimonialForm);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const newTestimonial: Testimonial = {
      id: generateTestimonialId(),
      text: newTestimonialForm.text.trim(),
      author: {
        name: newTestimonialForm.author.name.trim(),
        title: newTestimonialForm.author.title.trim(),
        company: newTestimonialForm.author.company.trim(),
        avatar: newTestimonialForm.author.avatar.trim()
      },
      project: {
        name: newTestimonialForm.project.name.trim(),
        image: newTestimonialForm.project.image.trim(),
        url: newTestimonialForm.project.url.trim()
      },
      order: formData.testimonials.length + 1
    };

    const newData = {
      ...formData,
      testimonials: [...formData.testimonials, newTestimonial]
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    // Reset form and close dialog
    setNewTestimonialForm({
      text: '',
      author: { name: '', title: '', company: '', avatar: '' },
      project: { name: '', image: '', url: '' }
    });
    setValidationErrors({});
    setIsAddDialogOpen(false);
    
    toast.success('Témoignage ajouté avec succès');
  };

  // Edit testimonial
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setEditTestimonialForm({
      text: testimonial.text,
      author: { ...testimonial.author },
      project: { ...testimonial.project }
    });
    setValidationErrors({});
    setIsEditDialogOpen(true);
  };

  // Update testimonial
  const handleUpdateTestimonial = () => {
    if (!editingTestimonial) return;
    
    const errors = validateTestimonialForm(editTestimonialForm);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const updatedTestimonials = formData.testimonials.map(testimonial =>
      testimonial.id === editingTestimonial.id
        ? {
            ...testimonial,
            text: editTestimonialForm.text.trim(),
            author: {
              name: editTestimonialForm.author.name.trim(),
              title: editTestimonialForm.author.title.trim(),
              company: editTestimonialForm.author.company.trim(),
              avatar: editTestimonialForm.author.avatar.trim()
            },
            project: {
              name: editTestimonialForm.project.name.trim(),
              image: editTestimonialForm.project.image.trim(),
              url: editTestimonialForm.project.url.trim()
            }
          }
        : testimonial
    );

    const newData = {
      ...formData,
      testimonials: updatedTestimonials
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    // Reset form and close dialog
    setEditingTestimonial(null);
    setEditTestimonialForm({
      text: '',
      author: { name: '', title: '', company: '', avatar: '' },
      project: { name: '', image: '', url: '' }
    });
    setValidationErrors({});
    setIsEditDialogOpen(false);
    
    toast.success('Témoignage modifié avec succès');
  };

  // Remove testimonial
  const handleRemoveTestimonial = (testimonialId: string) => {
    setRemovingTestimonialId(testimonialId);
    
    setTimeout(() => {
      const filteredTestimonials = formData.testimonials.filter(testimonial => testimonial.id !== testimonialId);
      const reorderedTestimonials = updateTestimonialOrder(filteredTestimonials);
      
      const newData = {
        ...formData,
        testimonials: reorderedTestimonials
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      setRemovingTestimonialId(null);
      
      toast.success('Témoignage supprimé avec succès');
    }, 150);
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      toast.success('Section Témoignages sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving testimonials section:', error);
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
          <span className="ml-2">Chargement de la section Témoignages...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Section Témoignages
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez les témoignages clients avec glisser-déposer pour réorganiser l'ordre du slider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Testimonials Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Témoignages ({formData.testimonials.length})
            </Label>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={formData.testimonials.length >= 10}
            >
              <Plus className="h-4 w-4" />
              Ajouter un témoignage
            </Button>
          </div>

          {formData.testimonials.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun témoignage défini
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter le premier témoignage client
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter le premier témoignage
              </Button>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.testimonials.map(testimonial => testimonial.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {formData.testimonials.map((testimonial, index) => (
                    <SortableTestimonialItem
                      key={testimonial.id}
                      testimonial={testimonial}
                      index={index}
                      onEdit={handleEditTestimonial}
                      onRemove={handleRemoveTestimonial}
                      errors={validationErrors}
                      isRemoving={removingTestimonialId === testimonial.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {formData.testimonials.length >= 10 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint le nombre maximum de témoignages (10). Supprimez un témoignage existant pour en ajouter un nouveau.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Content Preview */}
        {formData.testimonials.length > 0 && (
          <div className="space-y-2">
            <Label>Aperçu du slider de témoignages</Label>
            <Card className="p-6 bg-gray-50">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Aperçu des {formData.testimonials.length} témoignages dans l'ordre du slider :
                </p>
                <div className="grid gap-4">
                  {formData.testimonials.slice(0, 3).map((testimonial, index) => (
                    <div key={testimonial.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-sm text-gray-500 font-medium">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <blockquote className="text-gray-700 italic text-sm mb-3">
                            "{testimonial.text.length > 100 ? testimonial.text.substring(0, 100) + '...' : testimonial.text}"
                          </blockquote>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {testimonial.author.avatar && (
                                <img
                                  src={testimonial.author.avatar}
                                  alt={testimonial.author.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{testimonial.author.name}</p>
                                <p className="text-xs text-gray-600">{testimonial.author.title}</p>
                              </div>
                            </div>
                            {testimonial.project.name && (
                              <div className="text-right">
                                <p className="text-xs font-medium">{testimonial.project.name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.testimonials.length > 3 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      ... et {formData.testimonials.length - 3} autres témoignages
                    </div>
                  )}
                </div>
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

        {/* Add Testimonial Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau témoignage</DialogTitle>
              <DialogDescription>
                Ajoutez un témoignage client avec les informations de l'auteur et du projet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Testimonial Text */}
              <div className="space-y-2">
                <Label htmlFor="testimonial-text">
                  Texte du témoignage *
                  <span className="text-xs text-gray-500 ml-1">
                    ({newTestimonialForm.text.length}/1000)
                  </span>
                </Label>
                <Textarea
                  id="testimonial-text"
                  value={newTestimonialForm.text}
                  onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Ex: J'ai eu le privilège de travailler avec Victor sur..."
                  rows={4}
                  className={validationErrors.text ? 'border-red-500' : ''}
                  maxLength={1000}
                />
                {validationErrors.text && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.text}
                  </p>
                )}
              </div>

              {/* Author Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Informations de l'auteur</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author-name">Nom de l'auteur *</Label>
                    <Input
                      id="author-name"
                      value={newTestimonialForm.author.name}
                      onChange={(e) => setNewTestimonialForm(prev => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value }
                      }))}
                      placeholder="Ex: Jasen Dowell"
                      className={validationErrors.authorName ? 'border-red-500' : ''}
                      maxLength={100}
                    />
                    {validationErrors.authorName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.authorName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author-title">Titre/Poste *</Label>
                    <Input
                      id="author-title"
                      value={newTestimonialForm.author.title}
                      onChange={(e) => setNewTestimonialForm(prev => ({
                        ...prev,
                        author: { ...prev.author, title: e.target.value }
                      }))}
                      placeholder="Ex: CEO"
                      className={validationErrors.authorTitle ? 'border-red-500' : ''}
                      maxLength={150}
                    />
                    {validationErrors.authorTitle && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.authorTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author-company">Entreprise</Label>
                  <Input
                    id="author-company"
                    value={newTestimonialForm.author.company}
                    onChange={(e) => setNewTestimonialForm(prev => ({
                      ...prev,
                      author: { ...prev.author, company: e.target.value }
                    }))}
                    placeholder="Ex: Savills Stacker"
                    className={validationErrors.authorCompany ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                  {validationErrors.authorCompany && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.authorCompany}
                    </p>
                  )}
                </div>

                {/* Author Avatar */}
                <div className="space-y-2">
                  <Label>Photo de l'auteur</Label>
                  <div className="flex items-center gap-4">
                    {newTestimonialForm.author.avatar ? (
                      <div className="relative">
                        <img
                          src={newTestimonialForm.author.avatar}
                          alt="Avatar de l'auteur"
                          className="w-16 h-16 object-cover rounded-full border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewTestimonialForm(prev => ({
                            ...prev,
                            author: { ...prev.author, avatar: '' }
                          }))}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAvatarSelector(false)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {newTestimonialForm.author.avatar ? 'Changer' : 'Ajouter'} la photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Format carré recommandé (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Informations du projet (optionnel)</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="project-name">Nom du projet</Label>
                  <Input
                    id="project-name"
                    value={newTestimonialForm.project.name}
                    onChange={(e) => setNewTestimonialForm(prev => ({
                      ...prev,
                      project: { ...prev.project, name: e.target.value }
                    }))}
                    placeholder="Ex: Application mobile Stacker"
                    className={validationErrors.projectName ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                  {validationErrors.projectName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.projectName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-url">Lien vers le projet</Label>
                  <Input
                    id="project-url"
                    value={newTestimonialForm.project.url}
                    onChange={(e) => setNewTestimonialForm(prev => ({
                      ...prev,
                      project: { ...prev.project, url: e.target.value }
                    }))}
                    placeholder="https://apps.apple.com/..."
                    className={validationErrors.projectUrl ? 'border-red-500' : ''}
                  />
                  {validationErrors.projectUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.projectUrl}
                    </p>
                  )}
                </div>

                {/* Project Image */}
                <div className="space-y-2">
                  <Label>Image du projet</Label>
                  <div className="flex items-center gap-4">
                    {newTestimonialForm.project.image ? (
                      <div className="relative">
                        <img
                          src={newTestimonialForm.project.image}
                          alt="Image du projet"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewTestimonialForm(prev => ({
                            ...prev,
                            project: { ...prev.project, image: '' }
                          }))}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectImageSelector(false)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {newTestimonialForm.project.image ? 'Changer' : 'Ajouter'} l'image
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Image du projet (max 15MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewTestimonialForm({
                    text: '',
                    author: { name: '', title: '', company: '', avatar: '' },
                    project: { name: '', image: '', url: '' }
                  });
                  setValidationErrors({});
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleAddTestimonial}>
                Ajouter le témoignage
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
            <div className="space-y-6">
              {/* Testimonial Text */}
              <div className="space-y-2">
                <Label htmlFor="edit-testimonial-text">
                  Texte du témoignage *
                  <span className="text-xs text-gray-500 ml-1">
                    ({editTestimonialForm.text.length}/1000)
                  </span>
                </Label>
                <Textarea
                  id="edit-testimonial-text"
                  value={editTestimonialForm.text}
                  onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Ex: J'ai eu le privilège de travailler avec Victor sur..."
                  rows={4}
                  className={validationErrors.text ? 'border-red-500' : ''}
                  maxLength={1000}
                />
                {validationErrors.text && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.text}
                  </p>
                )}
              </div>

              {/* Author Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Informations de l'auteur</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-author-name">Nom de l'auteur *</Label>
                    <Input
                      id="edit-author-name"
                      value={editTestimonialForm.author.name}
                      onChange={(e) => setEditTestimonialForm(prev => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value }
                      }))}
                      placeholder="Ex: Jasen Dowell"
                      className={validationErrors.authorName ? 'border-red-500' : ''}
                      maxLength={100}
                    />
                    {validationErrors.authorName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.authorName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-author-title">Titre/Poste *</Label>
                    <Input
                      id="edit-author-title"
                      value={editTestimonialForm.author.title}
                      onChange={(e) => setEditTestimonialForm(prev => ({
                        ...prev,
                        author: { ...prev.author, title: e.target.value }
                      }))}
                      placeholder="Ex: CEO"
                      className={validationErrors.authorTitle ? 'border-red-500' : ''}
                      maxLength={150}
                    />
                    {validationErrors.authorTitle && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.authorTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-author-company">Entreprise</Label>
                  <Input
                    id="edit-author-company"
                    value={editTestimonialForm.author.company}
                    onChange={(e) => setEditTestimonialForm(prev => ({
                      ...prev,
                      author: { ...prev.author, company: e.target.value }
                    }))}
                    placeholder="Ex: Savills Stacker"
                    className={validationErrors.authorCompany ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                  {validationErrors.authorCompany && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.authorCompany}
                    </p>
                  )}
                </div>

                {/* Author Avatar */}
                <div className="space-y-2">
                  <Label>Photo de l'auteur</Label>
                  <div className="flex items-center gap-4">
                    {editTestimonialForm.author.avatar ? (
                      <div className="relative">
                        <img
                          src={editTestimonialForm.author.avatar}
                          alt="Avatar de l'auteur"
                          className="w-16 h-16 object-cover rounded-full border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTestimonialForm(prev => ({
                            ...prev,
                            author: { ...prev.author, avatar: '' }
                          }))}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAvatarSelector(true)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {editTestimonialForm.author.avatar ? 'Changer' : 'Ajouter'} la photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Format carré recommandé (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Informations du projet (optionnel)</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-project-name">Nom du projet</Label>
                  <Input
                    id="edit-project-name"
                    value={editTestimonialForm.project.name}
                    onChange={(e) => setEditTestimonialForm(prev => ({
                      ...prev,
                      project: { ...prev.project, name: e.target.value }
                    }))}
                    placeholder="Ex: Application mobile Stacker"
                    className={validationErrors.projectName ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                  {validationErrors.projectName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.projectName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-project-url">Lien vers le projet</Label>
                  <Input
                    id="edit-project-url"
                    value={editTestimonialForm.project.url}
                    onChange={(e) => setEditTestimonialForm(prev => ({
                      ...prev,
                      project: { ...prev.project, url: e.target.value }
                    }))}
                    placeholder="https://apps.apple.com/..."
                    className={validationErrors.projectUrl ? 'border-red-500' : ''}
                  />
                  {validationErrors.projectUrl && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.projectUrl}
                    </p>
                  )}
                </div>

                {/* Project Image */}
                <div className="space-y-2">
                  <Label>Image du projet</Label>
                  <div className="flex items-center gap-4">
                    {editTestimonialForm.project.image ? (
                      <div className="relative">
                        <img
                          src={editTestimonialForm.project.image}
                          alt="Image du projet"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTestimonialForm(prev => ({
                            ...prev,
                            project: { ...prev.project, image: '' }
                          }))}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProjectImageSelector(true)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {editTestimonialForm.project.image ? 'Changer' : 'Ajouter'} l'image
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Image du projet (max 15MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingTestimonial(null);
                  setEditTestimonialForm({
                    text: '',
                    author: { name: '', title: '', company: '', avatar: '' },
                    project: { name: '', image: '', url: '' }
                  });
                  setValidationErrors({});
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateTestimonial}>
                Sauvegarder les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    {/* Media Selectors */}
    <MediaSelector
      isOpen={isAvatarSelectorOpen}
      onClose={() => setIsAvatarSelectorOpen(false)}
      onSelect={(media) => handleMediaSelect(media, 'avatar')}
      allowedTypes={['avatar']}
      title="Sélectionner un avatar"
      description="Choisissez une photo pour l'auteur du témoignage"
    />

    <MediaSelector
      isOpen={isProjectImageSelectorOpen}
      onClose={() => setIsProjectImageSelectorOpen(false)}
      onSelect={(media) => handleMediaSelect(media, 'projectImage')}
      allowedTypes={['projectImage']}
      title="Sélectionner une image de projet"
      description="Choisissez une image pour illustrer le projet"
    />
  </>
  );
}