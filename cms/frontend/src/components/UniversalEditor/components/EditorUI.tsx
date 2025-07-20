/**
 * Composant pour l'interface utilisateur améliorée de l'éditeur universel
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './EditorTheme';
import { NotificationProvider } from './NotificationSystem';
import { ContextualHelp } from './ContextualHelp';
import { InlineGuides } from './InlineGuides';
import '../styles/index.css';
import '../styles/animations.css';
import '../styles/theme.css';

export interface EditorUIProps {
  children: React.ReactNode;
  projectId: string;
  showHelp?: boolean;
  disableAnimations?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Composant qui enveloppe l'éditeur avec une interface utilisateur améliorée
 */
export const EditorUI: React.FC<EditorUIProps> = ({
  children,
  projectId,
  showHelp = true,
  disableAnimations = false,
  className = '',
  style = {}
}) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Marquer le premier chargement comme terminé après un délai
  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        setIsFirstLoad(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className={`universal-editor-ui ${className}`} style={style}>
          {children}
          
          {showHelp && (
            <>
              <ContextualHelp 
                projectId={projectId} 
                disableAllGuides={isFirstLoad || disableAnimations}
              />
              <InlineGuides 
                projectId={projectId} 
                disableGuides={isFirstLoad || disableAnimations}
              />
            </>
          )}
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};

/**
 * Composant pour la barre d'outils principale améliorée
 */
export interface EditorToolbarProps {
  children?: React.ReactNode;
  leftItems?: React.ReactNode;
  rightItems?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  children,
  leftItems,
  rightItems,
  className = '',
  style = {}
}) => {
  return (
    <div className={`editor-toolbar ${className}`} style={style}>
      {leftItems && (
        <div className="editor-toolbar-group">
          {leftItems}
        </div>
      )}
      
      {children && (
        <div className="editor-toolbar-group">
          {children}
        </div>
      )}
      
      {rightItems && (
        <div className="editor-toolbar-group">
          {rightItems}
        </div>
      )}
    </div>
  );
};

/**
 * Composant pour les boutons de la barre d'outils
 */
export interface ToolbarButtonProps {
  icon?: React.ReactNode;
  label?: string;
  title?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  title,
  onClick,
  active = false,
  disabled = false,
  className = '',
  style = {}
}) => {
  return (
    <button
      className={`editor-toolbar-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={style}
    >
      {icon}
      {label && <span className="ml-1 d-none d-sm-inline">{label}</span>}
    </button>
  );
};

/**
 * Composant pour le séparateur de la barre d'outils
 */
export const ToolbarSeparator: React.FC = () => {
  return <div className="editor-toolbar-separator" />;
};

/**
 * Composant pour le conteneur principal de l'éditeur
 */
export interface EditorContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`editor-container ${className}`} style={style}>
      {children}
    </div>
  );
};

/**
 * Composant pour la zone d'édition
 */
export interface EditorContentAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorContentArea: React.FC<EditorContentAreaProps> = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`editor-content ${className}`} style={style}>
      {children}
    </div>
  );
};

/**
 * Composant pour les guides d'aide
 */
export interface HelpGuidesProps {
  projectId: string;
  disableGuides?: boolean;
}

export const HelpGuides: React.FC<HelpGuidesProps> = ({
  projectId,
  disableGuides = false
}) => {
  return (
    <>
      <ContextualHelp 
        projectId={projectId} 
        disableAllGuides={disableGuides}
      />
      <InlineGuides 
        projectId={projectId} 
        disableGuides={disableGuides}
      />
    </>
  );
};

export default {
  EditorUI,
  EditorToolbar,
  ToolbarButton,
  ToolbarSeparator,
  EditorContainer,
  EditorContentArea,
  HelpGuides
};