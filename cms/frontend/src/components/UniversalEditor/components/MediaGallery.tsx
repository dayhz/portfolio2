/**
 * Composant de galerie pour visualiser et gérer les médias
 */

import { useState, useEffect } from 'react';
import { MediaFile } from '../services/MediaManager';
import { useMediaManager } from '../hooks/useMediaManager';

interface MediaGalleryProps {
  projectId?: string;
  onSelect?: (file: MediaFile) => void;
  selectedFiles?: string[];
  multiSelect?: boolean;
  filterType?: 'image' | 'video' | 'all';
  className?: string;
}

export function MediaGallery({
  projectId,
  onSelect,
  selectedFiles = [],
  // multiSelect = false, // TODO: implement multi-select
  filterType = 'all',
  className = ''
}: MediaGalleryProps) {
  const { getCacheStats, removeFromCache } = useMediaManager(projectId);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState(getCacheStats());

  // Charger les fichiers du projet
  useEffect(() => {
    // En production, on chargerait depuis l'API
    // Pour l'instant, on utilise le cache local
    const allFiles: MediaFile[] = Array.from((window as any).mediaCache?.values() || []);
    const projectFiles = projectId 
      ? allFiles.filter((f) => f.projectId === projectId)
      : allFiles;
    
    const filteredFiles = filterType === 'all' 
      ? projectFiles 
      : projectFiles.filter((f) => f.type === filterType);
    
    setFiles(filteredFiles);
    setStats(getCacheStats());
  }, [projectId, filterType, getCacheStats]);

  const handleDelete = (fileId: string) => {
    if (removeFromCache(fileId)) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setStats(getCacheStats());
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (files.length === 0) {
    return (
      <div className={`media-gallery empty ${className}`}>
        <style>{`
          .media-gallery.empty {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 3rem;
            text-align: center;
            color: #6b7280;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            background: #f9fafb;
          }
          
          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }
          
          .empty-text {
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }
          
          .empty-subtext {
            font-size: 0.9rem;
            opacity: 0.7;
          }
        `}</style>
        
        <div className="empty-icon">📁</div>
        <div className="empty-text">Aucun média trouvé</div>
        <div className="empty-subtext">
          {filterType === 'image' && 'Aucune image dans ce projet'}
          {filterType === 'video' && 'Aucune vidéo dans ce projet'}
          {filterType === 'all' && 'Aucun fichier média dans ce projet'}
        </div>
      </div>
    );
  }

  return (
    <div className={`media-gallery ${className}`}>
      <style>{`
        .media-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .gallery-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .stats-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .media-item {
          position: relative;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        
        .media-item:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .media-item.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .media-preview {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }
        
        .video-preview {
          position: relative;
          background: #000;
        }
        
        .video-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 2rem;
          opacity: 0.8;
        }
        
        .media-info {
          padding: 0.75rem;
        }
        
        .media-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: #1f2937;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .media-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .media-size {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .compressed-badge {
          background: #10b981;
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.625rem;
          font-weight: 500;
        }
        
        .media-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .media-item:hover .media-actions {
          opacity: 1;
        }
        
        .action-button {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          padding: 0.25rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background-color 0.2s ease;
        }
        
        .action-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        
        .action-button.delete:hover {
          background: #dc2626;
        }
        
        .media-date {
          font-size: 0.625rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
      `}</style>

      {/* Statistiques */}
      <div className="gallery-stats">
        <div className="stats-item">
          <span>📊</span>
          <span>{stats.totalFiles} fichiers</span>
        </div>
        <div className="stats-item">
          <span>💾</span>
          <span>{formatFileSize(stats.totalSize)}</span>
        </div>
        <div className="stats-item">
          <span>🖼️</span>
          <span>{stats.imageCount} images</span>
        </div>
        <div className="stats-item">
          <span>🎥</span>
          <span>{stats.videoCount} vidéos</span>
        </div>
        {stats.compressedCount > 0 && (
          <div className="stats-item">
            <span>⚡</span>
            <span>{stats.compressedCount} compressés</span>
          </div>
        )}
      </div>

      {/* Grille des médias */}
      <div className="gallery-grid">
        {files.map((file) => (
          <div
            key={file.id}
            className={`media-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
            onClick={() => onSelect?.(file)}
          >
            {/* Actions */}
            <div className="media-actions">
              <button
                className="action-button delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file.id);
                }}
                title="Supprimer"
              >
                🗑️
              </button>
            </div>

            {/* Aperçu */}
            {file.type === 'image' ? (
              <img
                src={file.url}
                alt={file.file.name}
                className="media-preview"
              />
            ) : (
              <div className="video-preview">
                <video
                  src={file.url}
                  className="media-preview"
                  muted
                />
                <div className="video-overlay">▶️</div>
              </div>
            )}

            {/* Informations */}
            <div className="media-info">
              <div className="media-name" title={file.file.name}>
                {file.file.name}
              </div>
              <div className="media-details">
                <div className="media-size">
                  {formatFileSize(file.size)}
                  {file.compressed && (
                    <span className="compressed-badge">Compressé</span>
                  )}
                </div>
                <div>
                  {file.metadata?.width && file.metadata?.height && (
                    <span>{file.metadata.width}×{file.metadata.height}</span>
                  )}
                </div>
              </div>
              <div className="media-date">
                {formatDate(file.uploadedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}