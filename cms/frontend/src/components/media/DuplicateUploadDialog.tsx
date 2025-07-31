import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Danger, Document, Folder, Calendar } from 'react-iconly';
import { duplicateUploadDebugger } from '@/services/DuplicateUploadDebugger';

interface ExistingFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  createdAt: string;
  url: string;
}

interface UploadedFile {
  originalName: string;
  size: number;
  mimetype: string;
}

interface DuplicateUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingFile: ExistingFile;
  uploadedFile: UploadedFile;
  onReplace: () => void;
  onRename: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function DuplicateUploadDialog({
  isOpen,
  onClose,
  existingFile,
  uploadedFile,
  onReplace,
  onRename,
  onCancel,
  isProcessing = false
}: DuplicateUploadDialogProps) {
  // Log dialog state changes
  React.useEffect(() => {
    duplicateUploadDebugger.logDialogStateChange(isOpen, isOpen ? 'dialog_opened' : 'dialog_closed', {
      existingFile: existingFile ? { id: existingFile.id, name: existingFile.name } : null,
      uploadedFile: uploadedFile ? { originalName: uploadedFile.originalName, size: uploadedFile.size } : null,
      isProcessing
    });
  }, [isOpen, isProcessing]);

  // Log component render
  React.useEffect(() => {
    if (isOpen) {
      duplicateUploadDebugger.logEvent('dialog_open', {
        component: 'DuplicateUploadDialog',
        existingFile: existingFile ? {
          id: existingFile.id,
          name: existingFile.name,
          size: existingFile.size,
          createdAt: existingFile.createdAt
        } : null,
        uploadedFile: uploadedFile ? {
          originalName: uploadedFile.originalName,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype
        } : null,
        renderTimestamp: new Date().toISOString()
      });
    }
  }, [isOpen, existingFile, uploadedFile]);

  // Enhanced action handlers with debugging
  const handleReplace = () => {
    duplicateUploadDebugger.logUserAction('replace', {
      existingFile: existingFile ? { id: existingFile.id, name: existingFile.name } : null,
      uploadedFile: uploadedFile ? { originalName: uploadedFile.originalName } : null,
      timestamp: new Date().toISOString()
    });
    onReplace();
  };

  const handleRename = () => {
    duplicateUploadDebugger.logUserAction('rename', {
      existingFile: existingFile ? { id: existingFile.id, name: existingFile.name } : null,
      uploadedFile: uploadedFile ? { originalName: uploadedFile.originalName } : null,
      timestamp: new Date().toISOString()
    });
    onRename();
  };

  const handleCancel = () => {
    duplicateUploadDebugger.logUserAction('cancel', {
      existingFile: existingFile ? { id: existingFile.id, name: existingFile.name } : null,
      uploadedFile: uploadedFile ? { originalName: uploadedFile.originalName } : null,
      timestamp: new Date().toISOString()
    });
    onCancel();
  };

  const handleClose = () => {
    duplicateUploadDebugger.logDialogStateChange(false, 'user_closed_dialog', {
      wasProcessing: isProcessing,
      timestamp: new Date().toISOString()
    });
    onClose();
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : handleClose}>
      <DialogContent className={`sm:max-w-lg ${isProcessing ? 'pointer-events-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProcessing ? (
              <LoadingSpinner size="md" className="text-amber-500" />
            ) : (
              <Danger size="medium" primaryColor="#f59e0b" />
            )}
            {isProcessing ? 'Traitement en cours...' : 'Fichier en double détecté'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Message d'avertissement */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              Un fichier avec le même nom et la même taille existe déjà dans votre médiathèque.
              Que souhaitez-vous faire ?
            </p>
          </div>

          {/* Comparaison des fichiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fichier existant */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Document size="small" primaryColor="#6b7280" />
                Fichier existant
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nom:</span>
                  <p className="text-gray-600 break-all">{existingFile.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Folder size="small" primaryColor="#6b7280" />
                  <span className="text-gray-600">{formatFileSize(existingFile.size)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size="small" primaryColor="#6b7280" />
                  <span className="text-gray-600">{formatDate(existingFile.createdAt)}</span>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">
                Déjà en ligne
              </Badge>
            </div>

            {/* Nouveau fichier */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Document size="small" primaryColor="#3b82f6" />
                Nouveau fichier
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nom:</span>
                  <p className="text-gray-600 break-all">{uploadedFile.originalName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Folder size="small" primaryColor="#6b7280" />
                  <span className="text-gray-600">{formatFileSize(uploadedFile.size)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-600 ml-1">{uploadedFile.mimetype}</span>
                </div>
              </div>
              <Badge variant="default" className="mt-2">
                À uploader
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Loading overlay when processing */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="md" className="text-blue-600" />
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium">Traitement en cours...</p>
                    <p className="text-blue-600 text-sm mt-1">
                      Veuillez patienter pendant que votre action est exécutée. 
                      N'actualisez pas la page et ne fermez pas cette fenêtre.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleReplace}
                disabled={isProcessing}
                className={`w-full justify-start transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant="destructive"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <span className="mr-2">🔄</span>
                )}
                <div className="flex flex-col items-start">
                  <span>Remplacer le fichier existant</span>
                  <span className="text-xs opacity-75 font-normal">
                    L'ancien fichier sera définitivement supprimé
                  </span>
                </div>
              </Button>
              
              <Button
                onClick={handleRename}
                disabled={isProcessing}
                className={`w-full justify-start transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant="default"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <span className="mr-2">📝</span>
                )}
                <div className="flex flex-col items-start">
                  <span>Renommer et conserver les deux</span>
                  <span className="text-xs opacity-75 font-normal">
                    Un suffixe sera ajouté au nouveau fichier
                  </span>
                </div>
              </Button>
              
              <Button
                onClick={handleCancel}
                disabled={isProcessing}
                className={`w-full justify-start transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant="outline"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <span className="mr-2">❌</span>
                )}
                <div className="flex flex-col items-start">
                  <span>Annuler l'upload</span>
                  <span className="text-xs opacity-75 font-normal">
                    Aucun changement ne sera effectué
                  </span>
                </div>
              </Button>
            </div>

            {/* Informations supplémentaires - Hidden when processing to reduce clutter */}
            {!isProcessing && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">💡 Conseils :</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Remplacer</strong> : Utilisez cette option si le nouveau fichier est une version mise à jour</li>
                  <li><strong>Renommer</strong> : Utilisez cette option pour conserver les deux versions</li>
                  <li><strong>Annuler</strong> : Utilisez cette option si vous avez uploadé le mauvais fichier</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}