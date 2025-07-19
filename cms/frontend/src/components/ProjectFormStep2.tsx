import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionEditor, EditorBlock } from './NotionEditor';
import { ProjectStep1Data } from './ProjectFormStep1';

export interface ProjectFormStep2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step1Data: ProjectStep1Data & { heroImageFile?: File };
  initialBlocks?: EditorBlock[];
  onBack: () => void;
  onComplete: (contentBlocks: EditorBlock[]) => void;
  isEditing?: boolean;
}

export function ProjectFormStep2({ 
  open, 
  onOpenChange, 
  step1Data, 
  initialBlocks = [], 
  onBack, 
  onComplete,
  isEditing = false
}: ProjectFormStep2Props) {
  const [contentBlocks, setContentBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(contentBlocks);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isEditing ? 'Modifier le contenu' : 'Nouveau projet - Étape 2/2'}
          </DialogTitle>
          <DialogDescription>
            Créez le contenu de votre projet avec l'éditeur. Tapez "/" pour ajouter des blocs.
          </DialogDescription>
        </DialogHeader>

        {/* Résumé du projet */}
        <Card className="flex-shrink-0 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{step1Data.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{step1Data.category}</span>
              <span>•</span>
              <span>{step1Data.client}</span>
              <span>•</span>
              <span>{step1Data.year}</span>
            </div>
          </CardContent>
        </Card>

        {/* Éditeur de contenu */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Contenu du projet</CardTitle>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">/</kbd> dans une ligne vide pour ouvrir le menu des blocs</p>
                <p>• Utilisez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Entrée</kbd> pour créer une nouvelle ligne</p>
                <p>• Utilisez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Backspace</kbd> sur une ligne vide pour la supprimer</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full p-6 overflow-y-auto">
                <NotionEditor
                  blocks={contentBlocks}
                  onChange={setContentBlocks}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            ← Précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer le projet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}