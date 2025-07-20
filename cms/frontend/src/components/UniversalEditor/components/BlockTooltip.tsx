/**
 * Composant de tooltip détaillé pour les blocs
 */

// React import removed - not needed in this component
import { BlockType } from '../types';
import { BlockPreview } from './BlockPreview';

interface BlockTooltipProps {
  block: BlockType;
  isVisible: boolean;
  position: { x: number; y: number };
}

export function BlockTooltip({ block, isVisible, position }: BlockTooltipProps) {
  if (!isVisible) return null;

  const getDetailedDescription = () => {
    switch (block.id) {
      case 'image-full':
        return {
          description: 'Image qui s\'étend sur toute la largeur disponible, idéale pour les visuels d\'impact.',
          features: ['Pleine largeur', 'Haute résolution', 'Responsive'],
          usage: 'Parfait pour les images de héros ou les visuels principaux'
        };
      
      case 'image-16-9':
        return {
          description: 'Image avec un ratio 16:9 fixe, garantit une présentation uniforme.',
          features: ['Ratio fixe 16:9', 'Recadrage automatique', 'Cohérence visuelle'],
          usage: 'Idéal pour les galeries et présentations uniformes'
        };
      
      case 'image-grid':
        return {
          description: 'Grille de 2 images côte à côte, parfaite pour les comparaisons.',
          features: ['2 colonnes', 'Upload multiple', 'Réorganisation'],
          usage: 'Comparaisons, avant/après, variations'
        };
      
      case 'rich-text':
        return {
          description: 'Bloc de texte avec formatage avancé (titres, listes, liens, etc.).',
          features: ['Formatage riche', 'Titres H1-H3', 'Listes et liens'],
          usage: 'Articles, descriptions détaillées, contenu éditorial'
        };
      
      case 'simple-text':
        return {
          description: 'Texte simple sans formatage, idéal pour les descriptions courtes.',
          features: ['Texte brut', 'Mise en forme simple', 'Léger'],
          usage: 'Descriptions, légendes, textes courts'
        };
      
      case 'testimony':
        return {
          description: 'Citation avec informations sur l\'auteur et photo de profil.',
          features: ['Citation', 'Photo de profil', 'Nom et rôle'],
          usage: 'Témoignages clients, avis, recommandations'
        };
      
      case 'video':
        return {
          description: 'Lecteur vidéo intégré avec contrôles de lecture.',
          features: ['Lecture intégrée', 'Contrôles', 'Responsive'],
          usage: 'Démonstrations, présentations, contenu vidéo'
        };
      
      case 'heading-1':
        return {
          description: 'Titre principal de niveau 1, le plus important de la page.',
          features: ['Grande taille', 'Poids fort', 'SEO optimisé'],
          usage: 'Titre principal de page, titre de projet'
        };
      
      case 'heading-2':
        return {
          description: 'Titre de section de niveau 2, structure le contenu.',
          features: ['Taille moyenne', 'Hiérarchie claire', 'Navigation'],
          usage: 'Titres de sections, chapitres, parties'
        };
      
      case 'heading-3':
        return {
          description: 'Sous-titre de niveau 3, organise les sous-sections.',
          features: ['Taille réduite', 'Sous-sections', 'Organisation'],
          usage: 'Sous-titres, détails, subdivisions'
        };
      
      case 'about-section':
        return {
          description: 'Section spécialisée avec informations projet (client, année, etc.).',
          features: ['Layout 2 colonnes', 'Métadonnées', 'Informations projet'],
          usage: 'Pages projet, études de cas, portfolios'
        };
      
      default:
        return {
          description: block.description,
          features: ['Fonctionnalité de base'],
          usage: 'Usage général'
        };
    }
  };

  const details = getDetailedDescription();

  return (
    <div
      className="block-tooltip"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <style>{`
        .block-tooltip {
          position: fixed;
          z-index: 1000;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 16px;
          max-width: 320px;
          animation: tooltipFadeIn 0.2s ease-out;
          pointer-events: none;
        }
        
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .tooltip-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .tooltip-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        
        .tooltip-category {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        
        .tooltip-preview {
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
        }
        
        .tooltip-description {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .tooltip-features {
          margin-bottom: 12px;
        }
        
        .tooltip-features-title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .tooltip-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .tooltip-feature-tag {
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .tooltip-usage {
          border-top: 1px solid #f3f4f6;
          padding-top: 8px;
        }
        
        .tooltip-usage-title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .tooltip-usage-text {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }
        
        .tooltip-arrow {
          position: absolute;
          top: -6px;
          left: 20px;
          width: 12px;
          height: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-bottom: none;
          border-right: none;
          transform: rotate(45deg);
        }
      `}</style>

      <div className="tooltip-arrow"></div>
      
      <div className="tooltip-header">
        <div className="tooltip-icon">{block.icon}</div>
        <div>
          <h4 className="tooltip-title">{block.name}</h4>
          <div className="tooltip-category">{block.category}</div>
        </div>
      </div>

      <div className="tooltip-preview">
        <BlockPreview block={block} />
      </div>

      <div className="tooltip-description">
        {details.description}
      </div>

      <div className="tooltip-features">
        <div className="tooltip-features-title">Fonctionnalités</div>
        <div className="tooltip-features-list">
          {details.features.map((feature, index) => (
            <span key={index} className="tooltip-feature-tag">
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className="tooltip-usage">
        <div className="tooltip-usage-title">Usage recommandé</div>
        <div className="tooltip-usage-text">{details.usage}</div>
      </div>
    </div>
  );
}