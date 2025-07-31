import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Trash2, Eye, Calendar, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosConfig';

interface Media {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface DuplicateGroup {
  originalName: string;
  size: number;
  count: number;
  mediaFiles: Media[];
  keepFile: Media;
  duplicateFiles: Media[];
}

interface DuplicateDetectionResponse {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  totalGroups: number;
  message: string;
}

interface DuplicateManagerProps {
  onDuplicatesDeleted: () => void;
}

export default function DuplicateManager({ onDuplicatesDeleted }: DuplicateManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<Media | null>(null);

  // Fonction pour détecter les doublons
  const detectDuplicates = async () => {
    setIsDetecting(true);
    try {
      const response = await axiosInstance.post<DuplicateDetectionResponse>('/media/detect-duplicates');
      const data = response.data;
      
      setDuplicateGroups(data.duplicateGroups);
      
      if (data.totalDuplicates === 0) {
        toast.success('Aucun doublon détecté dans votre médiathèque');
      } else {
        toast.info(`${data.totalDuplicates} doublon(s) détecté(s) dans ${data.totalGroups} groupe(s)`);
      }
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      toast.error('Erreur lors de la détection des doublons');
    } finally {
      setIsDetecting(false);
    }
  };

  // Fonction pour supprimer tous les doublons
  const deleteAllDuplicates = async () => {
    if (duplicateGroups.length === 0) {
      toast.error('Aucun doublon à supprimer');
      return;
    }

    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicateFiles.length, 0);
    
    const confirmMessage = `⚠️ SUPPRESSION DES DOUBLONS

Vous êtes sur le point de supprimer ${totalDuplicates} fichier(s) en double.

Pour chaque groupe de doublons, le fichier le plus récent sera conservé et les autres seront supprimés définitivement.

Cette action est IRRÉVERSIBLE.

Êtes-vous sûr de vouloir continuer ?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    setDeleteProgress(0);

    try {
      const response = await axiosInstance.delete('/media/duplicates/delete', {
        onDownloadProgress: (progressEvent) => {
          const progress = Math.min(90, (progressEvent.loaded / (progressEvent.total || progressEvent.loaded)) * 100);
          setDeleteProgress(progress);
        }
      });

      const result = response.data;
      setDeleteProgress(100);

      if (result.errors && result.errors.length > 0) {
        const errorDetails = result.errors.slice(0, 3).join('\n');
        const moreErrors = result.errors.length > 3 ? `\n... et ${result.errors.length - 3} autres erreurs` : '';
        
        toast.error(
          `${result.deleted} doublon(s) supprimé(s), ${result.kept} fichier(s) conservé(s).\n${result.errors.length} erreur(s):\n${errorDetails}${moreErrors}`,
          { duration: 8000 }
        );
      } else {
        toast.success(`${result.deleted} doublon(s) supprimé(s) avec succès, ${result.kept} fichier(s) conservé(s)`);
      }

      // Fermer le dialog et rafraîchir la liste
      setIsOpen(false);
      setDuplicateGroups([]);
      onDuplicatesDeleted();
    } catch (error) {
      console.error('Error deleting duplicates:', error);
      toast.error('Erreur lors de la suppression des doublons');
    } finally {
      setIsDeleting(false);
      setDeleteProgress(0);
    }
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          if (duplicateGroups.length === 0) {
            detectDuplicates();
          }
        }}
        disabled={isDetecting}
        className="gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        {isDetecting ? 'Détection...' : 'Détecter doublons'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Gestion des doublons
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions principales */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Actions disponibles</h3>
                <p className="text-sm text-gray-600">
                  {duplicateGroups.length === 0 
                    ? 'Cliquez sur "Détecter" pour analyser votre médiathèque'
                    : `${duplicateGroups.reduce((sum, group) => sum + group.duplicateFiles.length, 0)} doublon(s) détecté(s) dans ${duplicateGroups.length} groupe(s)`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={detectDuplicates}
                  disabled={isDetecting || isDeleting}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isDetecting ? 'Détection...' : 'Détecter'}
                </Button>
                {duplicateGroups.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={deleteAllDuplicates}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Suppression...' : 'Supprimer tous les doublons'}
                  </Button>
                )}
              </div>
            </div>

            {/* Barre de progression pour la suppression */}
            {isDeleting && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-900">Suppression des doublons en cours</h3>
                  <span className="text-sm text-red-700">{Math.round(deleteProgress)}%</span>
                </div>
                <Progress value={deleteProgress} className="mb-2" />
                <p className="text-sm text-red-700">
                  Suppression des fichiers en double... Cette opération peut prendre quelques instants.
                </p>
              </div>
            )}

            {/* Liste des groupes de doublons */}
            {duplicateGroups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Groupes de doublons détectés</h3>
                
                {duplicateGroups.map((group, groupIndex) => (
                  <Card key={groupIndex} className="border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-orange-500" />
                          <span className="truncate">{group.originalName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {group.count} fichiers
                          </Badge>
                          <Badge variant="outline" className="text-gray-600">
                            {formatFileSize(group.size)}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Fichier à conserver */}
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {group.keepFile.type === 'image' && group.keepFile.url && (
                              <img
                                src={group.keepFile.url}
                                alt={group.keepFile.name}
                                className="w-12 h-12 object-cover rounded cursor-pointer"
                                onClick={() => setSelectedPreview(group.keepFile)}
                              />
                            )}
                            <div>
                              <p className="font-medium text-green-800">
                                ✓ À conserver (plus récent)
                              </p>
                              <p className="text-sm text-green-700">{group.keepFile.name}</p>
                              <div className="flex items-center gap-2 text-xs text-green-600">
                                <Calendar className="h-3 w-3" />
                                {formatDate(group.keepFile.createdAt)}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPreview(group.keepFile)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Voir
                          </Button>
                        </div>
                      </div>

                      {/* Fichiers à supprimer */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-700">
                          Doublons à supprimer ({group.duplicateFiles.length})
                        </p>
                        {group.duplicateFiles.map((duplicate, dupIndex) => (
                          <div key={duplicate.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {duplicate.type === 'image' && duplicate.url && (
                                  <img
                                    src={duplicate.url}
                                    alt={duplicate.name}
                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                    onClick={() => setSelectedPreview(duplicate)}
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-red-800">
                                    ✗ Doublon #{dupIndex + 1}
                                  </p>
                                  <p className="text-sm text-red-700">{duplicate.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(duplicate.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPreview(duplicate)}
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Message si aucun doublon */}
            {!isDetecting && duplicateGroups.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun doublon détecté</h3>
                <p className="text-gray-600">
                  Votre médiathèque ne contient pas de fichiers en double.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation */}
      {selectedPreview && (
        <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPreview.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPreview.type === 'image' && selectedPreview.url && (
                <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={selectedPreview.url}
                    alt={selectedPreview.name}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Taille</p>
                  <p className="text-gray-600">{formatFileSize(selectedPreview.size)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Type</p>
                  <p className="text-gray-600">{selectedPreview.mimeType}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Créé le</p>
                  <p className="text-gray-600">{formatDate(selectedPreview.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Modifié le</p>
                  <p className="text-gray-600">{formatDate(selectedPreview.updatedAt)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}