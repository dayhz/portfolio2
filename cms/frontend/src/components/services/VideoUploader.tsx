import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Trash2, Link } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

const VideoUploader: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isYoutubeUrl, setIsYoutubeUrl] = useState<boolean>(true);
  const [customUrl, setCustomUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationSystem = useNotificationSystem();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        setVideoUrl(tempUrl);
        setIsYoutubeUrl(false);
      } else {
        notificationSystem.error('Format invalide', 'Le fichier sélectionné n\'est pas une vidéo valide.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        setVideoUrl(tempUrl);
        setIsYoutubeUrl(false);
      } else {
        notificationSystem.error('Format invalide', 'Le fichier déposé n\'est pas une vidéo valide.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = () => {
    if (!videoFile) return;
    
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        notificationSystem.success('Upload réussi', 'Vidéo téléchargée avec succès !');
      }
    }, 200);
  };

  const handleRemove = () => {
    setVideoFile(null);
    setVideoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    notificationSystem.info('Vidéo supprimée', 'La vidéo a été supprimée.');
  };

  const handleYoutubeUrlChange = () => {
    if (customUrl) {
      // Extract YouTube video ID
      let videoId = '';
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = customUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        videoId = match[1];
        setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
        setIsYoutubeUrl(true);
        notificationSystem.success('URL mise à jour', 'URL YouTube mise à jour avec succès !');
      } else {
        notificationSystem.error('URL invalide', 'URL YouTube invalide. Veuillez entrer une URL YouTube valide.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-100 relative">
              {videoUrl ? (
                isYoutubeUrl ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    title="Video preview"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={videoUrl}
                    className="w-full h-full"
                    controls
                  ></video>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play size={48} className="text-gray-400" />
                  <p className="text-gray-500 mt-2">Aucune vidéo sélectionnée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Télécharger une vidéo</Label>
            <div
              className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Glissez-déposez une vidéo ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-500">
                MP4, WebM ou Ogg, max 100MB
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {videoFile && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{videoFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              
              {isUploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Téléchargement en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleUpload} className="flex-1">
                    Télécharger
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette vidéo ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">Ou utiliser une vidéo YouTube</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleYoutubeUrlChange}
                  disabled={!customUrl}
                >
                  <Link size={16} className="mr-2" />
                  Appliquer
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Collez l'URL d'une vidéo YouTube pour l'intégrer à votre site.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Options d'affichage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Titre de la vidéo</Label>
            <Input
              id="video-title"
              placeholder="Ma vidéo de présentation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-description">Description (optionnelle)</Label>
            <Input
              id="video-description"
              placeholder="Une courte description de la vidéo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;