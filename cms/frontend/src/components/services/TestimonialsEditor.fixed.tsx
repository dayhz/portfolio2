import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Loader2, 
  Save, 
  Eye, 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { TestimonialsData, Testimonial, ValidationError } from '../../../../shared/types/services';

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
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  projectName: string;
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
  // États locaux simples - pas de useEffect problématiques
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  // Form states
  const [newTestimonialForm, setNewTestimonialForm] = useState<TestimonialFormData>({
    text: '',
    authorName: '',
    authorTitle: '',
    authorCompany: '',
    projectName: ''
  });
  
  const [editTestimonialForm, setEditTestimonialForm] = useState<TestimonialFormData>({
    text: '',
    authorName: '',
    authorTitle: '',
    authorCompany: '',
    projectName: ''
  });

  // Fonction utilitaire pour notifier les changements
  const notifyChange = (newData: TestimonialsData) => {
    onChange(newData);
    if (onUnsavedChanges) {
      onUnsavedChanges(true);
    }
  };

  // Generate unique ID for new testimonials
  const generateTestimonialId = () => {
    return `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Validate testimonial form
  const validateTestimonialForm = (formData: TestimonialFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.text.trim()) {
      errors.text = 'Le texte du témoignage est requis';
    } else if (formData.text.trim().length < 10) {
      errors.text = 'Le témoignage doit contenir au moins 10 caractères';
    }

    if (!formData.authorName.trim()) {
      errors.authorName = 'Le nom de l\'auteur est requis';
    }

    if (!formData.authorTitle.trim()) {
      errors.authorTitle = 'Le titre de l\'auteur est requis';
    }

    return errors;
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
        name: newTestimonialForm.authorName.trim(),
        title: newTestimonialForm.authorTitle.trim(),
        company: newTestimonialForm.authorCompany.trim(),
        avatar: ''
      },
      project: {
        name: newTestimonialForm.projectName.trim(),
        image: '',
        url: ''
      },
      order: data.testimonials.length + 1
    };

    const newData = {
      ...data,
      testimonials: [...data.testimonials, newTestimonial]
    };
    
    notifyChange(newData);
    
    // Reset form and close dialog
    setNewTestimonialForm({
      text: '',
      authorName: '',
      authorTitle: '',
      authorCompany: '',
      projectName: ''
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
      authorName: testimonial.author.name,
      authorTitle: testimonial.author.title,
      authorCompany: testimonial.author.company || '',
      projectName: testimonial.project.name || ''
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

    const updatedTestimonials = data.testimonials.map(testimonial =>
      testimonial.id === editingTestimonial.id
        ? {
            ...testimonial,
            text: editTestimonialForm.text.trim(),
            author: {
              ...testimonial.author,
              name: editTestimonialForm.authorName.trim(),
              title: editTestimonialForm.authorTitle.trim(),
              company: editTestimonialForm.authorCompany.trim()
            },
            project: {
              ...testimonial.project,
              name: editTestimonialForm.projectName.trim()
            }
          }
        : testimonial
    );

    const newData = {
      ...data,
      testimonials: updatedTestimonials
    };
    
    notifyChange(newData);
    
    // Reset form and close dialog
    setEditingTestimonial(null);
    setEditTestimonialForm({
      text: '',
      authorName: '',
      authorTitle: '',
      authorCompany: '',
      projectName: ''
    });
    setValidationErrors({});
    setIsEditDialogOpen(false);
    
    toast.success('Témoignage modifié avec succès');
  };

  // Remove testimonial
  const handleRemoveTestimonial = (testimonialId: string) => {
    const filteredTestimonials = data.testimonials.filter(testimonial => testimonial.id !== testimonialId);
    
    // Update order numbers
    const reorderedTestimonials = filteredTestimonials.map((testimonial, index) => ({
      ...testimonial,
      order: index + 1
    }));
    
    const newData = {
      ...data,
      testimonials: reorderedTestimonials
    };
    
    notifyChange(newData);
    toast.success('Témoignage supprimé avec succès');
  };

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(data);
      if (onUnsavedChanges) {
        onUnsavedChanges(false);
      }
      toast.success('Section Témoignages sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving testimonials section:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(data);
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
          </CardTitle>
          <CardDescription>
            Gérez les témoignages clients pour présenter les retours et projets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Testimonials List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Témoignages ({data.testimonials.length})
              </Label>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un témoignage
              </Button>
            </div>

            {data.testimonials.length === 0 ? (
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
              <div className="space-y-4">
                {data.testimonials.map((testimonial, index) => (
                  <Card key={testimonial.id} className="transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg">Témoignage {index + 1}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTestimonial(testimonial)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTestimonial(testimonial.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <blockquote className="text-gray-700 italic mb-4">
                          "{testimonial.text}"
                        </blockquote>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.author.name}</p>
                              <p className="text-sm text-gray-600">{testimonial.author.title}</p>
                              {testimonial.author.company && (
                                <p className="text-sm text-gray-500">{testimonial.author.company}</p>
                              )}
                            </div>
                          </div>

                          {testimonial.project.name && (
                            <div className="ml-auto text-right">
                              <p className="text-sm font-medium text-gray-900">{testimonial.project.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Sauvegarder
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

          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Erreurs de validation :</p>
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

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau témoignage</DialogTitle>
            <DialogDescription>
              Ajoutez un témoignage client avec les informations de l'auteur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Testimonial Text */}
            <div className="space-y-2">
              <Label htmlFor="testimonial-text">Texte du témoignage *</Label>
              <Textarea
                id="testimonial-text"
                value={newTestimonialForm.text}
                onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Ex: J'ai eu le privilège de travailler avec Victor sur..."
                rows={4}
                className={validationErrors.text ? 'border-red-500' : ''}
              />
              {validationErrors.text && (
                <p className="text-sm text-red-600">{validationErrors.text}</p>
              )}
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author-name">Nom de l'auteur *</Label>
                <Input
                  id="author-name"
                  value={newTestimonialForm.authorName}
                  onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Ex: Jean Dupont"
                  className={validationErrors.authorName ? 'border-red-500' : ''}
                />
                {validationErrors.authorName && (
                  <p className="text-sm text-red-600">{validationErrors.authorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author-title">Titre/Poste *</Label>
                <Input
                  id="author-title"
                  value={newTestimonialForm.authorTitle}
                  onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, authorTitle: e.target.value }))}
                  placeholder="Ex: Directeur Marketing"
                  className={validationErrors.authorTitle ? 'border-red-500' : ''}
                />
                {validationErrors.authorTitle && (
                  <p className="text-sm text-red-600">{validationErrors.authorTitle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author-company">Entreprise</Label>
                <Input
                  id="author-company"
                  value={newTestimonialForm.authorCompany}
                  onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, authorCompany: e.target.value }))}
                  placeholder="Ex: Tech Corp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet</Label>
                <Input
                  id="project-name"
                  value={newTestimonialForm.projectName}
                  onChange={(e) => setNewTestimonialForm(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Ex: Application Mobile"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
        <DialogContent className="max-w-2xl">
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
                rows={4}
                className={validationErrors.text ? 'border-red-500' : ''}
              />
              {validationErrors.text && (
                <p className="text-sm text-red-600">{validationErrors.text}</p>
              )}
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-author-name">Nom de l'auteur *</Label>
                <Input
                  id="edit-author-name"
                  value={editTestimonialForm.authorName}
                  onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, authorName: e.target.value }))}
                  className={validationErrors.authorName ? 'border-red-500' : ''}
                />
                {validationErrors.authorName && (
                  <p className="text-sm text-red-600">{validationErrors.authorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-author-title">Titre/Poste *</Label>
                <Input
                  id="edit-author-title"
                  value={editTestimonialForm.authorTitle}
                  onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, authorTitle: e.target.value }))}
                  className={validationErrors.authorTitle ? 'border-red-500' : ''}
                />
                {validationErrors.authorTitle && (
                  <p className="text-sm text-red-600">{validationErrors.authorTitle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-author-company">Entreprise</Label>
                <Input
                  id="edit-author-company"
                  value={editTestimonialForm.authorCompany}
                  onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, authorCompany: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-name">Nom du projet</Label>
                <Input
                  id="edit-project-name"
                  value={editTestimonialForm.projectName}
                  onChange={(e) => setEditTestimonialForm(prev => ({ ...prev, projectName: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateTestimonial}>
              Sauvegarder les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}