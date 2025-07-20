/**
 * Composant d'indicateur de statut de sauvegarde
 */

// React import removed - not needed in this component
import { SaveStatus } from '../services/AutoSaveManager';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  className?: string;
  showText?: boolean;
  compact?: boolean;
}

export function SaveStatusIndicator({ 
  status, 
  className = '', 
  showText = true,
  compact = false 
}: SaveStatusIndicatorProps) {
  const getStatusInfo = () => {
    switch (status.status) {
      case 'saving':
        return {
          icon: '💾',
          text: 'Sauvegarde...',
          color: '#3b82f6',
          bgColor: '#eff6ff',
          pulse: true
        };
      case 'saved':
        return {
          icon: '✅',
          text: status.lastSaved 
            ? `Sauvegardé à ${status.lastSaved.toLocaleTimeString()}`
            : 'Sauvegardé',
          color: '#10b981',
          bgColor: '#ecfdf5',
          pulse: false
        };
      case 'error':
        return {
          icon: '❌',
          text: status.error || 'Erreur de sauvegarde',
          color: '#dc2626',
          bgColor: '#fef2f2',
          pulse: false
        };
      case 'offline':
        return {
          icon: '📡',
          text: 'Hors ligne',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          pulse: false
        };
      default:
        if (status.pendingChanges) {
          return {
            icon: '⏳',
            text: 'Modifications non sauvegardées',
            color: '#f59e0b',
            bgColor: '#fffbeb',
            pulse: false
          };
        }
        return {
          icon: '💾',
          text: 'Prêt',
          color: '#6b7280',
          bgColor: '#f9fafb',
          pulse: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (compact) {
    return (
      <div 
        className={`save-status-compact ${className}`}
        title={statusInfo.text}
      >
        <style>{`
          .save-status-compact {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            font-size: 12px;
            transition: all 0.2s ease;
          }
          
          .save-status-compact.pulse {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        
        <span 
          className={statusInfo.pulse ? 'pulse' : ''}
          style={{ 
            color: statusInfo.color,
            backgroundColor: statusInfo.bgColor 
          }}
        >
          {statusInfo.icon}
        </span>
      </div>
    );
  }

  return (
    <div className={`save-status ${className}`}>
      <style>{`
        .save-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .save-status-icon {
          font-size: 16px;
          transition: transform 0.2s ease;
        }
        
        .save-status-icon.pulse {
          animation: pulse 2s infinite;
        }
        
        .save-status-text {
          white-space: nowrap;
        }
        
        .save-status.clickable {
          cursor: pointer;
        }
        
        .save-status.clickable:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        .error-details {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          padding: 8px;
          font-size: 12px;
          color: #dc2626;
          z-index: 10;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <span 
        className={`save-status-icon ${statusInfo.pulse ? 'pulse' : ''}`}
        style={{ color: statusInfo.color }}
      >
        {statusInfo.icon}
      </span>
      
      {showText && (
        <span 
          className="save-status-text"
          style={{ color: statusInfo.color }}
        >
          {statusInfo.text}
        </span>
      )}

      <div
        style={{
          backgroundColor: statusInfo.bgColor,
          borderColor: statusInfo.color + '20',
          color: statusInfo.color
        }}
      />
    </div>
  );
}