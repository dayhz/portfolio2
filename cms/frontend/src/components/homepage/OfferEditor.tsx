import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Eye, Plus, Trash2, GripVertical, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { homepageAPI } from '../../api/homepage';
import { OfferSection, OfferPoint } from '../../../../shared/types/homepage';

interface OfferEditorProps {
  onPreview?: (data: OfferSection) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface DragItem {
  id: number;
  index: number;
}

export function OfferEditor({ onPreview, onUnsavedChanges }: OfferEditorProps) {
  const [formData, setFormData] = useState<OfferSection>({
    title: '',
    points: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<OfferPoint | null>(null);
  const [newPointText, setNewPointText] = useState('');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const queryClient = useQueryClient();

  // Fetch offer content
  const { data: offerData, isLoading, error } = useQuery({
    queryKey: ['homepage', 'offer'],
    queryFn: () => homepageAPI.getOfferContent(),
  });

  // Update offer content mutation
  const updateMutation = useMutation({
    mutationFn: (data: OfferSection) => homepageAPI.updateOfferContent(data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['homepage', 'offer'], updatedData);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      toast.success('Section Offer mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating offer section:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Initialize form data when offer data is loaded
  useEffect(() => {
    if (offerData) {
      setFormData(offerData);
      setHasUnsavedChanges(false);
    }
  }, [offerData]);

  // Notify parent component about unsaved changes
  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onUnsavedChanges]);

  // Handle field changes
  const handleFieldChange = (field: keyof OfferSection, value: string) => {
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

  // Handle add point
  const handleAddPoint = () => {
    if (!newPointText.trim()) {
      toast.error('Veuillez saisir le texte du point');
      return;
    }

    if (formData.points.length >= 6) {
      toast.error('Maximum 6 points autorisés');
      return;
    }

    // Generate a temporary ID for the new point
    const newId = Math.max(0, ...formData.points.map(p => p.id)) + 1;
    const newOrder = formData.points.length + 1;
    
    const newPoint: OfferPoint = {
      id: newId,
      text: newPointText.trim(),
      order: newOrder
    };

    setFormData(prev => ({
      ...prev,
      points: [...prev.points, newPoint]
    }));
    
    setHasUnsavedChanges(true);
    setIsAddDialogOpen(false);
    setNewPointText('');
    toast.success('Point ajouté (n\'oubliez pas de sauvegarder)');
  };

  // Handle edit point
  const handleEditPoint = (point: OfferPoint) => {
    setEditingPoint(point);
    setNewPointText(point.text);
    setIsEditDialogOpen(true);
  };

  // Handle update point
  const handleUpdatePoint = () => {
    if (!editingPoint) return;

    if (!newPointText.trim()) {
      toast.error('Veuillez saisir le texte du point');
      return;
    }

    // Update the point in the current form data
    const updatedPoints = formData.points.map(point => 
      point.id === editingPoint.id 
        ? { ...point, text: newPointText.trim() }
        : point
    );

    setFormData(prev => ({
      ...prev,
      points: updatedPoints
    }));

    setHasUnsavedChanges(true);
    setIsEditDialogOpen(false);
    setEditingPoint(null);
    setNewPointText('');
    toast.success('Point modifié (n\'oubliez pas de sauvegarder)');
  };

  // Handle remove point
  const handleRemovePoint = (pointId: number) => {
    const updatedPoints = formData.points
      .filter(point => point.id !== pointId)
      .map((point, index) => ({ ...point, order: index + 1 })); // Reorder

    setFormData(prev => ({
      ...prev,
      points: updatedPoints
    }));
    setHasUnsavedChanges(true);
    toast.success('Point supprimé (n\'oubliez pas de sauvegarder)');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, point: OfferPoint, index: number) => {
    setDraggedItem({ id: point.id, index });
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
    const newPoints = [...formData.points];
    const draggedPoint = newPoints[dragIndex];
    
    // Remove dragged item
    newPoints.splice(dragIndex, 1);
    
    // Insert at new position
    newPoints.splice(dropIndex, 0, draggedPoint);

    // Update order numbers
    const reorderedPoints = newPoints.map((point, index) => ({
      ...point,
      order: index + 1
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      points: reorderedPoints
    }));
    
    setHasUnsavedChanges(true);
    setDraggedItem(null);
    toast.success('Points réorganisés (n\'oubliez pas de sauvegarder)');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Offer...</span>
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
              Erreur lors du chargement de la section Offer: {error.message}
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
          🎯 Section Proposition de Valeur
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez le titre "Together, we can..." et les points clés de votre proposition de valeur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="offer-title">Titre de la section *</Label>
          <Input
            id="offer-title"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Ex: Together, we can..."
            className={validationErrors.title ? 'border-red-500' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Points Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Points de valeur ({formData.points.length}/6)</Label>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  disabled={formData.points.length >= 6}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un point
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau point</DialogTitle>
                  <DialogDescription>
                    Ajoutez un point à votre proposition de valeur (maximum 6 points)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="point-text">Texte du point *</Label>
                    <Textarea
                      id="point-text"
                      value={newPointText}
                      onChange={(e) => setNewPointText(e.target.value)}
                      placeholder="Ex: Build a lasting partnership for ongoing design needs"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewPointText('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddPoint}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Points List */}
          {formData.points.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun point ajouté pour le moment</p>
              <p className="text-sm">Cliquez sur "Ajouter un point" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.points
                .sort((a, b) => a.order - b.order)
                .map((point, index) => (
                <div
                  key={point.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, point, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-4 p-4 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-colors ${
                    draggedItem?.id === point.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 mt-1" />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-500">Point {point.order}</span>
                    </div>
                    <p className="text-sm">{point.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPoint(point)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePoint(point.id)}
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

        {/* Edit Point Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le point</DialogTitle>
              <DialogDescription>
                Modifiez le texte du point de valeur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-point-text">Texte du point *</Label>
                <Textarea
                  id="edit-point-text"
                  value={newPointText}
                  onChange={(e) => setNewPointText(e.target.value)}
                  placeholder="Ex: Build a lasting partnership for ongoing design needs"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingPoint(null);
                  setNewPointText('');
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdatePoint}>
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