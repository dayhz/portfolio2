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
import axios from 'axios';
import BulkOperationsToolbar from '@/components/media/BulkOperationsToolbar';
import DuplicateManager from '@/components/media/DuplicateManager';
import DuplicateUploadDialog from '@/components/media/DuplicateUploadDialog';
import { DuplicateUploadErrorBoundary } from '@/components/media/DuplicateUploadErrorBoundary';
import DuplicateUploadDebugPanel from '@/components/media/DuplicateUploadDebugPanel';
import { duplicateUploadDebugger } from '@/services/DuplicateUploadDebugger';

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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [bulkDeleteStatus, setBulkDeleteStatus] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  
  // États pour la gestion des doublons à l'upload
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    existingFile: any;
    uploadedFile: any;
    file: File;
  } | null>(null);
  const [isDuplicateProcessing, setIsDuplicateProcessing] = useState(false);
  
  // État pour le panneau de débogage
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  
  const { get, delete: deleteRequest } = useApi();
  
  // Charger les médias au chargement de la page
  useEffect(() => {
    fetchMedia();
  }, []);

  // Cleanup duplicate states on component unmount or when processing gets stuck
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isDuplicateProcessing || isDuplicateDialogOpen || duplicateInfo) {
        console.log('Component unmounting - cleaning up duplicate states');
        cleanupDuplicateStates('unmount');
      }
    };
  }, []);

  // Auto-cleanup if processing state gets stuck (safety mechanism)
  useEffect(() => {
    if (isDuplicateProcessing) {
      const timeoutId = setTimeout(() => {
        console.warn('Duplicate processing timeout - auto-cleanup triggered');
        cleanupDuplicateStates('timeout');
        toast.error('⚠️ Timeout de traitement détecté. L\'opération a été annulée pour éviter le blocage de l\'interface.', {
          duration: 6000
        });
      }, 60000); // 60 seconds timeout

      return () => clearTimeout(timeoutId);
    }
  }, [isDuplicateProcessing]);


  
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
          // Toujours utiliser les URLs relatives pour éviter les problèmes CORS
          if (media.url) {
            // Extraire juste le nom du fichier de l'URL
            const filename = media.url.split('/').pop()?.trim();
            if (filename) {
              // Utiliser le répertoire public du frontend
              media.url = `/uploads/${filename}`;
            }
          }
          
          // Faire de même pour la miniature
          if (media.thumbnailUrl) {
            // Extraire juste le nom du fichier de l'URL
            const filename = media.thumbnailUrl.split('/').pop()?.trim();
            if (filename) {
              // Utiliser le répertoire public du frontend
              media.thumbnailUrl = `/uploads/${filename}`;
              console.log(`URL de miniature corrigée pour ${media.name}: ${media.thumbnailUrl}`);
            }
          } else if (media.type === 'image' && !media.thumbnailUrl) {
            // Si c'est une image sans miniature, essayer de générer une URL de miniature
            if (media.url) {
              const originalFilename = media.url.split('/').pop()?.trim();
              if (originalFilename) {
                const thumbnailFilename = originalFilename.replace(/\.[^/.]+$/, '-thumb.webp');
                media.thumbnailUrl = `/uploads/${thumbnailFilename}`;
                console.log(`URL de miniature générée pour ${media.name}: ${media.thumbnailUrl}`);
              }
            }
          }
          
          // Assurer que le nom affiché est unique en ajoutant un suffixe si nécessaire
          if (!media.name || media.name.trim() === '') {
            media.name = media.filename || 'Sans titre';
          }
          
          return media;
        });
        
        // Vérifier les doublons de noms et ajouter un suffixe si nécessaire
        const nameCount: Record<string, number> = {};
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
            const getExtension = (filename: string) => {
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
    console.log('handleUpload called');
    
    // Créer un élément input de type file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = false;
    input.style.display = 'none';
    
    // Ajouter l'input au DOM pour Safari
    document.body.appendChild(input);
    
    console.log('Input created, setting up onchange handler');
    
    // Gérer la sélection de fichier
    input.onchange = async (e) => {
      console.log('File input changed, files:', (e.target as HTMLInputElement).files);
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        await uploadFile(file);
      }
      
      // Nettoyer l'input du DOM
      document.body.removeChild(input);
    };
    
    // Déclencher le clic sur l'input
    console.log('Triggering input click');
    input.click();
  };

  // Enhanced duplicate data validation with comprehensive error checking
  const validateDuplicateData = (duplicateData: any): boolean => {
    const validationId = `validation-${Date.now()}`;
    
    // Log validation start with debugger
    duplicateUploadDebugger.logValidation(false, {
      stage: 'validation_start',
      validationId,
      duplicateData: duplicateData ? {
        hasExistingFile: !!duplicateData.existingFile,
        hasUploadedFile: !!duplicateData.uploadedFile,
        dataType: typeof duplicateData
      } : null
    });
    
    console.log(`[${validationId}] Starting duplicate data validation`, {
      duplicateData,
      dataType: typeof duplicateData,
      isNull: duplicateData === null,
      isUndefined: duplicateData === undefined,
      timestamp: new Date().toISOString()
    });
    
    // Vérifier la structure de base
    if (!duplicateData || typeof duplicateData !== 'object') {
      const errorDetails = {
        duplicateData,
        type: typeof duplicateData,
        isNull: duplicateData === null,
        isArray: Array.isArray(duplicateData),
        timestamp: new Date().toISOString()
      };
      
      // Log validation error with debugger
      duplicateUploadDebugger.logError({
        type: 'validation_error',
        message: 'Invalid duplicate data structure - not an object',
        context: { validationId, errorDetails },
        severity: 'high'
      });
      
      console.error(`[${validationId}] Invalid duplicate data structure:`, errorDetails);
      return false;
    }
    
    // Vérifier existingFile
    const { existingFile, uploadedFile } = duplicateData;
    
    console.log(`[${validationId}] Validating existingFile:`, {
      existingFile,
      type: typeof existingFile,
      isNull: existingFile === null,
      timestamp: new Date().toISOString()
    });
    
    if (!existingFile || typeof existingFile !== 'object') {
      console.error(`[${validationId}] Missing or invalid existingFile:`, {
        existingFile,
        type: typeof existingFile,
        isNull: existingFile === null,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Vérifier les propriétés requises de existingFile avec validation de type
    const requiredExistingFields = [
      { name: 'id', type: 'string', allowEmpty: false },
      { name: 'name', type: 'string', allowEmpty: true },
      { name: 'originalName', type: 'string', allowEmpty: true },
      { name: 'size', type: 'number', allowEmpty: false },
      { name: 'createdAt', type: 'string', allowEmpty: false },
      { name: 'url', type: 'string', allowEmpty: false }
    ];
    
    for (const field of requiredExistingFields) {
      if (!(field.name in existingFile) || existingFile[field.name] === null || existingFile[field.name] === undefined) {
        console.error(`[${validationId}] Missing required field in existingFile: ${field.name}`, {
          existingFile,
          fieldName: field.name,
          fieldValue: existingFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Type validation
      if (typeof existingFile[field.name] !== field.type) {
        console.error(`[${validationId}] Invalid type for existingFile.${field.name}:`, {
          fieldName: field.name,
          expectedType: field.type,
          actualType: typeof existingFile[field.name],
          value: existingFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Empty string validation for string fields
      if (field.type === 'string' && !field.allowEmpty && existingFile[field.name].trim() === '') {
        console.error(`[${validationId}] Empty string not allowed for existingFile.${field.name}:`, {
          fieldName: field.name,
          value: existingFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Number validation
      if (field.type === 'number' && (existingFile[field.name] < 0 || !Number.isFinite(existingFile[field.name]))) {
        console.error(`[${validationId}] Invalid number value for existingFile.${field.name}:`, {
          fieldName: field.name,
          value: existingFile[field.name],
          isFinite: Number.isFinite(existingFile[field.name]),
          timestamp: new Date().toISOString()
        });
        return false;
      }
    }
    
    // Vérifier uploadedFile
    console.log(`[${validationId}] Validating uploadedFile:`, {
      uploadedFile,
      type: typeof uploadedFile,
      isNull: uploadedFile === null,
      timestamp: new Date().toISOString()
    });
    
    if (!uploadedFile || typeof uploadedFile !== 'object') {
      console.error(`[${validationId}] Missing or invalid uploadedFile:`, {
        uploadedFile,
        type: typeof uploadedFile,
        isNull: uploadedFile === null,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Vérifier les propriétés requises de uploadedFile avec validation de type
    const requiredUploadedFields = [
      { name: 'originalName', type: 'string', allowEmpty: false },
      { name: 'size', type: 'number', allowEmpty: false },
      { name: 'mimetype', type: 'string', allowEmpty: false }
    ];
    
    for (const field of requiredUploadedFields) {
      if (!(field.name in uploadedFile) || uploadedFile[field.name] === null || uploadedFile[field.name] === undefined) {
        console.error(`[${validationId}] Missing required field in uploadedFile: ${field.name}`, {
          uploadedFile,
          fieldName: field.name,
          fieldValue: uploadedFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Type validation
      if (typeof uploadedFile[field.name] !== field.type) {
        console.error(`[${validationId}] Invalid type for uploadedFile.${field.name}:`, {
          fieldName: field.name,
          expectedType: field.type,
          actualType: typeof uploadedFile[field.name],
          value: uploadedFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Empty string validation for string fields
      if (field.type === 'string' && !field.allowEmpty && uploadedFile[field.name].trim() === '') {
        console.error(`[${validationId}] Empty string not allowed for uploadedFile.${field.name}:`, {
          fieldName: field.name,
          value: uploadedFile[field.name],
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      // Number validation
      if (field.type === 'number' && (uploadedFile[field.name] < 0 || !Number.isFinite(uploadedFile[field.name]))) {
        console.error(`[${validationId}] Invalid number value for uploadedFile.${field.name}:`, {
          fieldName: field.name,
          value: uploadedFile[field.name],
          isFinite: Number.isFinite(uploadedFile[field.name]),
          timestamp: new Date().toISOString()
        });
        return false;
      }
    }
    
    // Additional business logic validation
    if (existingFile.size === 0) {
      console.error(`[${validationId}] Existing file has zero size:`, {
        existingFile,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    if (uploadedFile.size === 0) {
      console.error(`[${validationId}] Uploaded file has zero size:`, {
        uploadedFile,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Validate URL format
    try {
      new URL(existingFile.url, window.location.origin);
    } catch (urlError) {
      console.error(`[${validationId}] Invalid URL format in existingFile:`, {
        url: existingFile.url,
        error: urlError,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Validate date format
    const createdAtDate = new Date(existingFile.createdAt);
    if (isNaN(createdAtDate.getTime())) {
      console.error(`[${validationId}] Invalid date format in existingFile.createdAt:`, {
        createdAt: existingFile.createdAt,
        parsedDate: createdAtDate,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    // Log successful validation
    duplicateUploadDebugger.logValidation(true, {
      stage: 'validation_success',
      validationId,
      existingFile: {
        id: existingFile.id,
        name: existingFile.name,
        size: existingFile.size
      },
      uploadedFile: {
        originalName: uploadedFile.originalName,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      }
    });
    
    console.log(`[${validationId}] Validation successful`, {
      existingFile: {
        id: existingFile.id,
        name: existingFile.name,
        size: existingFile.size
      },
      uploadedFile: {
        originalName: uploadedFile.originalName,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      },
      timestamp: new Date().toISOString()
    });
    return true;
  };

  const uploadFile = async (file: File, action?: 'replace' | 'rename') => {
    const uploadId = `upload-${file.name}-${Date.now()}`;
    
    // Log upload start with debugger
    duplicateUploadDebugger.logProcessing('upload_start', {
      uploadId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      action: action || 'new'
    });
    
    console.log(`[UPLOAD_${uploadId}] Starting upload process`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      action: action || 'new',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // Enhanced file validation with comprehensive logging
    if (!file || !(file instanceof File)) {
      const errorDetails = {
        fileObject: file,
        fileType: typeof file,
        isFileInstance: file instanceof File,
        timestamp: new Date().toISOString()
      };
      console.error(`[UPLOAD_${uploadId}] Invalid file object:`, errorDetails);
      toast.error('Fichier invalide - objet fichier non reconnu');
      return;
    }
    
    if (file.size === 0) {
      console.error(`[UPLOAD_${uploadId}] Empty file detected`, {
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified,
        timestamp: new Date().toISOString()
      });
      toast.error('Le fichier est vide');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      console.error(`[UPLOAD_${uploadId}] File too large:`, {
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        limit: '50MB',
        timestamp: new Date().toISOString()
      });
      toast.error('Le fichier est trop volumineux (limite: 50MB)');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/', 'video/'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      console.error(`[UPLOAD_${uploadId}] Invalid file type:`, {
        fileName: file.name,
        fileType: file.type,
        allowedTypes,
        timestamp: new Date().toISOString()
      });
      toast.error(`Type de fichier non supporté: ${file.type}`);
      return;
    }
    
    // Log upload state initialization
    console.log(`[UPLOAD_${uploadId}] Initializing upload states`, {
      previousUploadState: isUploading,
      previousDuplicateDialogState: isDuplicateDialogOpen,
      previousDuplicateInfo: duplicateInfo ? 'present' : 'null',
      timestamp: new Date().toISOString()
    });
    
    // Initialiser les états d'upload
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Réinitialiser les états d'erreur précédents avec logging
    if (duplicateInfo) {
      console.log(`[UPLOAD_${uploadId}] Clearing previous duplicate info:`, {
        previousExistingFile: duplicateInfo.existingFile?.name,
        previousUploadedFile: duplicateInfo.uploadedFile?.originalName,
        timestamp: new Date().toISOString()
      });
    }
    setDuplicateInfo(null);
    setIsDuplicateDialogOpen(false);
    
    try {
      console.log(`[UPLOAD_${uploadId}] Preparing FormData`, {
        formDataFields: {
          file: `${file.name} (${file.size} bytes)`,
          name: file.name,
          alt: '',
          description: '',
          action: action || 'none'
        },
        timestamp: new Date().toISOString()
      });
      
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('alt', '');
      formData.append('description', '');
      
      // Ajouter l'action si spécifiée (pour gérer les doublons)
      if (action) {
        formData.append('action', action);
        console.log(`[UPLOAD_${uploadId}] Action specified: ${action}`, {
          action,
          duplicateHandling: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Enhanced API call logging
      console.log(`[UPLOAD_${uploadId}] Initiating API call`, {
        endpoint: '/media',
        method: 'POST',
        contentType: 'multipart/form-data',
        hasProgressTracking: true,
        timestamp: new Date().toISOString()
      });
      
      const startTime = Date.now();
      
      // Utiliser axios directement pour pouvoir suivre la progression
      const response = await axiosInstance.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const uploadSpeed = progressEvent.loaded / ((Date.now() - startTime) / 1000); // bytes per second
            setUploadProgress(percentCompleted);
            console.log(`[UPLOAD_${uploadId}] Progress: ${percentCompleted}%`, {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              speed: `${(uploadSpeed / 1024).toFixed(2)} KB/s`,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      
      const uploadDuration = Date.now() - startTime;
      console.log(`[UPLOAD_${uploadId}] Upload successful:`, {
        responseData: response.data,
        uploadDuration: `${uploadDuration}ms`,
        responseStatus: response.status,
        responseHeaders: response.headers,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced success message logging and handling
      let successMessage = `Fichier "${file.name}" uploadé avec succès !`;
      let actionPerformed = 'upload';
      
      if (response.data.replaced) {
        // Requirement 3.1: Specific success message for replace action
        const originalFileName = response.data.originalName || file.name;
        successMessage = `🔄 Remplacement réussi ! Le fichier "${originalFileName}" a été remplacé par votre nouvelle version. L'ancien fichier a été définitivement supprimé et remplacé par le nouveau contenu.`;
        actionPerformed = 'replace';
        console.log(`[UPLOAD_${uploadId}] File replaced successfully`, {
          originalFile: file.name,
          replacedFileId: response.data.id,
          originalFileName: originalFileName,
          timestamp: new Date().toISOString()
        });
      } else if (response.data.renamed) {
        // Requirement 3.2: Clear feedback for rename action with new filename
        const newFileName = response.data.originalName || response.data.name || file.name;
        const originalFileName = file.name;
        successMessage = `📝 Fichier renommé avec succès ! Votre fichier "${originalFileName}" a été uploadé sous le nom "${newFileName}" pour éviter les conflits. Les deux versions sont maintenant disponibles dans votre médiathèque.`;
        actionPerformed = 'rename';
        console.log(`[UPLOAD_${uploadId}] File renamed successfully`, {
          originalName: originalFileName,
          newName: newFileName,
          newFileId: response.data.id,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`[UPLOAD_${uploadId}] New file uploaded successfully`, {
          fileName: file.name,
          fileId: response.data.id,
          fileUrl: response.data.url,
          timestamp: new Date().toISOString()
        });
      }
      
      toast.success(successMessage, {
        id: uploadId, // Identifiant unique pour éviter les doublons
        duration: actionPerformed === 'rename' ? 6000 : 4000 // Longer duration for rename messages
      });
      
      // Log state cleanup
      console.log(`[UPLOAD_${uploadId}] Cleaning up UI states`, {
        closingUploadDialog: isUploadDialogOpen,
        actionPerformed,
        timestamp: new Date().toISOString()
      });
      
      // Fermer la boîte de dialogue
      setIsUploadDialogOpen(false);
      
      // Rafraîchir la liste des médias avec enhanced logging
      console.log(`[UPLOAD_${uploadId}] Scheduling media list refresh`, {
        delay: '1000ms',
        reason: 'successful upload',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => {
        console.log(`[UPLOAD_${uploadId}] Executing media list refresh`);
        fetchMedia();
      }, 1000);
      
    } catch (error) {
      const uploadDuration = Date.now() - startTime;
      console.error(`[UPLOAD_${uploadId}] Upload error occurred:`, {
        error,
        uploadDuration: `${uploadDuration}ms`,
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString()
      });
      
      // Gestion spécifique des erreurs de doublon (status 409)
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Log duplicate detection with debugger
        duplicateUploadDebugger.logEvent('detection', {
          uploadId,
          responseStatus: error.response.status,
          responseStatusText: error.response.statusText,
          hasResponseData: !!error.response.data,
          fileName: file.name,
          fileSize: file.size
        });
        
        console.log(`[UPLOAD_${uploadId}] Duplicate detected, processing duplicate data`, {
          responseStatus: error.response.status,
          responseStatusText: error.response.statusText,
          hasResponseData: !!error.response.data,
          timestamp: new Date().toISOString()
        });
        
        const duplicateData = error.response.data;
        console.log(`[UPLOAD_${uploadId}] Raw duplicate data received:`, {
          duplicateData,
          dataType: typeof duplicateData,
          hasExistingFile: !!duplicateData?.existingFile,
          hasUploadedFile: !!duplicateData?.uploadedFile,
          timestamp: new Date().toISOString()
        });
        
        // Enhanced duplicate data validation with detailed logging
        if (!validateDuplicateData(duplicateData)) {
          console.error(`[UPLOAD_${uploadId}] Invalid duplicate data structure, showing generic error`, {
            duplicateData,
            validationFailed: true,
            timestamp: new Date().toISOString()
          });
          toast.error(`❌ Erreur de validation des doublons. Impossible de traiter le fichier "${file.name}" en raison de données invalides du serveur. Veuillez réessayer ou contacter le support technique.`, {
            duration: 8000
          });
          return;
        }
        
        console.log(`[UPLOAD_${uploadId}] Duplicate data validation passed, preparing dialog`, {
          existingFileName: duplicateData.existingFile?.name,
          existingFileSize: duplicateData.existingFile?.size,
          uploadedFileName: duplicateData.uploadedFile?.originalName,
          uploadedFileSize: duplicateData.uploadedFile?.size,
          timestamp: new Date().toISOString()
        });
        
        // Stocker les informations du doublon et ouvrir le dialog
        const duplicateInfoToStore = {
          existingFile: duplicateData.existingFile,
          uploadedFile: duplicateData.uploadedFile,
          file: file
        };
        
        console.log(`[UPLOAD_${uploadId}] Setting duplicate info and opening dialog`, {
          duplicateInfoToStore,
          timestamp: new Date().toISOString()
        });
        
        setDuplicateInfo(duplicateInfoToStore);
        setIsDuplicateDialogOpen(true);
        
        // Log duplicate detection with debugger
        duplicateUploadDebugger.logDuplicateDetection(
          duplicateData.existingFile,
          duplicateData.uploadedFile,
          file
        );
        
        // Provide immediate feedback that duplicate was detected
        toast.info(`⚠️ Fichier en double détecté ! Le fichier "${file.name}" existe déjà. Choisissez une action dans la boîte de dialogue qui s'ouvre.`, {
          duration: 4000
        });
        
        console.log(`[UPLOAD_${uploadId}] Duplicate dialog opened successfully`, {
          dialogState: 'opened',
          duplicateInfoSet: true,
          timestamp: new Date().toISOString()
        });
        // Ne pas afficher d'erreur, le dialog va gérer la situation
        return;
      }
      
      // Enhanced error handling for non-duplicate errors
      console.error(`[UPLOAD_${uploadId}] Non-duplicate error occurred`, {
        errorType: 'non-duplicate',
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = `Erreur lors de l'upload du fichier "${file.name}"`;
      let errorDetails = '';
      let errorContext = {};
      
      if (axios.isAxiosError(error)) {
        errorContext = {
          isAxiosError: true,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout
          },
          timestamp: new Date().toISOString()
        };
        
        console.log(`[UPLOAD_${uploadId}] Detailed Axios error analysis:`, errorContext);
        
        // Enhanced error handling based on status codes
        switch (error.response?.status) {
          case 400:
            errorDetails = 'Fichier invalide ou données manquantes';
            console.log(`[UPLOAD_${uploadId}] Bad request error - likely validation failure`);
            break;
          case 401:
            errorDetails = 'Non autorisé - veuillez vous reconnecter';
            console.log(`[UPLOAD_${uploadId}] Authentication error`);
            break;
          case 403:
            errorDetails = 'Accès interdit - permissions insuffisantes';
            console.log(`[UPLOAD_${uploadId}] Authorization error`);
            break;
          case 413:
            errorDetails = 'Fichier trop volumineux';
            console.log(`[UPLOAD_${uploadId}] File size exceeded server limits`);
            break;
          case 415:
            errorDetails = 'Type de fichier non supporté';
            console.log(`[UPLOAD_${uploadId}] Unsupported media type`);
            break;
          case 422:
            errorDetails = 'Données de fichier invalides';
            console.log(`[UPLOAD_${uploadId}] Unprocessable entity - validation error`);
            break;
          case 429:
            errorDetails = 'Trop de requêtes - veuillez patienter';
            console.log(`[UPLOAD_${uploadId}] Rate limit exceeded`);
            break;
          case 500:
            errorDetails = 'Erreur interne du serveur';
            console.log(`[UPLOAD_${uploadId}] Internal server error`);
            break;
          case 502:
            errorDetails = 'Serveur indisponible';
            console.log(`[UPLOAD_${uploadId}] Bad gateway error`);
            break;
          case 503:
            errorDetails = 'Service temporairement indisponible';
            console.log(`[UPLOAD_${uploadId}] Service unavailable`);
            break;
          case 504:
            errorDetails = 'Timeout du serveur';
            console.log(`[UPLOAD_${uploadId}] Gateway timeout`);
            break;
          default:
            if (error.response?.data?.error) {
              errorDetails = error.response.data.error;
            } else if (error.response?.data?.message) {
              errorDetails = error.response.data.message;
            } else if (error.message) {
              errorDetails = error.message;
            }
            console.log(`[UPLOAD_${uploadId}] Unhandled HTTP status: ${error.response?.status}`);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          errorDetails = 'Erreur de connexion réseau';
          console.log(`[UPLOAD_${uploadId}] Network connectivity issue`);
        } else if (error.code === 'ECONNABORTED') {
          errorDetails = 'Timeout de la requête';
          console.log(`[UPLOAD_${uploadId}] Request timeout`);
        }
        
        if (errorDetails) {
          errorMessage += `: ${errorDetails}`;
        }
      } else if (error instanceof Error) {
        errorContext = {
          isGenericError: true,
          name: error.name,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        console.log(`[UPLOAD_${uploadId}] Generic error details:`, errorContext);
        errorMessage += `: ${error.message}`;
      } else {
        errorContext = {
          isUnknownError: true,
          errorValue: error,
          errorType: typeof error,
          timestamp: new Date().toISOString()
        };
        console.log(`[UPLOAD_${uploadId}] Unknown error type:`, errorContext);
        errorMessage += ': Erreur inconnue';
      }
      
      // Log comprehensive error summary
      console.error(`[UPLOAD_${uploadId}] Upload failed - Error Summary:`, {
        finalErrorMessage: errorMessage,
        errorContext,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        uploadState: {
          progress: uploadProgress,
          isUploading,
          isDuplicateDialogOpen
        },
        timestamp: new Date().toISOString()
      });
      
      toast.error(errorMessage);
      
    } finally {
      const finalUploadDuration = Date.now() - startTime;
      console.log(`[UPLOAD_${uploadId}] Entering cleanup phase`, {
        totalUploadDuration: `${finalUploadDuration}ms`,
        currentStates: {
          isUploading,
          isDuplicateDialogOpen,
          selectedFile: selectedFile?.name,
          duplicateInfo: duplicateInfo ? 'present' : 'null'
        },
        timestamp: new Date().toISOString()
      });
      
      // Enhanced state cleanup with detailed logging
      // Nettoyer les états d'upload seulement si ce n'est pas un doublon
      // (pour les doublons, les états seront nettoyés par les handlers de doublon)
      if (!isDuplicateDialogOpen) {
        console.log(`[UPLOAD_${uploadId}] Cleaning up upload states (no duplicate dialog)`, {
          clearingUploadState: true,
          clearingSelectedFile: true,
          timestamp: new Date().toISOString()
        });
        setIsUploading(false);
        setSelectedFile(null);
      } else {
        console.log(`[UPLOAD_${uploadId}] Skipping state cleanup (duplicate dialog is open)`, {
          duplicateDialogOpen: isDuplicateDialogOpen,
          preservingUploadState: true,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`[UPLOAD_${uploadId}] Upload process completed`, {
        totalDuration: `${finalUploadDuration}ms`,
        finalStates: {
          isUploading: !isDuplicateDialogOpen ? false : isUploading,
          isDuplicateDialogOpen,
          selectedFile: !isDuplicateDialogOpen ? null : selectedFile?.name,
          duplicateInfo: duplicateInfo ? 'present' : 'null'
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  // Enhanced duplicate handlers with comprehensive error handling and logging
  const handleDuplicateReplace = async () => {
    const actionId = `duplicate-replace-${Date.now()}`;
    console.log(`[${actionId}] Starting duplicate replace action`, {
      hasDuplicateInfo: !!duplicateInfo,
      existingFile: duplicateInfo?.existingFile?.name,
      uploadedFile: duplicateInfo?.uploadedFile?.originalName,
      fileToUpload: duplicateInfo?.file?.name,
      timestamp: new Date().toISOString()
    });
    
    if (!duplicateInfo) {
      console.error(`[${actionId}] No duplicate info available for replace action`);
      toast.error('Erreur: Informations de doublon manquantes');
      return;
    }
    
    // Validate duplicate info before processing
    if (!validateDuplicateData(duplicateInfo)) {
      console.error(`[${actionId}] Invalid duplicate info for replace action:`, duplicateInfo);
      toast.error('Erreur: Données de doublon invalides');
      return;
    }
    
    console.log(`[${actionId}] Setting processing state and closing dialog`);
    setIsDuplicateProcessing(true);
    setIsDuplicateDialogOpen(false);
    
    // Immediate feedback for replace action start
    const fileName = duplicateInfo.file?.name || 'le fichier';
    const existingFileName = duplicateInfo.existingFile?.name || 'le fichier existant';
    toast.loading(`🔄 Remplacement en cours... "${existingFileName}" va être remplacé par "${fileName}".`, {
      id: `replace-${actionId}`,
      duration: 10000
    });
    
    try {
      console.log(`[${actionId}] Initiating replace upload`);
      await uploadFile(duplicateInfo.file, 'replace');
      console.log(`[${actionId}] Replace upload completed successfully`);
    } catch (error) {
      console.error(`[${actionId}] Replace upload failed:`, error);
      // Enhanced error feedback for replace action
      const fileName = duplicateInfo.file?.name || 'le fichier';
      const existingFileName = duplicateInfo.existingFile?.name || 'le fichier existant';
      toast.error(`❌ Échec du remplacement. Impossible de remplacer "${existingFileName}" par "${fileName}". ${error instanceof Error ? error.message : 'Erreur inconnue'}. Le fichier original reste inchangé. Veuillez réessayer.`, {
        duration: 7000
      });
    } finally {
      console.log(`[${actionId}] Cleaning up duplicate replace states`);
      cleanupDuplicateStates(actionId);
    }
  };

  const handleDuplicateRename = async () => {
    const actionId = `duplicate-rename-${Date.now()}`;
    console.log(`[${actionId}] Starting duplicate rename action`, {
      hasDuplicateInfo: !!duplicateInfo,
      existingFile: duplicateInfo?.existingFile?.name,
      uploadedFile: duplicateInfo?.uploadedFile?.originalName,
      fileToUpload: duplicateInfo?.file?.name,
      timestamp: new Date().toISOString()
    });
    
    if (!duplicateInfo) {
      console.error(`[${actionId}] No duplicate info available for rename action`);
      toast.error('Erreur: Informations de doublon manquantes');
      return;
    }
    
    // Validate duplicate info before processing
    if (!validateDuplicateData(duplicateInfo)) {
      console.error(`[${actionId}] Invalid duplicate info for rename action:`, duplicateInfo);
      toast.error('Erreur: Données de doublon invalides');
      return;
    }
    
    console.log(`[${actionId}] Setting processing state and closing dialog`);
    setIsDuplicateProcessing(true);
    setIsDuplicateDialogOpen(false);
    
    // Immediate feedback for rename action start
    const fileName = duplicateInfo.file?.name || 'le fichier';
    toast.loading(`📝 Renommage en cours... "${fileName}" va être uploadé avec un nouveau nom pour éviter les conflits.`, {
      id: `rename-${actionId}`,
      duration: 10000
    });
    
    try {
      console.log(`[${actionId}] Initiating rename upload`);
      await uploadFile(duplicateInfo.file, 'rename');
      console.log(`[${actionId}] Rename upload completed successfully`);
    } catch (error) {
      console.error(`[${actionId}] Rename upload failed:`, error);
      // Enhanced error feedback for rename action
      const fileName = duplicateInfo.file?.name || 'le fichier';
      toast.error(`❌ Échec du renommage. Impossible d'uploader "${fileName}" avec un nouveau nom. ${error instanceof Error ? error.message : 'Erreur inconnue'}. Aucun fichier n'a été modifié. Veuillez réessayer.`, {
        duration: 7000
      });
    } finally {
      console.log(`[${actionId}] Cleaning up duplicate rename states`);
      cleanupDuplicateStates(actionId);
    }
  };

  const handleDuplicateCancel = () => {
    const actionId = `duplicate-cancel-${Date.now()}`;
    console.log(`[${actionId}] Starting duplicate cancel action`, {
      hasDuplicateInfo: !!duplicateInfo,
      existingFile: duplicateInfo?.existingFile?.name,
      uploadedFile: duplicateInfo?.uploadedFile?.originalName,
      fileToUpload: duplicateInfo?.file?.name,
      currentStates: {
        isDuplicateDialogOpen,
        isUploading,
        selectedFile: selectedFile?.name,
        isDuplicateProcessing
      },
      timestamp: new Date().toISOString()
    });
    
    // Prevent cancellation during processing to avoid inconsistent state
    if (isDuplicateProcessing) {
      console.log(`[${actionId}] Cancel blocked - processing in progress`);
      toast.warning('⏳ Traitement en cours. Veuillez patienter avant d\'annuler l\'opération.', {
        duration: 3000
      });
      return;
    }
    
    // Get filename for better feedback message
    const fileName = duplicateInfo?.file?.name || selectedFile?.name || 'le fichier';
    
    console.log(`[${actionId}] Cleaning up all duplicate-related states`);
    cleanupDuplicateStates(actionId);
    
    console.log(`[${actionId}] Duplicate cancel completed`);
    
    // Requirement 3.3: Improved cancellation confirmation message
    toast.info(`❌ Upload annulé avec succès. Le fichier "${fileName}" n'a pas été uploadé et aucune modification n'a été apportée à votre médiathèque. Le fichier existant reste intact et disponible.`, {
      duration: 5000
    });
  };

  // Enhanced function to handle dialog close attempts during processing
  const handleDuplicateDialogClose = () => {
    if (isDuplicateProcessing) {
      console.log('Dialog close blocked - processing in progress');
      toast.warning('⏳ Traitement en cours. Veuillez patienter avant de fermer cette fenêtre.', {
        duration: 3000
      });
      return;
    }
    
    // If not processing, allow normal cancel behavior
    handleDuplicateCancel();
  };

  // Comprehensive cleanup function for duplicate upload states
  const cleanupDuplicateStates = (actionId?: string) => {
    console.log(`[${actionId || 'cleanup'}] Performing comprehensive duplicate state cleanup`, {
      currentStates: {
        isDuplicateProcessing,
        isDuplicateDialogOpen,
        isUploading,
        hasDuplicateInfo: !!duplicateInfo,
        hasSelectedFile: !!selectedFile,
        uploadProgress
      },
      timestamp: new Date().toISOString()
    });
    
    // Reset all duplicate-related states in proper order
    setIsDuplicateProcessing(false);
    setIsDuplicateDialogOpen(false);
    setDuplicateInfo(null);
    setIsUploading(false);
    setSelectedFile(null);
    setUploadProgress(0);
    
    // Dismiss any pending toasts related to duplicate processing
    if (actionId) {
      toast.dismiss(`replace-${actionId}`);
      toast.dismiss(`rename-${actionId}`);
    }
    
    console.log(`[${actionId || 'cleanup'}] Duplicate state cleanup completed`);
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

  // Fonction pour basculer la sélection d'un média
  const toggleMediaSelection = (id: string) => {
    const newSelection = new Set(selectedMediaIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMediaIds(newSelection);
  };

  // Fonction pour sélectionner tous les médias
  const selectAllMedia = () => {
    const allIds = new Set(filteredMedia.map(media => media.id));
    setSelectedMediaIds(allIds);
  };

  // Fonction pour désélectionner tous les médias
  const deselectAllMedia = () => {
    setSelectedMediaIds(new Set());
  };

  // Fonction pour supprimer les médias sélectionnés
  const handleBulkDelete = async () => {
    if (selectedMediaIds.size === 0) {
      toast.error('Aucun média sélectionné');
      return;
    }

    if (bulkOperationInProgress) {
      toast.error('Une opération en masse est déjà en cours');
      return;
    }

    // Capturer la liste des IDs sélectionnés au moment du clic pour éviter le bug "par vagues"
    const selectedIds = Array.from(selectedMediaIds);
    const totalCount = selectedIds.length;

    // Confirmation avec le nombre exact de médias sélectionnés
    const confirmMessage = `⚠️ CONFIRMATION DE SUPPRESSION

Vous êtes sur le point de supprimer définitivement ${totalCount} média${totalCount > 1 ? 's' : ''} sélectionné${totalCount > 1 ? 's' : ''}.

Cette action est IRRÉVERSIBLE et supprimera :
• ${totalCount} fichier${totalCount > 1 ? 's' : ''} du serveur
• Toutes les références à ces médias

Êtes-vous absolument certain de vouloir continuer ?`;
    
    if (confirm(confirmMessage)) {
      setBulkOperationInProgress(true);
      setBulkDeleteProgress(0);
      setProcessedCount(0);
      setTotalToProcess(totalCount);
      setBulkDeleteStatus(`Préparation de la suppression de ${totalCount} média(s)...`);
      
      try {
        console.log(`Suppression en masse de ${totalCount} médias sélectionnés avec les IDs:`, selectedIds);
        
        // Simuler une progression initiale
        setBulkDeleteProgress(10);
        setBulkDeleteStatus(`Suppression de ${totalCount} média(s) en cours...`);
        
        const response = await axiosInstance.delete('/media/bulk/delete', {
          data: { ids: selectedIds },
          onDownloadProgress: (progressEvent) => {
            // Simuler une progression basée sur la réponse
            const progress = Math.min(90, 10 + (progressEvent.loaded / (progressEvent.total || progressEvent.loaded)) * 80);
            setBulkDeleteProgress(progress);
          }
        });

        const result = response.data;
        
        // Finaliser la progression
        setBulkDeleteProgress(100);
        setProcessedCount(result.deleted);
        setBulkDeleteStatus(`Suppression terminée: ${result.deleted}/${totalCount} média(s) traité(s)`);
        
        if (result.errors && result.errors.length > 0) {
          // Afficher les erreurs détaillées
          const errorDetails = result.errors.slice(0, 3).join('\n');
          const moreErrors = result.errors.length > 3 ? `\n... et ${result.errors.length - 3} autres erreurs` : '';
          
          toast.error(
            `${result.deleted}/${totalCount} médias supprimés avec succès.\n${result.errors.length} erreur(s) rencontrée(s):\n${errorDetails}${moreErrors}`,
            { duration: 8000 }
          );
          console.error('Bulk delete errors:', result.errors);
        } else {
          toast.success(`${result.deleted}/${totalCount} média(s) supprimé(s) avec succès`);
        }

        // Réinitialiser la sélection et le mode sélection
        setSelectedMediaIds(new Set());
        setIsSelectionMode(false);
        
        // Rafraîchir la liste des médias
        fetchMedia();
      } catch (error) {
        console.error('Error in bulk delete:', error);
        setBulkDeleteStatus('Erreur lors de la suppression');
        
        // Afficher une erreur détaillée
        let errorMessage = 'Erreur lors de la suppression en masse';
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
        
        toast.error(errorMessage, { duration: 6000 });
      } finally {
        // Réinitialiser les états de progression après un délai
        setTimeout(() => {
          setBulkOperationInProgress(false);
          setBulkDeleteProgress(0);
          setBulkDeleteStatus('');
          setProcessedCount(0);
          setTotalToProcess(0);
        }, 2000);
      }
    }
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A ou Cmd+A pour sélectionner tout en mode sélection
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && isSelectionMode) {
        event.preventDefault();
        selectAllMedia();
      }
      
      // Escape pour sortir du mode sélection
      if (event.key === 'Escape' && isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedMediaIds(new Set());
      }
      
      // Delete pour supprimer la sélection
      if (event.key === 'Delete' && isSelectionMode && selectedMediaIds.size > 0) {
        handleBulkDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectionMode, selectedMediaIds, handleBulkDelete, selectAllMedia]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papiers');
  };
  
  // Fonction pour ouvrir l'image dans un nouvel onglet
  const handleOpenImage = (url: string) => {
    window.open(url, '_blank');
  };
  
  // Fonction pour régénérer les miniatures
  const regenerateThumbnails = async () => {
    try {
      toast.info('Régénération des miniatures en cours...');
      
      const { default: axiosInstance } = await import('@/utils/axiosConfig');
      const response = await axiosInstance.post('/media/regenerate-thumbnails');
      const data = response.data;
      
      toast.success(`Miniatures régénérées: ${data.success}/${data.total}`);
      console.log('Résultats de la régénération des miniatures:', data);
      
      // Synchroniser les fichiers
      await axiosInstance.post('/media/sync');
      
      // Rafraîchir la liste des médias
      fetchMedia();
    } catch (error) {
      console.error('Error regenerating thumbnails:', error);
      toast.error('Erreur lors de la régénération des miniatures');
    }
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
          <div className="flex flex-wrap gap-2 mt-2">
            <DuplicateManager onDuplicatesDeleted={fetchMedia} />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  // Utiliser axios pour exécuter le script de synchronisation
                  const { default: axiosInstance } = await import('@/utils/axiosConfig');
                  await axiosInstance.post('/media/sync');
                  toast.success('Synchronisation des fichiers réussie');
                  // Rafraîchir la liste des médias
                  fetchMedia();
                } catch (error) {
                  console.error('Error syncing files:', error);
                  toast.error('Erreur lors de la synchronisation des fichiers');
                }
              }}
            >
              Synchroniser
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={regenerateThumbnails}
            >
              Régénérer miniatures
            </Button>
            
            {/* Bouton de débogage pour les uploads de doublons */}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDebugPanelOpen(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                🔍 Debug Doublons
              </Button>
            )}
            
            {/* Bouton de suppression totale - dangereux, à utiliser avec précaution */}
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="destructive" 
                size="sm"
                disabled={bulkOperationInProgress}
                onClick={async () => {
                  if (mediaList.length === 0) {
                    toast.error('Aucun média à supprimer');
                    return;
                  }

                  if (bulkOperationInProgress) {
                    toast.error('Une opération en masse est déjà en cours');
                    return;
                  }
                  
                  // Capturer la liste complète des IDs au moment du clic pour éviter le bug "par vagues"
                  const allMediaIds = mediaList.map(media => media.id);
                  const totalCount = allMediaIds.length;
                  
                  const confirmMessage = `⚠️ DANGER ⚠️\n\nÊtes-vous sûr de vouloir supprimer TOUS les ${totalCount} médias ?\n\nCette action est IRRÉVERSIBLE et supprimera définitivement tous vos fichiers !`;
                  
                  if (confirm(confirmMessage)) {
                    setBulkOperationInProgress(true);
                    setBulkDeleteProgress(0);
                    setProcessedCount(0);
                    setTotalToProcess(totalCount);
                    setBulkDeleteStatus(`Préparation de la suppression de ${totalCount} média(s)...`);
                    
                    try {
                      console.log(`Suppression en masse de ${totalCount} médias avec les IDs:`, allMediaIds);
                      
                      // Simuler une progression initiale
                      setBulkDeleteProgress(10);
                      setBulkDeleteStatus(`Suppression de ${totalCount} média(s) en cours...`);
                      
                      const response = await axiosInstance.delete('/media/bulk/delete', {
                        data: { ids: allMediaIds },
                        onDownloadProgress: (progressEvent) => {
                          // Simuler une progression basée sur la réponse
                          const progress = Math.min(90, 10 + (progressEvent.loaded / (progressEvent.total || progressEvent.loaded)) * 80);
                          setBulkDeleteProgress(progress);
                        }
                      });

                      const result = response.data;
                      
                      // Finaliser la progression
                      setBulkDeleteProgress(100);
                      setProcessedCount(result.deleted);
                      setBulkDeleteStatus(`Suppression terminée: ${result.deleted}/${totalCount} média(s) traité(s)`);
                      
                      if (result.errors && result.errors.length > 0) {
                        // Afficher les erreurs détaillées
                        const errorDetails = result.errors.slice(0, 3).join('\n');
                        const moreErrors = result.errors.length > 3 ? `\n... et ${result.errors.length - 3} autres erreurs` : '';
                        
                        toast.error(
                          `${result.deleted}/${totalCount} médias supprimés avec succès.\n${result.errors.length} erreur(s) rencontrée(s):\n${errorDetails}${moreErrors}`,
                          { duration: 8000 }
                        );
                        console.error('Bulk delete errors:', result.errors);
                      } else {
                        toast.success(`${result.deleted}/${totalCount} média(s) supprimé(s) avec succès`);
                      }
                      
                      // Rafraîchir la liste des médias
                      fetchMedia();
                    } catch (error) {
                      console.error('Error in bulk delete:', error);
                      setBulkDeleteStatus('Erreur lors de la suppression');
                      
                      // Afficher une erreur détaillée
                      let errorMessage = 'Erreur lors de la suppression en masse';
                      if (error instanceof Error) {
                        errorMessage += `: ${error.message}`;
                      }
                      if (axios.isAxiosError(error) && error.response?.data?.error) {
                        errorMessage += ` - ${error.response.data.error}`;
                      }
                      
                      toast.error(errorMessage, { duration: 6000 });
                    } finally {
                      // Réinitialiser les états de progression après un délai
                      setTimeout(() => {
                        setBulkOperationInProgress(false);
                        setBulkDeleteProgress(0);
                        setBulkDeleteStatus('');
                        setProcessedCount(0);
                        setTotalToProcess(0);
                      }, 2000);
                    }
                  }
                }}
              >
                {bulkOperationInProgress ? '⏳ Suppression...' : '🗑️ Tout supprimer (DEV)'}
              </Button>
            )}
          </div>
          
          {/* Outils de développement - uniquement en mode dev */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                🔧 Outils de développement
              </summary>
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                <Button 
                  variant="outline" 
                  size="sm"
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
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      // Vérifier les miniatures
                      const { default: axiosInstance } = await import('@/utils/axiosConfig');
                      const response = await axiosInstance.get('/media/check-thumbnails');
                      const data = response.data;
                      
                      toast.success(`Vérification des miniatures: ${data.total - data.missing}/${data.total} trouvées`);
                      console.log('Résultats de la vérification des miniatures:', data);
                      
                      if (data.missing > 0) {
                        toast.error(`${data.missing} miniatures manquantes`);
                        
                        if (confirm(`${data.missing} miniatures sont manquantes. Voulez-vous les régénérer ?`)) {
                          await regenerateThumbnails();
                        }
                      }
                    } catch (error) {
                      console.error('Error checking thumbnails:', error);
                      toast.error('Erreur lors de la vérification des miniatures');
                    }
                  }}
                >
                  Vérifier les miniatures
                </Button>
              </div>
            </details>
          )}
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
          
          {/* Indicateur de mode sélection */}
          {isSelectionMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-900">Mode sélection activé</span>
                </div>
                <div className="text-xs text-blue-700">
                  Cliquez sur les médias pour les sélectionner • Ctrl+A pour tout sélectionner • Échap pour quitter
                </div>
              </div>
            </div>
          )}

          {/* Barre d'outils de sélection */}
          {filteredMedia.length > 0 && (
            <BulkOperationsToolbar
              selectedCount={selectedMediaIds.size}
              totalCount={filteredMedia.length}
              onSelectAll={selectAllMedia}
              onDeselectAll={deselectAllMedia}
              onBulkDelete={handleBulkDelete}
              onToggleSelectionMode={() => {
                setIsSelectionMode(!isSelectionMode);
                if (!isSelectionMode) {
                  setSelectedMediaIds(new Set());
                }
              }}
              isSelectionMode={isSelectionMode}
              bulkOperationInProgress={bulkOperationInProgress}
            />
          )}
        </CardHeader>
        <CardContent>
          {/* Barre de progression pour les opérations en masse */}
          {bulkOperationInProgress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">Opération en cours</h3>
                <span className="text-sm text-blue-700">
                  {processedCount > 0 ? `${processedCount}/${totalToProcess}` : `${Math.round(bulkDeleteProgress)}%`}
                </span>
              </div>
              <Progress value={bulkDeleteProgress} className="mb-2" />
              <p className="text-sm text-blue-700">{bulkDeleteStatus}</p>
            </div>
          )}
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
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
                  {/* Case à cocher de sélection - visible uniquement en mode sélection */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-20 bg-white rounded-full p-1 shadow-md">
                      <input
                        type="checkbox"
                        checked={selectedMediaIds.has(media.id)}
                        onChange={() => toggleMediaSelection(media.id)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        aria-label={`Sélectionner ${media.name}`}
                      />
                    </div>
                  )}
                  
                  {/* Indicateur de sélection visuel */}
                  {isSelectionMode && selectedMediaIds.has(media.id) && (
                    <div className="absolute top-2 right-2 z-20 bg-blue-500 text-white rounded-full p-1 shadow-md">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    isSelectionMode && selectedMediaIds.has(media.id) 
                      ? 'ring-4 ring-blue-500 ring-opacity-50 border-blue-500 bg-blue-50' 
                      : isSelectionMode
                        ? 'border-gray-200 hover:border-blue-300'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    {media.type === 'image' && media.url ? (
                      <>
                        <div className="w-full h-full flex items-center justify-center relative">
                          <img
                            src={media.url}
                            alt={media.name}
                            className={`w-full h-full object-cover transition-all duration-200 cursor-pointer ${
                              isSelectionMode 
                                ? selectedMediaIds.has(media.id)
                                  ? 'scale-95 opacity-90'
                                  : 'hover:scale-102 hover:opacity-95'
                                : 'group-hover:scale-105'
                            }`}
                            onClick={() => {
                              if (isSelectionMode) {
                                toggleMediaSelection(media.id);
                              } else {
                                setSelectedMedia(media);
                              }
                            }}
                            onLoad={() => {
                              console.log(`Image chargée avec succès: ${media.name}`);
                            }}
                            onError={(e) => {
                              console.log(`Erreur de chargement d'image: ${e.currentTarget.src}`);
                              
                              // Essayer avec le chemin direct
                              if (media.url.includes('/uploads/')) {
                                const filename = media.url.split('/').pop();
                                if (filename) {
                                  const directUrl = `/uploads/${filename}`;
                                  console.log(`Tentative avec chemin direct: ${directUrl}`);
                                  e.currentTarget.src = directUrl;
                                } else {
                                  e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
                                }
                              } else {
                                console.log(`Utilisation de l'image de placeholder`);
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
                              }
                            }}
                          />
                          
                          {/* Overlay de sélection en mode sélection */}
                          {isSelectionMode && (
                            <div 
                              className={`absolute inset-0 transition-all duration-200 cursor-pointer ${
                                selectedMediaIds.has(media.id)
                                  ? 'bg-blue-500/20'
                                  : 'hover:bg-blue-500/10'
                              }`}
                              onClick={() => toggleMediaSelection(media.id)}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div 
                        className={`w-full h-full flex items-center justify-center cursor-pointer relative ${
                          isSelectionMode && selectedMediaIds.has(media.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleMediaSelection(media.id);
                          } else {
                            setSelectedMedia(media);
                          }
                        }}
                      >
                        <Image size="large" primaryColor={
                          isSelectionMode && selectedMediaIds.has(media.id) ? "#3b82f6" : "#9ca3af"
                        } />
                        
                        {/* Overlay de sélection pour les non-images */}
                        {isSelectionMode && (
                          <div 
                            className={`absolute inset-0 transition-all duration-200 cursor-pointer ${
                              selectedMediaIds.has(media.id)
                                ? 'bg-blue-500/20'
                                : 'hover:bg-blue-500/10'
                            }`}
                            onClick={() => toggleMediaSelection(media.id)}
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Overlay with actions - masqué en mode sélection */}
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(media);
                          }}
                          className="text-xs"
                        >
                          Voir
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(media.url);
                          }}
                          className="text-xs"
                        >
                          📋
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(media.id);
                          }}
                          className="text-xs"
                        >
                          <Delete size="small" primaryColor="#ffffff" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className={`text-sm font-medium truncate ${
                      isSelectionMode && selectedMediaIds.has(media.id) ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {media.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={isSelectionMode && selectedMediaIds.has(media.id) ? "default" : "secondary"} 
                          className="text-xs"
                        >
                          {media.type}
                        </Badge>
                        {media.thumbnailUrl && (
                          <Badge 
                            variant={isSelectionMode && selectedMediaIds.has(media.id) ? "default" : "outline"} 
                            className="text-xs"
                          >
                            Miniature
                          </Badge>
                        )}
                      </div>
                      <span className={`text-xs ${
                        isSelectionMode && selectedMediaIds.has(media.id) ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {formatFileSize(media.size)}
                      </span>
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
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Image</h3>
                    <p className="text-xs text-gray-600 mb-1">URL: {selectedMedia.url}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCopyUrl(selectedMedia.url)}
                    >
                      📋 Copier l'URL
                    </Button>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Taille: {formatFileSize(selectedMedia.size)}</p>
                  <p className="text-sm text-gray-600">Uploadé le: {formatDate(selectedMedia.createdAt)}</p>
                  <p className="text-sm text-gray-600">Type: {selectedMedia.mimeType}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleOpenImage(selectedMedia.url)}>
                    💾 <span className="ml-2">Voir en taille réelle</span>
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

      {/* Dialog de gestion des doublons à l'upload */}
      {duplicateInfo && (
        <DuplicateUploadErrorBoundary
          isOpen={isDuplicateDialogOpen}
          onClose={handleDuplicateDialogClose}
          onError={(error, errorInfo) => {
            console.error('DuplicateUploadDialog error:', error);
            console.error('Error info:', errorInfo);
            toast.error('Erreur lors de l\'affichage de la boîte de dialogue de doublons');
          }}
        >
          <DuplicateUploadDialog
            isOpen={isDuplicateDialogOpen}
            onClose={handleDuplicateDialogClose}
            existingFile={duplicateInfo.existingFile}
            uploadedFile={duplicateInfo.uploadedFile}
            onReplace={handleDuplicateReplace}
            onRename={handleDuplicateRename}
            onCancel={handleDuplicateCancel}
            isProcessing={isDuplicateProcessing}
          />
        </DuplicateUploadErrorBoundary>
      )}

      {/* Panneau de débogage pour les uploads de doublons */}
      <DuplicateUploadDebugPanel
        isVisible={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
      />
    </div>
  );
}