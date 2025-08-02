import React, { useState } from 'react';
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
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { ApproachData, ApproachStep, ValidationError } from '../../../../shared/types/services';

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

export default function ApproachEditor({
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



  // Simple change handler
  const handleChange = (newData: ApproachData) => {
    setFormData(newData);
    setHasUnsavedChanges(true);
    
    // Notify parent immediately without useEffect
    if (onUnsavedChanges) {
      onUnsavedChanges(true);
    }
  };

  // Handle manual save
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      if (onUnsavedChanges) {
        onUnsavedChanges(false);
      }
      toast.success('Modifications sauvegardées');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData(data);
    setHasUnsavedChanges(false);
    if (onUnsavedChanges) {
      onUnsavedChanges(false);
    }
    toast.info('Modifications annulées');
  };

  // Handle preview
  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  // Add step
  const addStep = () => {
    const newStep: ApproachStep = {
      id: `step-${Date.now()}`,
      number: formData.steps.length + 1,
      title: 'Nouvelle étape',
      description: 'Description de l\'étape'
    };
    
    const newData = {
      ...formData,
      steps: [...formData.steps, newStep]
    };
    
    handleChange(newData);
    toast.success('Nouvelle étape ajoutée');
  };

  // Remove step
  const removeStep = (stepId: string) => {
    const newSteps = formData.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, number: index + 1 }));
    
    const newData = {
      ...formData,
      steps: newSteps
    };
    
    handleChange(newData);
    toast.success('Étape supprimée');
  };

  // Update step
  const updateStep = (stepId: string, field: keyof ApproachStep, value: string) => {
    const newSteps = formData.steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    );
    
    const newData = {
      ...formData,
      steps: newSteps
    };
    
    handleChange(newData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement...</span>
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
          Gérez les étapes de votre processus de travail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="approach-title">Titre de la section</Label>
          <Input
            id="approach-title"
            value={formData.title}
            onChange={(e) => {
              const newData = { ...formData, title: e.target.value };
              handleChange(newData);
            }}
            placeholder="Ex: Mon Processus de Travail"
            className="rounded"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="approach-description">Description</Label>
          <textarea
            id="approach-description"
            value={formData.description}
            onChange={(e) => {
              const newData = { ...formData, description: e.target.value };
              handleChange(newData);
            }}
            placeholder="Description de votre processus"
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Video URL Field */}
        <div className="space-y-2">
          <Label htmlFor="approach-video">URL de la vidéo</Label>
          <Input
            id="approach-video"
            value={formData.videoUrl || ''}
            onChange={(e) => {
              const newData = { ...formData, videoUrl: e.target.value };
              handleChange(newData);
            }}
            placeholder="https://example.com/video.mp4"
            className="rounded"
          />
        </div>

        {/* CTA Field */}
        <div className="space-y-2">
          <Label htmlFor="approach-cta">Call-to-Action</Label>
          <Input
            id="approach-cta"
            value={formData.ctaText || ''}
            onChange={(e) => {
              const newData = { ...formData, ctaText: e.target.value };
              handleChange(newData);
            }}
            placeholder="Ex: Travaillons ensemble !"
            className="rounded"
          />
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Étapes du processus</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStep}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une étape
            </Button>
          </div>

          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <Card key={step.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      placeholder="Titre de l'étape"
                      className="font-medium"
                    />
                    
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                      placeholder="Description de l'étape"
                      className="w-full p-2 border rounded text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
          >
            Annuler
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Aperçu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}