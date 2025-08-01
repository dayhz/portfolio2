import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Save, 
  Eye, 
  AlertCircle, 
  Route, 
  Plus, 
  Trash2, 
  GripVertical,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/TiptapEditor';
import { ApproachData, ApproachStep, ValidationError } from '../../../../shared/types/services';
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

interface ApproachEditorProps {
  data: ApproachData;
  onChange: (data: ApproachData) => void;
  onSave?: (data: ApproachData) => Promise<void>;
  onPreview?: (data: ApproachData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
  isSaving?: boolean;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface SortableStepItemProps {
  step: ApproachStep;
  index: number;
  onUpdate: (id: string, field: keyof ApproachStep, value: string) => void;
  onRemove: (id: string) => void;
  onIconUpload: (id: string, file: File) => void;
  errors: Record<string, string>;
  isRemoving?: boolean;
}

function SortableStepItem({ 
  step, 
  index, 
  onUpdate, 
  onRemove, 
  onIconUpload, 
  errors,
  isRemoving = false
}: SortableStepItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(step.icon || null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La taille du fichier ne doit pas dépasser 2MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setIconPreview(result);
      };
      reader.readAsDataURL(file);

      onIconUpload(step.id, file);
    }
  };

  const handleRemoveIcon = () => {
    setIconPreview(null);
    onUpdate(step.id, 'icon', '');
  };

