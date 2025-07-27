import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'react-iconly';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string | File) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  directUpload?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  placeholder = "Glissez une image ici ou cliquez pour parcourir",
  directUpload = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      uploadFile(imageFile);
    }
  }, [disabled, onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  }, [onChange]);
  
  const uploadFile = async (file: File) => {
    try {
      // Si directUpload est true, retourner directement le fichier
      if (directUpload) {
        onChange(file);
        return;
      }
      
      // Créer une URL temporaire pour l'aperçu immédiat
      const tempUrl = URL.createObjectURL(file);
      onChange(tempUrl);
      
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', '');
      
      // Importer axiosInstance dynamiquement pour éviter les problèmes de dépendances circulaires
      const { default: axiosInstance } = await import('@/utils/axiosConfig');
      
      // Envoyer le fichier au serveur avec axios qui inclut automatiquement le token
      const response = await axiosInstance.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Mettre à jour l'URL avec celle retournée par le serveur
      onChange(response.data.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      // En cas d'erreur, supprimer l'image
      onRemove();
      // Afficher une alerte
      alert('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
    }
  };

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
          <img
            src={value}
            alt="Upload"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
            >
              ✕ Supprimer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors",
        isDragOver && "border-blue-500 bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {isDragOver ? (
            <Upload size="large" primaryColor="#3b82f6" />
          ) : (
            <ImageIcon size="large" primaryColor="#9ca3af" />
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
        <p className="text-xs text-gray-500">PNG, JPG, WebP jusqu'à 10MB</p>
      </div>
    </div>
  );
}