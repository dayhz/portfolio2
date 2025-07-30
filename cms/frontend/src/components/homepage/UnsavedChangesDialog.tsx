import React from 'react';
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
import { AlertTriangle, Save } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSaveAndContinue?: () => void;
  title?: string;
  description?: string;
  showSaveOption?: boolean;
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onContinue,
  onSaveAndContinue,
  title = "Modifications non sauvegardées",
  description = "Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?",
  showSaveOption = true
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={onClose}>
            Annuler
          </AlertDialogCancel>
          
          {showSaveOption && onSaveAndContinue && (
            <AlertDialogAction
              onClick={onSaveAndContinue}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder et continuer
            </AlertDialogAction>
          )}
          
          <AlertDialogAction
            onClick={onContinue}
            variant="destructive"
          >
            Continuer sans sauvegarder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}