  const handleRemove = () => {
    setShowRemoveDialog(false);
    onRemove(step.id);
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
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.number}
                </div>
                <CardTitle className="text-lg">Étape {step.number}</CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor={`step-title-${step.id}`}>
              Titre de l'étape *
              <span className="text-xs text-gray-500 ml-1">
                ({(step.title?.length || 0)}/100)
              </span>
            </Label>
            <Input
              id={`step-title-${step.id}`}
              value={step.title || ''}
              onChange={(e) => onUpdate(step.id, 'title', e.target.value)}
              placeholder="Ex: Analyse et Découverte"
              className={errors[`${step.id}-title`] ? 'border-red-500' : ''}
              maxLength={100}
            />
            {errors[`${step.id}-title`] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[`${step.id}-title`]}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor={`step-description-${step.id}`}>
              Description *
              <span className="text-xs text-gray-500 ml-1">
                ({(step.description?.length || 0)}/300)
              </span>
            </Label>
            <div className={errors[`${step.id}-description`] ? 'border border-red-500 rounded-md' : ''}>
              <TiptapEditor
                content={step.description || ''}
                onChange={(content) => onUpdate(step.id, 'description', content)}
                placeholder="Décrivez cette étape de votre processus..."
              />
            </div>
            {errors[`${step.id}-description`] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[`${step.id}-description`]}
              </p>
            )}
          </div>

          {/* Icon Upload */}
          <div className="space-y-2">
            <Label>Icône (optionnel)</Label>
            <div className="flex items-center gap-4">
              {iconPreview ? (
                <div className="relative">
                  <img
                    src={iconPreview}
                    alt="Icône de l'étape"
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveIcon}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id={`icon-upload-${step.id}`}
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`icon-upload-${step.id}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {iconPreview ? 'Changer' : 'Ajouter'} l'icône
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, SVG (max 2MB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'étape</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'étape "{step.title || `Étape ${step.number}`}" ? 
              Cette action est irréversible et les numéros des étapes suivantes seront automatiquement mis à jour.
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

export function ApproachEditor({
  data,
  onChange,
  onSave,
  onPreview,
  errors = [],
  isLoading = false,
  isSaving = false,
  onUnsavedChanges
}: ApproachEditorProps) {
  const [formData, setFormData] = useState<ApproachData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [removingStepId, setRemovingStepId] = useState<string | null>(null);

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
      if (error.section === 'approach') {
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

  // Generate unique ID for new steps
  const generateStepId = () => {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Update step numbering based on order
  const updateStepNumbers = (steps: ApproachStep[]): ApproachStep[] => {
    return steps.map((step, index) => ({
      ...step,
      number: index + 1,
      order: index + 1
    }));
  };

  // Handle description change
  const handleDescriptionChange = useCallback((value: string) => {
    const newData = {
      ...formData,
      description: value
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    
    // Clear validation error
    if (validationErrors.description) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }

    // Debounced onChange to parent
    const timeoutId = setTimeout(() => {
      onChange(newData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, validationErrors, onChange]);

  // Handle step field updates
  const handleStepUpdate = useCallback((stepId: string, field: keyof ApproachStep, value: string) => {
    const updatedSteps = formData.steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    );
    
    const newData = {
      ...formData,
      steps: updatedSteps
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    const errorKey = `${stepId}-${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

    // Debounced onChange to parent
    const timeoutId = setTimeout(() => {
      onChange(newData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, validationErrors, onChange]);

  // Handle icon upload
  const handleIconUpload = useCallback((stepId: string, file: File) => {
    // In a real implementation, this would upload the file to the media service
    // For now, we'll create a local URL
    const iconUrl = URL.createObjectURL(file);
    handleStepUpdate(stepId, 'icon', iconUrl);
    toast.success('Icône ajoutée avec succès');
  }, [handleStepUpdate]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.steps.findIndex(step => step.id === active.id);
      const newIndex = formData.steps.findIndex(step => step.id === over.id);

      const reorderedSteps = arrayMove(formData.steps, oldIndex, newIndex);
      const numberedSteps = updateStepNumbers(reorderedSteps);
      
      const newData = {
        ...formData,
        steps: numberedSteps
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      
      toast.success('Ordre des étapes mis à jour');
    }
  };

  // Add new step
  const handleAddStep = () => {
    const newStep: ApproachStep = {
      id: generateStepId(),
      number: formData.steps.length + 1,
      title: '',
      description: '',
      icon: '',
      order: formData.steps.length + 1
    };

    const newData = {
      ...formData,
      steps: [...formData.steps, newStep]
    };
    
    setFormData(newData);
    setHasUnsavedChanges(true);
    onChange(newData);
    
    toast.success('Nouvelle étape ajoutée');
  };

  // Remove step
  const handleRemoveStep = (stepId: string) => {
    setRemovingStepId(stepId);
    
    setTimeout(() => {
      const filteredSteps = formData.steps.filter(step => step.id !== stepId);
      const renumberedSteps = updateStepNumbers(filteredSteps);
      
      const newData = {
        ...formData,
        steps: renumberedSteps
      };
      
      setFormData(newData);
      setHasUnsavedChanges(true);
      onChange(newData);
      setRemovingStepId(null);
      
      toast.success('Étape supprimée avec succès');
    }, 150);
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      toast.success('Section Processus sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving approach section:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  // Get character count for description
  const getDescriptionCharCount = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.description || '';
    return tempDiv.textContent?.length || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Processus...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Section Processus de Travail
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez les étapes de votre processus de travail avec glisser-déposer pour réorganiser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="approach-description" className="flex items-center gap-2">
            Description du processus
            <span className="text-xs text-gray-500">
              ({getDescriptionCharCount()}/500)
            </span>
          </Label>
          <div className={validationErrors.description ? 'border border-red-500 rounded-md' : ''}>
            <TiptapEditor
              content={formData.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Décrivez votre approche et méthodologie de travail..."
            />
          </div>
          {validationErrors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.description}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Description générale de votre processus (optionnel, max 500 caractères)
          </p>
        </div>

        {/* Steps Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Étapes du processus ({formData.steps.length})
            </Label>
            <Button
              onClick={handleAddStep}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={formData.steps.length >= 6}
            >
              <Plus className="h-4 w-4" />
              Ajouter une étape
            </Button>
          </div>

          {formData.steps.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune étape définie
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter la première étape de votre processus
              </p>
              <Button onClick={handleAddStep} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter la première étape
              </Button>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.steps.map(step => step.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <SortableStepItem
                      key={step.id}
                      step={step}
                      index={index}
                      onUpdate={handleStepUpdate}
                      onRemove={handleRemoveStep}
                      onIconUpload={handleIconUpload}
                      errors={validationErrors}
                      isRemoving={removingStepId === step.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {formData.steps.length >= 6 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint le nombre maximum d'étapes (6). Supprimez une étape existante pour en ajouter une nouvelle.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Content Preview */}
        {(formData.description || formData.steps.length > 0) && (
          <div className="space-y-2">
            <Label>Aperçu du processus</Label>
            <Card className="p-6 bg-gray-50">
              <div className="space-y-6">
                {formData.description && (
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                )}
                
                {formData.steps.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {formData.steps.map((step) => (
                      <div key={step.id} className="flex gap-4 p-4 bg-white rounded-lg border">
                        <div className="flex-shrink-0">
                          {step.icon ? (
                            <img
                              src={step.icon}
                              alt={`Icône ${step.title}`}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                              {step.number}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {step.title || `Étape ${step.number}`}
                          </h4>
                          {step.description && (
                            <div 
                              className="text-sm text-gray-600 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: step.description }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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