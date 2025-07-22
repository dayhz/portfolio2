import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, Search, Filter, Delete } from 'react-iconly';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import axiosInstance from '@/utils/axiosConfig';

// Interface pour les médias
interface Media {
  id: string;
  name: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  displayName?: string; // Nom à afficher (avec suffixe pour éviter les doublons)
}

interface MediaResponse {
  data: Media[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function MediaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMedia, setTotalMedia] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  
  const { get, delete: deleteRequest } = useApi();
  
  // Charger les médias au chargement de la page
  useEffect(() => {
    fetchMedia();
  }, []);
  
  // Fonction pour récupérer les médias depuis l'API
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await get<MediaResponse>('/media', {
        showErrorToast: true
      });
      
      if (response) {
        console.log('Media response:', response);
        
        // S'assurer que les URLs sont absolues et que les noms sont uniques
        const mediaWithFixedUrls = response.data.map(media => {
          // Si l'URL n'est pas absolue, la convertir en URL absolue et pointer vers le répertoire public
          if (media.url && !media.url.startsWith('http')) {
            // Extraire juste le nom du fichier de l'URL
            const filename = media.url.split('/').pop()?.trim();
            if (filename) {
              // Utiliser le répertoire public du frontend
              media.url = `/uploads/${filename}`;
            }
          }
          
          // Faire de même pour la miniature
          if (media.thumbnailUrl && !media.thumbnailUrl.startsWith('http')) {
            // Extraire juste le nom du fichier de l'URL
            const filename = media.thumbnailUrl.split('/').pop()?.trim();
            if (filename) {
              // Utiliser le répertoire public du frontend
              media.thumbnailUrl = `/uploads/${filename}`;
            }
          }
          
          // Assurer que le nom affiché est unique en ajoutant un suffixe si nécessaire
          if (!media.name || media.name.trim() === '') {
            media.name = media.filename || 'Sans titre';
          }
          
          return media;
        });
        
        // Vérifier les doublons de noms et ajouter un suffixe si nécessaire
        const nameCount = {};
        mediaWithFixedUrls.forEach(media => {
          if (!nameCount[media.name]) {
            nameCount[media.name] = 0;
          }
          nameCount[media.name]++;
        });
        
        // Ajouter un suffixe aux noms en double
        mediaWithFixedUrls.forEach(media => {
          if (nameCount[media.name] > 1) {
            // Extraire l'extension du nom de fichier original
            const getExtension = (filename) => {
              const lastDotIndex = filename.lastIndexOf('.');
              return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
            };
            
            const ext = media.originalFilename ? getExtension(media.originalFilename) : '';
            const baseName = media.name.replace(ext, '');
            
            // Ajouter un suffixe avec l'ID pour garantir l'unicité
            media.displayName = `${baseName} (${media.id.substring(0, 4)})${ext}`;
          } else {
            media.displayName = media.name;
          }
        });
        
        setMediaList(mediaWithFixedUrls);
        setTotalMedia(response.meta.total);
        
        // Calculer les statistiques
        let imgCount = 0;
        let vidCount = 0;
        let size = 0;
        
        mediaWithFixedUrls.forEach(media => {
          if (media.type === 'image') imgCount++;
          if (media.type === 'video') vidCount++;
          size += media.size;
        });
        
        setImageCount(imgCount);
        setVideoCount(vidCount);
        setTotalSize(size);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      // En cas d'erreur, utiliser des données fictives pour le développement
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = () => {
    // Créer un élément input de type file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = false;
    
    // Gérer la sélection de fichier
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        
        // Commencer l'upload
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          // Créer un FormData pour l'upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('name', file.name);
          formData.append('alt', '');
          formData.append('description', '');
          
          // Configurer l'upload avec suivi de progression
          console.log('Uploading media file');
          
          // Utiliser axios directement pour pouvoir suivre la progression
          const response = await axiosInstance.post('/media', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
          });
          
          console.log('Upload response:', response.data);
          
          // Une seule notification de succès
          toast.success(`Fichier "${file.name}" uploadé avec succès !`, {
            id: `upload-${file.name}` // Identifiant unique pour éviter les doublons
          });
          
          // Attendre un peu plus longtemps avant de rafraîchir la liste
          setTimeout(() => {
            fetchMedia();
          }, 2000);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Erreur lors de l'upload du fichier "${file.name}"`);
        } finally {
          setIsUploading(false);
          setSelectedFile(null);
        }
      }
    };
    
    // Déclencher le clic sur l'input
    input.click();
  };
  
  // Fonction pour supprimer un média
  const handleDeleteMedia = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      try {
        await deleteRequest(`/media/${id}`, {
          showSuccessToast: true,
          successMessage: 'Média supprimé avec succès'
        });
        
        // Rafraîchir la liste des médias
        fetchMedia();
      } catch (error) {
        console.error('Error deleting media:', error);
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papiers');
  };

  const filteredMedia = mediaList.filter(media =>
    media.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
      day: 'numeric'
    });
  };
  
  // Fonction pour tester l'accès à une URL
  const testImageAccess = async (url: string) => {
    try {
      console.log(`Testing image access: ${url}`);
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache' // Éviter les problèmes de cache
      });
      console.log(`Image access test result: ${response.status} ${response.statusText}`);
      return response.ok;
    } catch (error) {
      console.error(`Image access test error: ${error}`);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos images, vidéos et autres fichiers
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                // Tester l'accès aux fichiers
                if (mediaList.length > 0) {
                  const media = mediaList[0];
                  testImageAccess(media.url).then(accessible => {
                    toast[accessible ? 'success' : 'error'](
                      `Test d'accès à l'image: ${accessible ? 'Succès' : 'Échec'}`
                    );
                  });
                } else {
                  toast.error('Aucun média disponible pour le test');
                }
              }}
            >
              Tester l'accès aux fichiers
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                // Tester l'accès aux fichiers publics
                const testUrl = '/uploads/jesus-1753167568534-68601126.webp';
                testImageAccess(testUrl).then(accessible => {
                  toast[accessible ? 'success' : 'error'](
                    `Test d'accès au fichier public: ${accessible ? 'Succès' : 'Échec'}`
                  );
                  
                  if (accessible) {
                    // Ouvrir l'image dans un nouvel onglet
                    window.open(testUrl, '_blank');
                  }
                });
              }}
            >
              Tester fichiers publics
            </Button>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload size="small" primaryColor="#ffffff" />
              <span className="ml-2">Upload Fichiers</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload de fichiers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload size="large" primaryColor="#9ca3af" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Glissez vos fichiers ici
                </h3>
                <p className="mt-2 text-gray-600">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  PNG, JPG, WebP, MP4 jusqu'à 10MB
                </p>
                <Button className="mt-4" onClick={handleUpload}>
                  Sélectionner des fichiers
                </Button>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload en cours{selectedFile ? ` : ${selectedFile.name}` : '...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Fichiers
            </CardTitle>
            <Image size="medium" primaryColor="#8b5cf6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalMedia}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Chargement...' : 'Fichiers disponibles'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Images
            </CardTitle>
            <Image size="medium" primaryColor="#3b82f6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {imageCount}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vidéos
            </CardTitle>
            <Image size="medium" primaryColor="#10b981" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {videoCount}
            </div>
            <p className="text-xs text-muted-foreground">
              MP4, WebM
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stockage
            </CardTitle>
            <Image size="medium" primaryColor="#f59e0b" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              de 10GB utilisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Fichiers disponibles</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search size="small" primaryColor="#6b7280" />
                </div>
                <Input
                  placeholder="Rechercher des fichiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter size="small" primaryColor="#6b7280" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Chargement des médias...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Image size="large" primaryColor="#9ca3af" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun média</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par uploader des fichiers.'}
              </p>
              <div className="mt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload size="small" primaryColor="#ffffff" />
                      <span className="ml-2">Upload Fichiers</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload de fichiers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <Upload size="large" primaryColor="#9ca3af" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          Glissez vos fichiers ici
                        </h3>
                        <p className="mt-2 text-gray-600">
                          ou cliquez pour parcourir vos fichiers
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          PNG, JPG, WebP, MP4 jusqu'à 10MB
                        </p>
                        <Button className="mt-4" onClick={handleUpload}>
                          Sélectionner des fichiers
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredMedia.map((media) => (
                <div key={media.id} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    {media.type === 'image' && (media.thumbnailUrl || media.url) ? (
                      <>
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedMedia(media)}
                            onError={(e) => {
                              // Essayer l'URL principale si la miniature échoue
                              if (media.thumbnailUrl && e.currentTarget.src === media.thumbnailUrl) {
                                e.currentTarget.src = media.url;
                              } else if (media.url.includes('/uploads/')) {
                                // Essayer avec le chemin direct
                                const filename = media.url.split('/').pop();
                                const directUrl = `/uploads/${filename}`;
                                e.currentTarget.src = directUrl;
                              } else {
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
                              }
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size="large" primaryColor="#9ca3af" />
                      </div>
                    )}
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setSelectedMedia(media)}
                      >
                        Voir
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleCopyUrl(media.url)}
                      >
                        📋
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteMedia(media.id)}
                      >
                        <Delete size="small" primaryColor="#ffffff" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium truncate">{media.name}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {media.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(media.size)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMedia.type === 'image' && selectedMedia.url && (
                <>
                  <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                      onError={(e) => {
                        // Essayer avec le chemin direct
                        if (selectedMedia.url.includes('/uploads/')) {
                          const filename = selectedMedia.url.split('/').pop();
                          const directUrl = `/uploads/${filename}`;
                          e.currentTarget.src = directUrl;
                        } else {
                          e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Error';
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">URL: {selectedMedia.url}</p>
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Taille: {formatFileSize(selectedMedia.size)}</p>
                  <p className="text-sm text-gray-600">Uploadé le: {formatDate(selectedMedia.createdAt)}</p>
                  <p className="text-sm text-gray-600">Type: {selectedMedia.mimeType}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCopyUrl(selectedMedia.url)}>
                    📋 <span className="ml-2">Copier l'URL</span>
                  </Button>
                  <Button onClick={() => window.open(selectedMedia.url, '_blank')}>
                    💾 <span className="ml-2">Télécharger</span>
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleDeleteMedia(selectedMedia.id);
                      setSelectedMedia(null);
                    }}
                  >
                    <Delete size="small" primaryColor="#ffffff" />
                    <span className="ml-2">Supprimer</span>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}