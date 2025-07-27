/**
 * Composant pour sélectionner un template
 */

import React from 'react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateName: string) => void;
  className?: string;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

// Liste des templates disponibles
const AVAILABLE_TEMPLATES: TemplateOption[] = [
  {
    id: 'poesial',
    name: 'Poesial',
    description: 'Template élégant avec mise en page centrée sur le contenu',
    thumbnail: '/templates/poesial-thumb.jpg'
  },
  {
    id: 'zesty',
    name: 'Zesty',
    description: 'Template moderne avec accents colorés et mise en page dynamique',
    thumbnail: '/templates/zesty-thumb.jpg'
  },
  {
    id: 'nobe',
    name: 'Nobe',
    description: 'Template minimaliste avec beaucoup d\'espace blanc',
    thumbnail: '/templates/nobe-thumb.jpg'
  },
  {
    id: 'ordine',
    name: 'Ordine',
    description: 'Template structuré avec une mise en page en grille',
    thumbnail: '/templates/ordine-thumb.jpg'
  }
];

export function TemplateSelector({ selectedTemplate, onTemplateChange, className = '' }: TemplateSelectorProps) {
  return (
    <div className={`template-selector ${className}`}>
      <style>{`
        .template-selector {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .selector-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .template-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .template-card:hover {
          border-color: #93c5fd;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .template-card.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .template-thumbnail {
          height: 120px;
          background-color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .template-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .template-info {
          padding: 12px;
        }
        
        .template-name {
          font-weight: 600;
          font-size: 14px;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .template-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }
      `}</style>
      
      <h3 className="selector-title">Sélectionner un template</h3>
      
      <div className="templates-grid">
        {AVAILABLE_TEMPLATES.map(template => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="template-thumbnail">
              {template.thumbnail ? (
                <img src={template.thumbnail} alt={template.name} />
              ) : (
                <div className="template-placeholder">{template.name[0]}</div>
              )}
            </div>
            <div className="template-info">
              <div className="template-name">{template.name}</div>
              <div className="template-description">{template.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}