import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';
// import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface PhotoGalleryEditorProps {
  initialPhotos: Photo[];
  onSave: (photos: Photo[]) => Promise<void>;
  onUpload: (file: File) => Promise<{ url: string }>;
}

export default function PhotoGalleryEditor({ initialPhotos, onSave, onUpload }: PhotoGalleryEditorProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
//   const notificationSystem = useNotificationSystem();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(photos);
      notificationSystem.success('Photos mises à jour', 'Vos photos ont été enregistrées avec succès.');
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les photos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await onUpload(file);
        
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${i}`,
          url: result.url,
          alt: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        };
        
        setPhotos(prev => [...prev, newPhoto]);
      }
      
      notificationSystem.success('Upload réussi', `${files.length} photo(s) ajoutée(s) avec succès.`);
      
      handleSave();
    } catch (error) {
      notificationSystem.error('Erreur d\'upload', 'Impossible d\'uploader une ou plusieurs photos.');
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const openPreview = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsPreviewOpen(true);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openDeleteDialog = (photo: Photo) => {
    setCurrentPhoto(photo);
    setIsDeleteDialogOpen(true);
  };

  const deletePhoto = async () => {
    if (!currentPhoto) return;
    
    setPhotos(photos.filter((photo) => photo.id !== currentPhoto.id));
    setIsDeleteDialogOpen(false);
    setCurrentPhoto(null);
    
    await handleSave();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Remove the dragged item
    newPhotos.splice(draggedIndex, 1);
    // Insert it at the new position
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    handleSave();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Photos Personnelles</CardTitle>
            <div className="flex space-x-2">
              <Button disabled={isUploading}>
                <label className="cursor-pointer flex items-center">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Plus className="h-4 w-4 mr-2" />
                  <span>{isUploading ? 'Uploading...' : 'Ajouter Photo'}</span>
                </label>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Galerie de photos personnelles
              </h3>
              <p className="mt-2 text-gray-600">
                Ajoutez des photos personnelles pour le carousel de la page À Propos.
              </p>
              <Button className="mt-4">
                <label className="cursor-pointer flex items-center">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Ajouter vos premières photos</span>
                </label>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Faites glisser les photos pour réorganiser l'ordre d'affichage dans le carousel.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative group border rounded-lg overflow-hidden cursor-pointer"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-40 object-cover"
                      onClick={() => openPreview(index)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(photo);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {photos.length > 0 && (
            <div className="relative">
              <img
                src={photos[currentPhotoIndex].url}
                alt={photos[currentPhotoIndex].alt}
                className="w-full max-h-[500px] object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-between p-4">
                <Button variant="outline" size="sm" onClick={prevPhoto}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button variant="outline" size="sm" onClick={nextPhoto}>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement cette photo de votre galerie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deletePhoto} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}