import React, { useState, useEffect } from 'react';
import HelpTooltip from './HelpTooltip';
import { useNotifications } from './NotificationSystem';
import '../styles/animations.css';

export interface InlineGuideProps {
  projectId: string;
  disableGuides?: boolean;
}

interface GuideState {
  [key: string]: boolean;
}

export const InlineGuides: React.FC<InlineGuideProps> = ({
  projectId,
  disableGuides = false
}) => {
  const [guidesShown, setGuidesShown] = useState<GuideState>({});
  const [guidesHidden, setGuidesHidden] = useState<GuideState>({});
  const { addNotification } = useNotifications();

  // Charger l'état des guides depuis le localStorage
  useEffect(() => {
    if (disableGuides) return;
    
    try {
      const storedHiddenGuides = localStorage.getItem(`universal-editor-inline-guides-hidden-${projectId}`);
      if (storedHiddenGuides) {
        setGuidesHidden(JSON.parse(storedHiddenGuides));
      }
      
      const storedShownGuides = localStorage.getItem(`universal-editor-inline-guides-shown-${projectId}`);
      if (storedShownGuides) {
        setGuidesShown(JSON.parse(storedShownGuides));
      }
    } catch (error) {
      console.error('Error loading guides state:', error);
    }
  }, [projectId, disableGuides]);

  // Sauvegarder l'état des guides dans le localStorage
  useEffect(() => {
    if (Object.keys(guidesHidden).length > 0) {
      try {
        localStorage.setItem(`universal-editor-inline-guides-hidden-${projectId}`, JSON.stringify(guidesHidden));
      } catch (error) {
        console.error('Error saving hidden guides state:', error);
      }
    }
  }, [guidesHidden, projectId]);

  useEffect(() => {
    if (Object.keys(guidesShown).length > 0) {
      try {
        localStorage.setItem(`universal-editor-inline-guides-shown-${projectId}`, JSON.stringify(guidesShown));
      } catch (error) {
        console.error('Error saving shown guides state:', error);
      }
    }
  }, [guidesShown, projectId]);

  // Vérifier si un guide est masqué
  const isGuideHidden = (guideId: string): boolean => {
    return !!guidesHidden[guideId];
  };

  // Vérifier si un guide a déjà été montré
  const hasGuideBeenShown = (guideId: string): boolean => {
    return !!guidesShown[guideId];
  };

  // Marquer un guide comme montré
  const markGuideAsShown = (guideId: string) => {
    setGuidesShown(prev => ({
      ...prev,
      [guideId]: true
    }));
  };

  // Masquer un guide
  const hideGuide = (guideId: string) => {
    setGuidesHidden(prev => ({
      ...prev,
      [guideId]: true
    }));
  };

  // Réinitialiser tous les guides
  const resetAllGuides = () => {
    setGuidesHidden({});
    setGuidesShown({});
    localStorage.removeItem(`universal-editor-inline-guides-hidden-${projectId}`);
    localStorage.removeItem(`universal-editor-inline-guides-shown-${projectId}`);
  };

  // Composant pour un guide inline
  const InlineGuide: React.FC<{
    id: string;
    targetSelector: string;
    title: string;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    showOnce?: boolean;
    showAfterDelay?: number;
    showOnHover?: boolean;
    showOnClick?: boolean;
    maxWidth?: number;
  }> = ({
    id,
    targetSelector,
    title,
    content,
    position = 'bottom',
    showOnce = true,
    showAfterDelay,
    showOnHover = false,
    showOnClick = false,
    maxWidth = 300
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [targetElement, setTargetElement] = useState<Element | null>(null);

    useEffect(() => {
      if (disableGuides || isGuideHidden(id)) return;

      // Trouver l'élément cible
      const element = document.querySelector(targetSelector);
      if (element) {
        setTargetElement(element);

        // Si le guide doit être affiché après un délai
        if (showAfterDelay && !hasGuideBeenShown(id)) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            markGuideAsShown(id);
          }, showAfterDelay);

          return () => clearTimeout(timer);
        }
      }
    }, [id, targetSelector, showAfterDelay]);

    // Gérer les événements pour showOnHover et showOnClick
    useEffect(() => {
      if (!targetElement || disableGuides || isGuideHidden(id)) return;

      const handleMouseEnter = () => {
        if (showOnHover && !isVisible) {
          setIsVisible(true);
          if (showOnce) {
            markGuideAsShown(id);
          }
        }
      };

      const handleClick = () => {
        if (showOnClick && !isVisible) {
          setIsVisible(true);
          if (showOnce) {
            markGuideAsShown(id);
          }
        }
      };

      if (showOnHover) {
        targetElement.addEventListener('mouseenter', handleMouseEnter);
      }

      if (showOnClick) {
        targetElement.addEventListener('click', handleClick);
      }

      return () => {
        if (showOnHover) {
          targetElement.removeEventListener('mouseenter', handleMouseEnter);
        }
        if (showOnClick) {
          targetElement.removeEventListener('click', handleClick);
        }
      };
    }, [targetElement, id, showOnHover, showOnClick, isVisible]);

    // Ne rien rendre si le guide est masqué ou si l'élément cible n'existe pas
    if (disableGuides || isGuideHidden(id) || !targetElement) {
      return null;
    }

    // Si le guide a déjà été montré et doit être montré une seule fois
    if (showOnce && hasGuideBeenShown(id) && !isVisible) {
      return null;
    }

    // Contenu du guide avec bouton pour le masquer
    const guideContent = (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}>{title}</div>
        <div style={{ marginBottom: '12px' }}>{content}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
          <button
            onClick={() => hideGuide(id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '4px 8px'
            }}
          >
            Ne plus afficher
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: '#3498db',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '4px 12px'
            }}
          >
            Compris
          </button>
        </div>
      </div>
    );

    // Rendre le guide avec HelpTooltip
    return (
      <div className="inline-guide" style={{ position: 'absolute', zIndex: 1 }}>
        <HelpTooltip
          content={guideContent}
          position={position}
          maxWidth={maxWidth}
          interactive={true}
          showArrow={true}
          className="animate-scale-in"
          onClose={() => setIsVisible(false)}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}></div>
        </HelpTooltip>
      </div>
    );
  };

  // Composant pour un guide de type notification
  const NotificationGuide: React.FC<{
    id: string;
    title: string;
    message: React.ReactNode;
    showAfterDelay?: number;
    showOnce?: boolean;
  }> = ({
    id,
    title,
    message,
    showAfterDelay = 2000,
    showOnce = true
  }) => {
    useEffect(() => {
      if (disableGuides || isGuideHidden(id)) return;
      if (showOnce && hasGuideBeenShown(id)) return;

      const timer = setTimeout(() => {
        addNotification({
          type: 'tip',
          title,
          message,
          duration: 10000,
          dismissible: true,
          action: {
            label: 'Ne plus afficher',
            onClick: () => hideGuide(id)
          }
        });
        
        if (showOnce) {
          markGuideAsShown(id);
        }
      }, showAfterDelay);

      return () => clearTimeout(timer);
    }, [id, title, message, showAfterDelay, showOnce]);

    return null;
  };

  // Définition des guides inline
  return (
    <>
      {/* Guide pour le menu de blocs */}
      <InlineGuide
        id="slash-command"
        targetSelector=".editor-content"
        title="Astuce : Commande slash"
        content="Appuyez sur '/' pour ouvrir rapidement le menu de blocs et ajouter du contenu."
        position="top"
        showAfterDelay={5000}
        showOnce={true}
      />

      {/* Guide pour la sélection de blocs */}
      <InlineGuide
        id="block-selection"
        targetSelector=".editable-block"
        title="Sélection de blocs"
        content="Cliquez sur un bloc pour le sélectionner et afficher ses options d'édition."
        position="right"
        showOnHover={true}
        showOnce={true}
      />

      {/* Guide pour la barre d'outils dynamique */}
      <InlineGuide
        id="dynamic-toolbar"
        targetSelector=".dynamic-toolbar"
        title="Barre d'outils contextuelle"
        content="Cette barre propose des options spécifiques au bloc sélectionné."
        position="bottom"
        showOnHover={true}
        showOnce={true}
      />

      {/* Guide pour l'upload d'images */}
      <InlineGuide
        id="image-upload"
        targetSelector=".media-upload-zone"
        title="Upload d'images"
        content="Cliquez ici ou glissez-déposez une image pour l'ajouter à votre contenu."
        position="bottom"
        showOnHover={true}
        showOnce={true}
      />

      {/* Guide pour la prévisualisation */}
      <InlineGuide
        id="preview-button"
        targetSelector=".preview-button"
        title="Prévisualisation"
        content="Cliquez ici pour voir comment votre contenu apparaîtra sur votre site."
        position="bottom"
        showOnHover={true}
        showOnce={true}
      />

      {/* Guide pour l'historique des versions */}
      <InlineGuide
        id="version-history"
        targetSelector=".version-history-button"
        title="Historique des versions"
        content="Accédez à l'historique complet de vos modifications et restaurez des versions précédentes si nécessaire."
        position="bottom"
        showOnHover={true}
        showOnce={true}
      />

      {/* Guide pour les raccourcis clavier */}
      <NotificationGuide
        id="keyboard-shortcuts-tip"
        title="Astuce : Raccourcis clavier"
        message={
          <div>
            Utilisez les raccourcis clavier pour travailler plus efficacement :
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>/ : Ouvrir le menu de blocs</li>
              <li>Ctrl+S : Sauvegarder</li>
              <li>Alt+↑/↓ : Déplacer un bloc</li>
              <li>F1 : Afficher l'aide</li>
            </ul>
          </div>
        }
        showAfterDelay={30000}
        showOnce={true}
      />

      {/* Guide pour la sauvegarde automatique */}
      <NotificationGuide
        id="autosave-tip"
        title="Sauvegarde automatique"
        message="L'éditeur sauvegarde automatiquement votre travail. L'indicateur en haut de l'écran montre le statut de sauvegarde."
        showAfterDelay={15000}
        showOnce={true}
      />
    </>
  );
};

export default InlineGuides;