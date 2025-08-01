import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  File, 
  Check, 
  X, 
  Loader2,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import axiosInstance from '@/utils/axiosConfig';

// Media types for validation
export type MediaType = 'image' | 'video' | 'document' | 'logo' | 'avatar' | 'projectImage' | 'any';

// Media file interface
interface MediaFile {
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

interface MediaResponse {
  data: MediaFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaFile) => void;
  allowedTypes?: MediaType[];
  maxFileSize?: number; // in bytes
  title?: string;
  description?: string;
  multiple?: boolean;
  selectedMedia?: MediaFile[];
  onMultipleSelect?: (media: MediaFile[]) => void;
}

interface MediaValidationConfig {
  allowedTypes: string[];
  maxFileSize: number;
  allowedExtensions: string[];
  description: string;
}

// Media type configurations for validation
const MEDIA_TYPE_CONFIGS: Record<MediaType, MediaValidationConfig> = {
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    description: 'Images (JPG, PNG, WebP, GIF, SVG) - Max 10MB'
  },
  video: {
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedExtensions: ['.mp4', '.webm', '.mov'],
    description: 'Vidéos (MP4, WebM, MOV) - Max 100MB'
  },
  document: {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    description: 'Documents (PDF, DOC, DOCX) - Max 25MB'
  },
  logo: {
    allowedTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedExtensions: ['.svg', '.png', '.jpg', '.jpeg', '.webp'],
    description: 'Logos (SVG, PNG, JPG, WebP) - Max 2MB - SVG recommandé'
  },
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    description: 'Avatars (JPG, PNG, WebP) - Max 5MB - Format carré recommandé'
  },
  projectImage: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    description: 'Images de projet (JPG, PNG, WebP, GIF) - Max 15MB'
  },
  any: {
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedExtensions: [],
    description: 'Tous types de médias - Max 50MB'
  }
};

