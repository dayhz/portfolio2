/**
 * Composant pour afficher et gérer l'historique des versions
 */

import React, { useState } from 'react';
import { Version } from '../services/VersionHistoryManager';

interface VersionHistoryPanelProps {
  versions: Version[];
  currentVersionIndex: number;
  onRestoreVersion: (versionId: string) => void;
  onLabelVersion: (versionId: string, label: string) => void;
  onClose: () => void;
}

export function VersionHistoryPanel({
  versions,
  currentVersionIndex,
  onRestoreVersion,
  onLabelVersion,
  onClose
}: VersionHistoryPanelProps) {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  
  // Formater la date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Commencer l'édition d'un label
  const startEditingLabel = (version: Version) => {
    setEditingLabelId(version.id);
    setNewLabel(version.label || '');
  };
  
  // Sauvegarder le label
  const saveLabel = (versionId: string) => {
    if (newLabel.trim()) {
      onLabelVersion(versionId, newLabel.trim());
    }
    setEditingLabelId(null);
  };
  
  // Annuler l'édition du label
  const cancelEditLabel = () => {
    setEditingLabelId(null);
  };
  
  return (
    <div className="version-history-panel">
      <style>{`
        .version-history-panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          background: white;
          border-left: 1px solid #e5e7eb;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          z-index: 50;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .panel-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .close-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .versions-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        
        .version-item {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border: 1px solid #e5e7eb;
        }
        
        .version-item:hover {
          background-color: #f9fafb;
        }
        
        .version-item.current {
          background-color: #eff6ff;
          border-color: #93c5fd;
        }
        
        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .version-label {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        
        .version-actions {
          display: flex;
          gap: 4px;
        }
        
        .version-action {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          font-size: 12px;
          transition: background-color 0.2s ease;
        }
        
        .version-action:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        
        .version-timestamp {
          font-size: 12px;
          color: #6b7280;
        }
        
        .version-type {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 6px;
        }
        
        .version-type.auto {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        
        .version-type.manual {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .label-editor {
          display: flex;
          margin-top: 4px;
          gap: 4px;
        }
        
        .label-input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .label-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .label-button.cancel {
          background: #e5e7eb;
          color: #374151;
        }
        
        .panel-footer {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
        }
        
        .version-count {
          font-size: 12px;
          color: #6b7280;
        }
        
        .empty-message {
          padding: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      `}</style>
      
      <div className="panel-header">
        <h3 className="panel-title">Historique des versions</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="versions-list">
        {versions.length === 0 ? (
          <div className="empty-message">
            Aucune version disponible
          </div>
        ) : (
          versions.map((version, index) => (
            <div 
              key={version.id}
              className={`version-item ${index === currentVersionIndex ? 'current' : ''}`}
              onClick={() => onRestoreVersion(version.id)}
            >
              <div className="version-header">
                <div className="version-label">
                  {version.label || `Version ${versions.length - index}`}
                </div>
                <div className="version-actions">
                  <button 
                    className="version-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingLabel(version);
                    }}
                    title="Renommer"
                  >
                    ✏️
                  </button>
                </div>
              </div>
              
              <div className="version-timestamp">
                {formatDate(version.timestamp)}
                <span className={`version-type ${version.isAutoSave ? 'auto' : 'manual'}`}>
                  {version.isAutoSave ? 'Auto' : 'Manuel'}
                </span>
              </div>
              
              {editingLabelId === version.id && (
                <div className="label-editor">
                  <input
                    type="text"
                    className="label-input"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <button 
                    className="label-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveLabel(version.id);
                    }}
                  >
                    OK
                  </button>
                  <button 
                    className="label-button cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEditLabel();
                    }}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="panel-footer">
        <div className="version-count">
          {versions.length} version{versions.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}