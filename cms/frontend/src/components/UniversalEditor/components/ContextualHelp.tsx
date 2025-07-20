import React, { useState, useEffect } from 'react';
import InteractiveGuide, { GuideStep } from './InteractiveGuide';
import HelpTooltip from './HelpTooltip';
import { useNotifications } from './NotificationSystem';

// Types de guides disponibles
export type GuideType = 
  | 'welcome' 
  | 'block-menu' 
  | 'editing-blocks' 
  | 'media-upload' 
  | 'version-history'
  | 'export-preview'
  | 'responsive-editing'
  | 'keyboard-shortcuts';

// Interface pour le stockage des guides vus
interface GuidesViewed {
  [key: string]: boolean;
}

// Props du composant
export interface ContextualHelpProps {
  projectId: string;
  onGuideComplete?: (guideType: GuideType) => void;
  disableAllGuides?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  projectId,
  onGuideComplete,
  disableAllGuides = false
}) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  const [guidesViewed, setGuidesViewed] = useState<GuidesViewed>({});
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { addNotification } = useNotifications();

  // Charger les guides déjà vus depuis le localStorage
  useEffect(() => {
    if (disableAllGuides) return;
    
    try {
      const storedGuides = localStorage.getItem(`universal-editor-guides-${projectId}`);
      if (storedGuides) {
        setGuidesViewed(JSON.parse(storedGuides));
      }
    } catch (error) {
      console.error('Error loading guides data:', error);
    }
  }, [projectId, disableAllGuides]);

  // Sauvegarder les guides vus dans le localStorage
  useEffect(() => {
    if (Object.keys(guidesViewed).length > 0) {
      try {
        localStorage.setItem(`universal-editor-guides-${projectId}`, JSON.stringify(guidesViewed));
      } catch (error) {
        console.error('Error saving guides data:', error);
      }
    }
  }, [guidesViewed, projectId]);

  // Marquer un guide comme vu
  const markGuideAsViewed = (guideType: GuideType) => {
    setGuidesViewed(prev => ({
      ...prev,
      [guideType]: true
    }));
    
    if (onGuideComplete) {
      onGuideComplete(guideType);
    }
  };

  // Vérifier si un guide a déjà été vu
  const hasViewedGuide = (guideType: GuideType): boolean => {
    return !!guidesViewed[guideType];
  };

  // Afficher un guide
  const showGuide = (guideType: GuideType) => {
    if (disableAllGuides || hasViewedGuide(guideType)) return;
    
    setActiveGuide(guideType);
    setIsGuideOpen(true);
  };

  // Fermer le guide actif
  const closeGuide = () => {
    setIsGuideOpen(false);
    setTimeout(() => setActiveGuide(null), 300); // Attendre la fin de l'animation
  };

  // Terminer le guide actif
  const completeGuide = () => {
    if (activeGuide) {
      markGuideAsViewed(activeGuide);
    }
    closeGuide();
  };

  // Afficher une notification d'aide
  const showHelpNotification = (title: string, message: React.ReactNode, guideType?: GuideType) => {
    addNotification({
      type: 'tip',
      title,
      message,
      duration: 8000,
      dismissible: true,
      ...(guideType && {
        action: {
          label: 'Voir le guide',
          onClick: () => showGuide(guideType)
        }
      })
    });
  };

  // Réinitialiser tous les guides (pour les tests)
  const resetAllGuides = () => {
    setGuidesViewed({});
    localStorage.removeItem(`universal-editor-guides-${projectId}`);
  };

  // Définition des étapes pour chaque guide
  const guideSteps: Record<GuideType, GuideStep[]> = {
    'welcome': [
      {
        target: '.universal-editor',
        title: 'Bienvenue dans l\'Éditeur Universel',
        content: (
          <p>
            Cet éditeur vous permet de créer et modifier facilement le contenu de votre portfolio avec une expérience WYSIWYG complète.
            Suivez ce guide pour découvrir les fonctionnalités principales.
          </p>
        ),
        position: 'bottom',
        spotlightRadius: 0
      },
      {
        target: '.editor-toolbar',
        title: 'Barre d\'outils principale',
        content: (
          <p>
            La barre d'outils principale contient les actions globales comme la sauvegarde, 
            la prévisualisation et l'accès à l'historique des versions.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.template-selector',
        title: 'Sélection du template',
        content: (
          <p>
            Choisissez parmi différents templates pour votre portfolio. 
            Chaque template offre un style visuel unique tout en conservant votre contenu.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.editor-content',
        title: 'Zone d\'édition',
        content: (
          <p>
            C'est ici que vous créez et modifiez votre contenu. 
            Cliquez n'importe où pour commencer à éditer ou appuyez sur "/" pour ajouter un nouveau bloc.
          </p>
        ),
        position: 'top'
      },
      {
        target: '.save-status-indicator',
        title: 'Indicateur de sauvegarde',
        content: (
          <p>
            Cet indicateur montre le statut de sauvegarde de votre contenu. 
            L'éditeur sauvegarde automatiquement vos modifications.
          </p>
        ),
        position: 'bottom'
      }
    ],
    'block-menu': [
      {
        target: '.editor-content',
        title: 'Ajouter du contenu',
        content: (
          <p>
            Pour ajouter du contenu, appuyez sur la touche "/" dans une ligne vide 
            ou cliquez sur le bouton "+" qui apparaît entre les blocs.
          </p>
        ),
        position: 'top'
      },
      {
        target: '.block-menu',
        title: 'Menu de blocs',
        content: (
          <p>
            Le menu de blocs vous permet de choisir parmi différents types de contenu : 
            texte, images, vidéos, témoignages et plus encore.
          </p>
        ),
        position: 'right',
        action: () => {
          // Simuler l'ouverture du menu de blocs si nécessaire
          const blockMenuTrigger = document.querySelector('.block-menu-trigger');
          if (blockMenuTrigger && !document.querySelector('.block-menu')) {
            (blockMenuTrigger as HTMLElement).click();
          }
        }
      },
      {
        target: '.block-menu-search',
        title: 'Recherche de blocs',
        content: (
          <p>
            Vous pouvez rechercher rapidement un type de bloc en tapant son nom. 
            Les résultats s'affichent instantanément pendant que vous tapez.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.block-menu-categories',
        title: 'Catégories de blocs',
        content: (
          <p>
            Les blocs sont organisés par catégories pour faciliter la navigation. 
            Cliquez sur une catégorie pour voir les blocs disponibles.
          </p>
        ),
        position: 'right'
      },
      {
        target: '.block-preview',
        title: 'Aperçu des blocs',
        content: (
          <p>
            Survolez un bloc pour voir un aperçu de son apparence. 
            Cliquez dessus pour l'insérer à la position actuelle du curseur.
          </p>
        ),
        position: 'left'
      }
    ],
    'editing-blocks': [
      {
        target: '.editable-block',
        title: 'Édition de blocs',
        content: (
          <p>
            Cliquez sur un bloc pour le sélectionner et commencer à l'éditer. 
            Un contour bleu indique le bloc actuellement sélectionné.
          </p>
        ),
        position: 'top'
      },
      {
        target: '.dynamic-toolbar',
        title: 'Barre d\'outils contextuelle',
        content: (
          <p>
            Cette barre d'outils s'adapte au type de bloc sélectionné et propose 
            des options spécifiques pour le formater ou le modifier.
          </p>
        ),
        position: 'bottom',
        action: () => {
          // Simuler la sélection d'un bloc si nécessaire
          const editableBlock = document.querySelector('.editable-block');
          if (editableBlock && !document.querySelector('.dynamic-toolbar')) {
            (editableBlock as HTMLElement).click();
          }
        }
      },
      {
        target: '.block-controls',
        title: 'Contrôles de bloc',
        content: (
          <p>
            Ces contrôles vous permettent de déplacer, dupliquer ou supprimer le bloc sélectionné. 
            Vous pouvez également changer son type si compatible.
          </p>
        ),
        position: 'left'
      },
      {
        target: '.block-drag-handle',
        title: 'Réorganisation des blocs',
        content: (
          <p>
            Utilisez cette poignée pour glisser-déposer les blocs et les réorganiser. 
            Vous pouvez également utiliser les raccourcis Alt+↑ et Alt+↓.
          </p>
        ),
        position: 'left'
      }
    ],
    'media-upload': [
      {
        target: '.media-block',
        title: 'Blocs média',
        content: (
          <p>
            Les blocs média vous permettent d'ajouter des images et des vidéos à votre portfolio. 
            Cliquez sur un bloc média pour le sélectionner.
          </p>
        ),
        position: 'top'
      },
      {
        target: '.media-upload-zone',
        title: 'Zone d\'upload',
        content: (
          <p>
            Cliquez ici pour sélectionner un fichier depuis votre ordinateur, 
            ou faites simplement glisser-déposer vos fichiers dans cette zone.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.media-gallery-button',
        title: 'Galerie de médias',
        content: (
          <p>
            Accédez à votre galerie de médias pour réutiliser des fichiers déjà téléchargés. 
            Tous vos médias sont centralisés pour un accès facile.
          </p>
        ),
        position: 'right'
      },
      {
        target: '.media-options',
        title: 'Options des médias',
        content: (
          <p>
            Personnalisez l'affichage de vos médias avec ces options : 
            taille, alignement, légende, et plus encore selon le type de média.
          </p>
        ),
        position: 'bottom'
      }
    ],
    'version-history': [
      {
        target: '.version-history-button',
        title: 'Historique des versions',
        content: (
          <p>
            L'éditeur sauvegarde automatiquement votre travail. 
            Cliquez ici pour accéder à l'historique complet des versions.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.version-list',
        title: 'Liste des versions',
        content: (
          <p>
            Parcourez les versions précédentes de votre contenu, 
            avec leur date et heure de création.
          </p>
        ),
        position: 'right',
        action: () => {
          // Simuler l'ouverture du panneau d'historique si nécessaire
          const historyButton = document.querySelector('.version-history-button');
          if (historyButton && !document.querySelector('.version-list')) {
            (historyButton as HTMLElement).click();
          }
        }
      },
      {
        target: '.version-preview',
        title: 'Prévisualisation des versions',
        content: (
          <p>
            Sélectionnez une version pour la prévisualiser avant de la restaurer. 
            Vous pouvez comparer facilement avec la version actuelle.
          </p>
        ),
        position: 'left'
      },
      {
        target: '.version-label-button',
        title: 'Versions étiquetées',
        content: (
          <p>
            Ajoutez des étiquettes aux versions importantes pour les retrouver facilement. 
            Les versions étiquetées ne sont jamais supprimées automatiquement.
          </p>
        ),
        position: 'bottom'
      }
    ],
    'export-preview': [
      {
        target: '.preview-button',
        title: 'Prévisualisation',
        content: (
          <p>
            Cliquez ici pour prévisualiser votre contenu tel qu'il apparaîtra sur votre site. 
            C'est une étape importante avant de publier.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.preview-responsive-controls',
        title: 'Contrôles responsive',
        content: (
          <p>
            Testez l'apparence de votre contenu sur différentes tailles d'écran 
            pour vous assurer qu'il s'affiche correctement partout.
          </p>
        ),
        position: 'top',
        action: () => {
          // Simuler l'ouverture de la prévisualisation si nécessaire
          const previewButton = document.querySelector('.preview-button');
          if (previewButton && !document.querySelector('.preview-responsive-controls')) {
            (previewButton as HTMLElement).click();
          }
        }
      },
      {
        target: '.export-button',
        title: 'Exportation',
        content: (
          <p>
            Lorsque vous êtes satisfait de votre contenu, cliquez ici pour l'exporter. 
            Vous pourrez choisir le format d'export selon vos besoins.
          </p>
        ),
        position: 'bottom'
      }
    ],
    'responsive-editing': [
      {
        target: '.responsive-mode-button',
        title: 'Mode responsive',
        content: (
          <p>
            Activez le mode responsive pour tester et ajuster votre contenu 
            pour différentes tailles d'écran directement pendant l'édition.
          </p>
        ),
        position: 'bottom'
      },
      {
        target: '.device-selector',
        title: 'Sélecteur d\'appareil',
        content: (
          <p>
            Choisissez parmi différents appareils (mobile, tablette, ordinateur) 
            pour voir comment votre contenu s'adapte à chaque format.
          </p>
        ),
        position: 'right',
        action: () => {
          // Simuler l'activation du mode responsive si nécessaire
          const responsiveButton = document.querySelector('.responsive-mode-button');
          if (responsiveButton && !document.querySelector('.device-selector')) {
            (responsiveButton as HTMLElement).click();
          }
        }
      },
      {
        target: '.responsive-options',
        title: 'Options responsive',
        content: (
          <p>
            Certains blocs offrent des options spécifiques pour chaque taille d'écran. 
            Ajustez-les pour optimiser l'affichage sur tous les appareils.
          </p>
        ),
        position: 'bottom'
      }
    ],
    'keyboard-shortcuts': [
      {
        target: '.editor-content',
        title: 'Raccourcis clavier',
        content: (
          <p>
            L'éditeur propose de nombreux raccourcis clavier pour accélérer votre travail. 
            Voici les plus importants :
          </p>
        ),
        position: 'top'
      },
      {
        target: '.editor-content',
        title: 'Navigation et sélection',
        content: (
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>↑/↓ : Naviguer entre les blocs</li>
            <li>Tab/Shift+Tab : Passer au bloc suivant/précédent</li>
            <li>Esc : Désélectionner le bloc actuel</li>
          </ul>
        ),
        position: 'right'
      },
      {
        target: '.editor-content',
        title: 'Création et édition',
        content: (
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>/ : Ouvrir le menu de blocs</li>
            <li>Alt+Enter : Insérer un nouveau bloc</li>
            <li>Ctrl+B/I/U : Gras/Italique/Souligné</li>
            <li>Alt+↑/↓ : Déplacer le bloc vers le haut/bas</li>
          </ul>
        ),
        position: 'right'
      },
      {
        target: '.editor-content',
        title: 'Actions globales',
        content: (
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Ctrl+S : Sauvegarder manuellement</li>
            <li>Ctrl+Z/Y : Annuler/Rétablir</li>
            <li>Ctrl+P : Ouvrir la prévisualisation</li>
            <li>F1 : Afficher l'aide</li>
          </ul>
        ),
        position: 'right'
      }
    ]
  };

  // Composant pour le bouton d'aide flottant
  const HelpButton = () => (
    <div
      className="help-button"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#3498db',
        color: 'white',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        zIndex: 9000,
        fontSize: '24px'
      }}
    >
      <HelpTooltip
        content={
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Aide et guides</div>
            <ul style={{ padding: '0 0 0 20px', margin: 0 }}>
              <li><button onClick={() => showGuide('welcome')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Guide de bienvenue</button></li>
              <li><button onClick={() => showGuide('block-menu')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Utiliser le menu de blocs</button></li>
              <li><button onClick={() => showGuide('editing-blocks')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Éditer les blocs</button></li>
              <li><button onClick={() => showGuide('media-upload')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Gestion des médias</button></li>
              <li><button onClick={() => showGuide('version-history')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Historique des versions</button></li>
              <li><button onClick={() => showGuide('keyboard-shortcuts')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>Raccourcis clavier</button></li>
            </ul>
            <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
              <a href="/docs/guide-utilisateur.md" target="_blank" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>Documentation complète →</a>
            </div>
          </div>
        }
        position="top"
        interactive={true}
        maxWidth={300}
        delay={0}
      >
        <div>?</div>
      </HelpTooltip>
    </div>
  );

  return (
    <>
      {/* Guide interactif */}
      {activeGuide && (
        <InteractiveGuide
          steps={guideSteps[activeGuide]}
          isOpen={isGuideOpen}
          onClose={closeGuide}
          onComplete={completeGuide}
          showSkip={true}
          showProgress={true}
        />
      )}
      
      {/* Bouton d'aide flottant */}
      <HelpButton />
    </>
  );
};

export default ContextualHelp;