export function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['any'],
  maxFileSize,
  title = 'Sélectionner un média',
  description = 'Choisissez un fichier existant ou uploadez un nouveau média',
  multiple = false,
  selectedMedia = [],
  onMultipleSelect
}: MediaSelectorProps) {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const { get } = useApi();

  // Initialize selected items
  useEffect(() => {
    if (multiple && selectedMedia.length > 0) {
      setSelectedItems(new Set(selectedMedia.map(media => media.id)));
    }
  }, [multiple, selectedMedia]);

  // Fetch media on component mount and when page changes
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, currentPage]);

  // Filter media when search term or filter type changes
  useEffect(() => {
    filterMedia();
  }, [mediaList, searchTerm, filterType, allowedTypes]);

  // Get validation config for allowed types
  const getValidationConfig = (): MediaValidationConfig => {
    if (allowedTypes.length === 1 && allowedTypes[0] !== 'any') {
      const config = MEDIA_TYPE_CONFIGS[allowedTypes[0]];
      if (config) {
        return config;
      }
    }
    
    // Merge configs for multiple types
    const mergedConfig: MediaValidationConfig = {
      allowedTypes: [],
      maxFileSize: maxFileSize || 50 * 1024 * 1024,
      allowedExtensions: [],
      description: 'Médias autorisés'
    };
    
    allowedTypes.forEach(type => {
      const config = MEDIA_TYPE_CONFIGS[type];
      if (config) {
        mergedConfig.allowedTypes.push(...config.allowedTypes);
        mergedConfig.allowedExtensions.push(...config.allowedExtensions);
      }
    });
    
    return mergedConfig;
  };

  const validationConfig = getValidationConfig();

  // Fetch media from API
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await get<MediaResponse>(`/media?page=${currentPage}&limit=50`);
      if (response) {
        setMediaList(response.data);
        setTotalPages(response.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter media based on search and type
  const filterMedia = () => {
    let filtered = mediaList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(media =>
        media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (media.alt && media.alt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(media => media.type === filterType);
    }

    // Filter by allowed types
    if (!allowedTypes.includes('any')) {
      filtered = filtered.filter(media => {
        return validationConfig.allowedTypes.some(allowedType => {
          if (allowedType.endsWith('/*')) {
            return media.mimeType.startsWith(allowedType.replace('/*', '/'));
          }
          return media.mimeType === allowedType;
        });
      });
    }

    setFilteredMedia(filtered);
  };

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > validationConfig.maxFileSize) {
      return `Le fichier est trop volumineux. Taille maximum: ${(validationConfig.maxFileSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Check file type
    if (!allowedTypes.includes('any')) {
      const isValidType = validationConfig.allowedTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          return file.type.startsWith(allowedType.replace('/*', '/'));
        }
        return file.type === allowedType;
      });

      if (!isValidType) {
        return `Type de fichier non autorisé. Types acceptés: ${validationConfig.description}`;
      }
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('alt', '');
      formData.append('description', '');

      const response = await axiosInstance.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      toast.success(`Fichier "${file.name}" uploadé avec succès !`);
      
      // Refresh media list
      await fetchMedia();
      
      // Auto-select the uploaded file if not in multiple mode
      if (!multiple && response.data) {
        onSelect(response.data);
        onClose();
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      if (error.response?.status === 409) {
        toast.error('Un fichier avec ce nom existe déjà');
      } else {
        toast.error('Erreur lors de l\'upload du fichier');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaFile) => {
    if (multiple) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(media.id)) {
        newSelected.delete(media.id);
      } else {
        newSelected.add(media.id);
      }
      setSelectedItems(newSelected);
    } else {
      onSelect(media);
      onClose();
    }
  };

  // Handle multiple selection confirmation
  const handleMultipleConfirm = () => {
    if (onMultipleSelect) {
      const selectedMediaFiles = mediaList.filter(media => selectedItems.has(media.id));
      onMultipleSelect(selectedMediaFiles);
    }
    onClose();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Parcourir les médias</TabsTrigger>
            <TabsTrigger value="upload">Uploader un nouveau fichier</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un média..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value="image">Images</option>
                  <option value="video">Vidéos</option>
                  <option value="document">Documents</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Media Grid/List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Chargement des médias...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun média trouvé</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterType !== 'all' 
                      ? 'Aucun média ne correspond aux critères de recherche'
                      : 'Commencez par uploader votre premier média'
                    }
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                  : 'space-y-2'
                }>
                  {filteredMedia.map((media) => (
                    <div
                      key={media.id}
                      className={`
                        cursor-pointer border rounded-lg transition-all duration-200 hover:shadow-md
                        ${selectedItems.has(media.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-gray-300'}
                        ${viewMode === 'grid' ? 'p-3' : 'p-4 flex items-center gap-4'}
                      `}
                      onClick={() => handleMediaSelect(media)}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Grid View */}
                          <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                            {media.type === 'image' && media.thumbnailUrl ? (
                              <img
                                src={media.thumbnailUrl}
                                alt={media.alt || media.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = media.url;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {getMediaTypeIcon(media.type)}
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium truncate" title={media.name}>
                              {media.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {media.type}
                              </Badge>
                              {multiple && selectedItems.has(media.id) && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(media.size)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {media.type === 'image' && media.thumbnailUrl ? (
                              <img
                                src={media.thumbnailUrl}
                                alt={media.alt || media.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = media.url;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {getMediaTypeIcon(media.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{media.name}</p>
                            <p className="text-sm text-gray-500 truncate">{media.originalName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {media.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(media.size)}
                              </span>
                            </div>
                          </div>
                          {multiple && selectedItems.has(media.id) && (
                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col space-y-4">
            {/* Upload Area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-gray-400'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploading) {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = validationConfig.allowedTypes.join(',');
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFileUpload(files);
                  };
                  input.click();
                }
              }}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Upload en cours...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-sm text-gray-500">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Glissez-déposez un fichier ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500">
                      {validationConfig.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conseils d'optimisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                {allowedTypes.includes('image') && (
                  <p>• Les images seront automatiquement optimisées en WebP pour de meilleures performances</p>
                )}
                {allowedTypes.includes('logo') && (
                  <p>• Privilégiez le format SVG pour les logos pour une qualité parfaite à toutes les tailles</p>
                )}
                {allowedTypes.includes('avatar') && (
                  <p>• Les avatars fonctionnent mieux avec un format carré (1:1)</p>
                )}
                <p>• Les fichiers volumineux seront compressés automatiquement</p>
                <p>• Des miniatures seront générées pour un chargement plus rapide</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {multiple && (
            <Button 
              onClick={handleMultipleConfirm}
              disabled={selectedItems.size === 0}
            >
              Sélectionner ({selectedItems.size})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}