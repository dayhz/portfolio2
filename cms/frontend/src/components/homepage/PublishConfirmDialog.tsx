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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Save, 
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PublishConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  unsavedSections: string[];
  totalSections: number;
}

export function PublishConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
  unsavedSections,
  totalSections
}: PublishConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Publier les modifications
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Vous êtes sur le point de publier toutes les modifications en attente. 
              Cette action appliquera les changements à votre site en direct.
            </p>
            
            {unsavedSections.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  Sections avec des modifications non sauvegardées :
                </p>
                <div className="flex flex-wrap gap-2">
                  {unsavedSections.map((section) => (
                    <Badge key={section} variant="outline" className="text-orange-600 border-orange-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Sections à publier :</span>
                <Badge variant="secondary">
                  {unsavedSections.length} sur {totalSections}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Cette action est irréversible. Assurez-vous que vos modifications sont correctes 
              avant de continuer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPublishing}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPublishing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publication en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publier maintenant
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}