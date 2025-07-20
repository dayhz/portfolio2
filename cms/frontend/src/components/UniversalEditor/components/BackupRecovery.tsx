/**
 * Composant de récupération de sauvegarde automatique
 */

import { useState, useEffect } from 'react';
import { SaveData } from '../services/AutoSaveManager';

interface BackupRecoveryProps {
  backup: SaveData | null;
  onRestore: (backup: SaveData) => void;
  onDismiss: () => void;
  className?: string;
}

export function BackupRecovery({ 
  backup, 
  onRestore, 
  onDismiss, 
  className = '' 
}: BackupRecoveryProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (backup) {
      setIsVisible(true);
    }
  }, [backup]);

  if (!backup || !isVisible) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  const getContentPreview = (content: string, maxLength = 100) => {
    // Supprimer les balises HTML pour l'aperçu
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  const handleRestore = () => {
    onRestore(backup);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setIsVisible(false);
  };

  return (
    <div className={`backup-recovery ${className}`}>
      <style>{`
        .backup-recovery {
          position: fixed;
          top: 20px;
          right: 20px;
          max-width: 400px;
          background: white;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .backup-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fffbeb;
          border-radius: 10px 10px 0 0;
          border-bottom: 1px solid #fed7aa;
        }
        
        .backup-icon {
          font-size: 24px;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .backup-title {
          font-size: 16px;
          font-weight: 600;
          color: #92400e;
          margin: 0;
        }
        
        .backup-subtitle {
          font-size: 12px;
          color: #d97706;
          margin: 2px 0 0 0;
        }
        
        .backup-content {
          padding: 16px;
        }
        
        .backup-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .backup-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        
        .backup-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .backup-value {
          color: #374151;
          font-weight: 600;
        }
        
        .backup-preview {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          margin: 12px 0;
        }
        
        .backup-preview-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 6px;
        }
        
        .backup-preview-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.4;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        }
        
        .backup-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .backup-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .backup-button.primary {
          background: #f59e0b;
          color: white;
        }
        
        .backup-button.primary:hover {
          background: #d97706;
          transform: translateY(-1px);
        }
        
        .backup-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        
        .backup-button.secondary:hover {
          background: #e5e7eb;
        }
        
        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>

      <button className="close-button" onClick={handleDismiss}>
        ×
      </button>

      <div className="backup-header">
        <div className="backup-icon">💾</div>
        <div>
          <h3 className="backup-title">Sauvegarde trouvée</h3>
          <p className="backup-subtitle">Une version non sauvegardée a été trouvée</p>
        </div>
      </div>

      <div className="backup-content">
        <div className="backup-info">
          <div className="backup-detail">
            <span className="backup-label">Date :</span>
            <span className="backup-value">{formatDate(backup.timestamp)}</span>
          </div>
          <div className="backup-detail">
            <span className="backup-label">Version :</span>
            <span className="backup-value">#{backup.version}</span>
          </div>
        </div>

        <div className="backup-preview">
          <div className="backup-preview-label">Aperçu du contenu :</div>
          <div className="backup-preview-content">
            {getContentPreview(backup.content)}
          </div>
        </div>

        <div className="backup-actions">
          <button 
            className="backup-button secondary"
            onClick={handleDismiss}
          >
            Ignorer
          </button>
          <button 
            className="backup-button primary"
            onClick={handleRestore}
          >
            Restaurer
          </button>
        </div>
      </div>
    </div>
  );
}