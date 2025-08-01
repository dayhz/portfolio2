import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle, 
  Edit,
  Play,
  Upload,
  Link,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { SkillsVideoData, SkillItem, VideoData, ValidationError } from '../../../../shared/types/services';
import { MediaSelector } from '@/components/media/MediaSelector';

interface SkillsVideoEditorProps {
  data: SkillsVideoData;
  onChange: (data: SkillsVideoData) => void;
  onSave?: (data: SkillsVideoData) => Promise<void>;
  onPreview?: (data: SkillsVideoData) => void;
  errors?: ValidationError[];
  isLoading?: boolean;
}

interface SkillFormData {
  name: string;
}

interface DragItem {
  id: string;
  index: number;
}

export function SkillsVideoEditor({ 
  data, 
  onChange, 
  onSave, 
  onPreview, 
  errors = [], 
  isLoading = false 
}: SkillsVideoEditorProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [isEditSkillDialogOpen, setIsEditSkillDialogOpen] = useState(false);
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [skillForm, setSkillForm] = useState<SkillFormData>({ name: '' });
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Media selector states
  const [isVideoSelectorOpen, setIsVideoSelectorOpen] = useState(false);

  // Update validation errors when props change
  useEffect(() => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      if (error.section === 'skills') {
        errorMap[error.field] = error.message;
      }
    });
    setValidationErrors(errorMap);
  }, [errors]);

  // Handle data changes
  const handleDataChange = (newData: SkillsVideoData) => {
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
        console.error('Error saving and publishing skills & video:', error);
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

  // Validate skill form
  const validateSkillForm = (form: SkillFormData): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = 'Le nom de la compétence est obligatoire';
    } else if (form.name.length > 100) {
      errors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    // Check for duplicates
    const isDuplicate = data.skills.some(skill => 
      skill.name.toLowerCase() === form.name.trim().toLowerCase() &&
      (!editingSkill || skill.id !== editingSkill.id)
    );
    
    if (isDuplicate) {
      errors.name = 'Cette compétence existe déjà';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add skill
  const handleAddSkill = () => {
    if (!validateSkillForm(skillForm)) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: skillForm.name.trim(),
      order: data.skills.length
    };

    const newData: SkillsVideoData = {
      ...data,
      skills: [...data.skills, newSkill]
    };

    handleDataChange(newData);
    setIsAddSkillDialogOpen(false);
    resetSkillForm();
    toast.success('Compétence ajoutée avec succès');
  };

  // Handle edit skill
  const handleEditSkill = (skill: SkillItem) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name });
    setIsEditSkillDialogOpen(true);
  };

  // Handle update skill
  const handleUpdateSkill = () => {
    if (!editingSkill || !validateSkillForm(skillForm)) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const updatedSkills = data.skills.map(skill => 
      skill.id === editingSkill.id 
        ? { ...skill, name: skillForm.name.trim() }
        : skill
    );

    const newData: SkillsVideoData = {
      ...data,
      skills: updatedSkills
    };

    handleDataChange(newData);
    setIsEditSkillDialogOpen(false);
    setEditingSkill(null);
    resetSkillForm();
    toast.success('Compétence modifiée avec succès');
  };

  // Handle remove skill
  const handleRemoveSkill = (skillId: string) => {
    const updatedSkills = data.skills
      .filter(skill => skill.id !== skillId)
      .map((skill, index) => ({ ...skill, order: index }));

    const newData: SkillsVideoData = {
      ...data,
      skills: updatedSkills
    };

    handleDataChange(newData);
    toast.success('Compétence supprimée avec succès');
  };

  // Reset skill form
  const resetSkillForm = () => {
    setSkillForm({ name: '' });
    setValidationErrors({});
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, skill: SkillItem, index: number) => {
    setDraggedItem({ id: skill.id, index });
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
    const newSkills = [...data.skills];
    const draggedSkill = newSkills[dragIndex];
    
    // Remove dragged item
    newSkills.splice(dragIndex, 1);
    
    // Insert at new position
    newSkills.splice(dropIndex, 0, draggedSkill);

    // Update order
    const reorderedSkills = newSkills.map((skill, index) => ({
      ...skill,
      order: index
    }));

    const newData: SkillsVideoData = {
      ...data,
      skills: reorderedSkills
    };

    handleDataChange(newData);
    setDraggedItem(null);
    toast.success('Compétences réorganisées avec succès');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Handle video settings change
  const handleVideoChange = (updates: Partial<VideoData>) => {
    const newData: SkillsVideoData = {
      ...data,
      video: { ...data.video, ...updates }
    };
    handleDataChange(newData);
  };

  // Handle media selection from MediaSelector
  const handleVideoSelect = (media: any) => {
    handleVideoChange({ url: media.url });
    toast.success('Vidéo sélectionnée avec succès');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la section Skills & Video...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Compétences & Vidéo
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal">
              (Modifications non sauvegardées)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Gérez vos compétences et la vidéo de présentation de votre travail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="skills-description">Description</Label>
          <Textarea
            id="skills-description"
            value={data.description}
            onChange={(e) => handleDataChange({ ...data, description: e.target.value })}
            placeholder="Décrivez votre approche et votre expertise..."
            rows={3}
            className={validationErrors.description ? 'border-red-500' : ''}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Skills Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Compétences ({data.skills.length}/20)
            </Label>
            <Dialog open={isAddSkillDialogOpen} onOpenChange={setIsAddSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  disabled={data.skills.length >= 20}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une compétence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle compétence</DialogTitle>
                  <DialogDescription>
                    Ajoutez une compétence à votre liste d'expertises
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill-name">Nom de la compétence *</Label>
                    <Input
                      id="skill-name"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: User Experience Design, Prototyping..."
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddSkillDialogOpen(false);
                      resetSkillForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddSkill}>
                    Ajouter la compétence
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Skills List */}
          {data.skills.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune compétence</h3>
              <p className="text-gray-500 mb-4">
                Commencez par ajouter votre première compétence
              </p>
              <Button
                onClick={() => setIsAddSkillDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une compétence
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div
                  key={skill.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, skill, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 border rounded-lg bg-white cursor-move hover:bg-gray-50 transition-all duration-200 ${
                    draggedItem?.id === skill.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSkill(skill)}
                      className="text-blue-600 hover:text-blue-700"
                      aria-label={`Modifier la compétence ${skill.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Supprimer la compétence ${skill.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length >= 20 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint la limite de 20 compétences. Supprimez une compétence existante pour en ajouter une nouvelle.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cta-text">Texte du bouton d'action</Label>
            <Input
              id="cta-text"
              value={data.ctaText}
              onChange={(e) => handleDataChange({ ...data, ctaText: e.target.value })}
              placeholder="Ex: Voir tous les projets"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-url">URL du bouton d'action</Label>
            <Input
              id="cta-url"
              value={data.ctaUrl}
              onChange={(e) => handleDataChange({ ...data, ctaUrl: e.target.value })}
              placeholder="Ex: /work"
            />
          </div>
        </div>

        {/* Video Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Vidéo de présentation</Label>
            <Dialog open={isVideoSettingsOpen} onOpenChange={setIsVideoSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres vidéo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres de la vidéo</DialogTitle>
                  <DialogDescription>
                    Configurez les options de lecture de votre vidéo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay">Lecture automatique</Label>
                    <Switch
                      id="autoplay"
                      checked={data.video.autoplay}
                      onCheckedChange={(checked) => handleVideoChange({ autoplay: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop">Lecture en boucle</Label>
                    <Switch
                      id="loop"
                      checked={data.video.loop}
                      onCheckedChange={(checked) => handleVideoChange({ loop: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="muted">Son coupé</Label>
                    <Switch
                      id="muted"
                      checked={data.video.muted}
                      onCheckedChange={(checked) => handleVideoChange({ muted: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsVideoSettingsOpen(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL de la vidéo</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="video-url"
                    value={data.video.url}
                    onChange={(e) => handleVideoChange({ url: e.target.value })}
                    placeholder="https://example.com/video.mp4 ou URL YouTube/Vimeo"
                    className="flex-1"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  title="Sélectionner une vidéo"
                  onClick={() => setIsVideoSelectorOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-caption">Légende de la vidéo</Label>
              <Input
                id="video-caption"
                value={data.video.caption}
                onChange={(e) => handleVideoChange({ caption: e.target.value })}
                placeholder="Description de la vidéo..."
              />
            </div>

            {data.video.url && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Aperçu de la vidéo :</p>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Vidéo : {data.video.url}</p>
                    {data.video.caption && (
                      <p className="text-xs text-gray-400 mt-1">{data.video.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Skill Dialog */}
        <Dialog open={isEditSkillDialogOpen} onOpenChange={setIsEditSkillDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la compétence</DialogTitle>
              <DialogDescription>
                Modifiez le nom de cette compétence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-skill-name">Nom de la compétence *</Label>
                <Input
                  id="edit-skill-name"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: User Experience Design, Prototyping..."
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSkillDialogOpen(false);
                  setEditingSkill(null);
                  resetSkillForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdateSkill}>
                Modifier la compétence
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
              Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder et publier vos changements.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>

    {/* Media Selector */}
    <MediaSelector
      isOpen={isVideoSelectorOpen}
      onClose={() => setIsVideoSelectorOpen(false)}
      onSelect={handleVideoSelect}
      allowedTypes={['video']}
      title="Sélectionner une vidéo"
      description="Choisissez une vidéo pour la section compétences"
    />
  </>
  );
}