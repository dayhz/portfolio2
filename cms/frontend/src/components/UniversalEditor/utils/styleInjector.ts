/**
 * Utilitaire pour injecter les styles du site dans l'éditeur
 */

let stylesInjected = false;

/**
 * Injecte les styles du site dans le document
 */
export const injectSiteStyles = (): void => {
  if (stylesInjected) return;

  // Créer un élément style pour les styles du site
  const siteStyleElement = document.createElement('style');
  siteStyleElement.id = 'universal-editor-site-styles';
  
  // CSS du site (extrait des fichiers du portfolio)
  const siteCSS = `
    /* Variables CSS du site */
    :root {
      --site--margin: clamp(1rem, 0.4074074074074074rem + 2.9629629629629632vw, 3rem);
      --size--2rem: clamp(1.75rem, 1.6759259259259258rem + 0.3703703703703704vw, 2rem);
      --size--3rem: clamp(2.25rem, 2.0277777777777777rem + 1.1111111111111112vw, 3rem);
      --size--4rem: clamp(2.5rem, 2.0555555555555554rem + 2.2222222222222223vw, 4rem);
      --size--5rem: clamp(3rem, 2.4074074074074074rem + 2.9629629629629632vw, 5rem);
    }

    /* Styles pour l'éditeur universel */
    .universal-editor-content * {
      vertical-align: bottom;
      box-sizing: border-box;
    }

    /* Sections principales */
    .universal-editor-content .section {
      position: relative;
      margin: 2rem 0;
    }

    .universal-editor-content .u-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--site--margin, 1rem);
    }

    /* Conteneurs d'images */
    .universal-editor-content .temp-img_container {
      margin: 2rem 0;
    }

    .universal-editor-content .temp-img {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .universal-editor-content .img-wrp {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
    }

    .universal-editor-content .comp-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 16px;
      object-fit: cover;
    }

    /* Grilles d'images */
    .universal-editor-content .temp-comp-img_grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin: 3rem 0;
    }

    .universal-editor-content .img_grid-container {
      position: relative;
    }

    /* Blocs de texte */
    .universal-editor-content .temp-rich {
      margin: 2rem 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .universal-editor-content .temp-rich.u-color-dark {
      color: #111827;
    }

    .universal-editor-content .temp-rich h1 {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 2rem 0 1rem 0;
      color: #111827;
    }

    .universal-editor-content .temp-rich h2 {
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.3;
      margin: 1.5rem 0 1rem 0;
      color: #111827;
    }

    .universal-editor-content .temp-rich h3 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.4;
      margin: 1.25rem 0 0.75rem 0;
      color: #111827;
    }

    .universal-editor-content .temp-rich p {
      font-size: 1.1rem;
      line-height: 1.7;
      margin: 1rem 0;
      color: #444;
    }

    /* Texte simple */
    .universal-editor-content .temp-comp-text {
      margin: 2rem 0;
      font-size: 1.1rem;
      line-height: 1.7;
      color: #444;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Témoignages */
    .universal-editor-content .temp-comp-testimony {
      text-align: center;
      padding: 3rem 2rem;
      background: #f8f9fa;
      border-radius: 16px;
      margin: 3rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .universal-editor-content .testimony {
      font-size: 1.3rem;
      font-style: italic;
      line-height: 1.6;
      color: #333;
      margin: 0 0 2rem 0;
      font-weight: 400;
    }

    /* Vidéos */
    .universal-editor-content .video-wrp {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin: 2rem 0;
    }

    .universal-editor-content .video {
      width: 100%;
      height: auto;
      border-radius: 16px;
      display: block;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .universal-editor-content .temp-comp-img_grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .universal-editor-content .temp-rich h1 {
        font-size: 2rem;
      }
      
      .universal-editor-content .temp-rich h2 {
        font-size: 1.75rem;
      }
      
      .universal-editor-content .temp-comp-testimony {
        padding: 2rem 1.5rem;
      }
    }

    /* États d'édition */
    .universal-editor-content .section:hover {
      outline: 2px dashed #3b82f6;
      outline-offset: 4px;
    }

    .universal-editor-content .section.editing {
      outline: 2px solid #3b82f6;
      outline-offset: 4px;
    }

    /* Placeholder pour blocs vides */
    .universal-editor-content .block-placeholder {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      background: #f9fafb;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .universal-editor-content .block-placeholder:hover {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #1d4ed8;
    }
  `;

  siteStyleElement.textContent = siteCSS;
  document.head.appendChild(siteStyleElement);
  
  // Créer un élément style pour les styles responsives
  const responsiveStyleElement = document.createElement('style');
  responsiveStyleElement.id = 'universal-editor-responsive-styles';
  
  // CSS responsive (importé du fichier responsive.css)
  const responsiveCSS = `
    /**
     * Styles CSS responsives pour l'éditeur universel
     */
    
    /* Variables CSS pour les breakpoints */
    :root {
      --breakpoint-xs: 0;
      --breakpoint-sm: 576px;
      --breakpoint-md: 768px;
      --breakpoint-lg: 992px;
      --breakpoint-xl: 1200px;
      --breakpoint-xxl: 1400px;
      
      /* Variables pour les tailles de contrôles */
      --control-size-mobile: 44px;
      --control-size-tablet: 36px;
      --control-size-desktop: 32px;
      
      /* Variables pour les espacements */
      --spacing-mobile: 8px;
      --spacing-tablet: 12px;
      --spacing-desktop: 16px;
      
      /* Variables pour les tailles de police */
      --font-size-mobile: 16px;
      --font-size-tablet: 14px;
      --font-size-desktop: 14px;
      
      /* Variables pour les animations */
      --animation-duration-mobile: 150ms;
      --animation-duration-tablet: 200ms;
      --animation-duration-desktop: 300ms;
    }
    
    /* Styles de base pour l'éditeur */
    .universal-editor {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }
    
    /* Styles responsives pour les appareils mobiles */
    @media (max-width: 767px) {
      .universal-editor {
        font-size: var(--font-size-mobile);
      }
      
      /* Augmenter la taille des contrôles pour les appareils tactiles */
      .universal-editor button,
      .universal-editor .control-button,
      .universal-editor .toolbar-button {
        min-width: var(--control-size-mobile);
        min-height: var(--control-size-mobile);
        padding: var(--spacing-mobile);
        margin: calc(var(--spacing-mobile) / 2);
      }
      
      /* Simplifier les menus sur mobile */
      .universal-editor .dropdown-menu,
      .universal-editor .context-menu {
        width: 100%;
        max-width: 100%;
        left: 0 !important;
        right: 0 !important;
        border-radius: 0;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        border-bottom: none;
        border-left: none;
        border-right: none;
      }
      
      /* Afficher les menus en bas de l'écran sur mobile */
      .universal-editor .block-menu {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        transform: none !important;
        max-height: 50vh;
        overflow-y: auto;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        z-index: 1050;
      }
      
      /* Adapter la grille pour mobile */
      .universal-editor .image-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-mobile);
      }
      
      /* Réduire les animations sur mobile */
      .universal-editor .animated,
      .universal-editor .fade-in,
      .universal-editor .fade-out {
        transition-duration: var(--animation-duration-mobile);
      }
      
      /* Masquer les tooltips sur mobile en mode portrait */
      @media (orientation: portrait) {
        .universal-editor .tooltip {
          display: none !important;
        }
      }
      
      /* Adapter la barre d'outils pour mobile */
      .universal-editor .dynamic-toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        background-color: #f8f9fa;
        border-top: 1px solid #dee2e6;
        border-bottom: none;
        border-radius: 0;
        padding: var(--spacing-mobile);
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      }
      
      /* Adapter les contrôles de bloc pour mobile */
      .universal-editor .block-controls {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        background-color: #f8f9fa;
        border-top: 1px solid #dee2e6;
        border-radius: 0;
        padding: var(--spacing-mobile);
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      /* Adapter les panneaux pour mobile */
      .universal-editor .panel,
      .universal-editor .version-history-panel,
      .universal-editor .media-gallery {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
        z-index: 1100;
      }
      
      /* Adapter les formulaires pour mobile */
      .universal-editor input,
      .universal-editor select,
      .universal-editor textarea {
        font-size: var(--font-size-mobile);
        padding: var(--spacing-mobile);
        height: var(--control-size-mobile);
      }
    }
    
    /* Styles responsives pour les tablettes */
    @media (min-width: 768px) and (max-width: 991px) {
      .universal-editor {
        font-size: var(--font-size-tablet);
      }
      
      /* Adapter la taille des contrôles pour les tablettes */
      .universal-editor button,
      .universal-editor .control-button,
      .universal-editor .toolbar-button {
        min-width: var(--control-size-tablet);
        min-height: var(--control-size-tablet);
        padding: var(--spacing-tablet);
        margin: calc(var(--spacing-tablet) / 2);
      }
      
      /* Adapter la grille pour tablette */
      .universal-editor .image-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-tablet);
      }
      
      /* Adapter les animations pour tablette */
      .universal-editor .animated,
      .universal-editor .fade-in,
      .universal-editor .fade-out {
        transition-duration: var(--animation-duration-tablet);
      }
      
      /* Adapter les panneaux pour tablette */
      .universal-editor .panel,
      .universal-editor .version-history-panel,
      .universal-editor .media-gallery {
        max-width: 80%;
        max-height: 80%;
      }
      
      /* Adapter les formulaires pour tablette */
      .universal-editor input,
      .universal-editor select,
      .universal-editor textarea {
        font-size: var(--font-size-tablet);
        padding: var(--spacing-tablet);
        height: var(--control-size-tablet);
      }
    }
    
    /* Styles pour les appareils tactiles */
    @media (hover: none) and (pointer: coarse) {
      /* Augmenter la taille des zones cliquables */
      .universal-editor button,
      .universal-editor .control-button,
      .universal-editor .toolbar-button,
      .universal-editor .clickable {
        min-width: var(--control-size-mobile);
        min-height: var(--control-size-mobile);
      }
      
      /* Désactiver les effets de survol */
      .universal-editor .hover-effect:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      /* Ajouter un retour visuel pour les interactions tactiles */
      .universal-editor .touch-feedback:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
    }
    
    /* Styles pour les appareils à faible puissance */
    .universal-editor.low-power-device .animated,
    .universal-editor.low-power-device .animation,
    .universal-editor.low-power-device .fade-in,
    .universal-editor.low-power-device .fade-out {
      transition: none !important;
      animation: none !important;
    }
    
    /* Styles pour l'orientation portrait */
    @media (orientation: portrait) {
      .universal-editor .portrait-only {
        display: block;
      }
      
      .universal-editor .landscape-only {
        display: none;
      }
    }
    
    /* Styles pour l'orientation paysage */
    @media (orientation: landscape) {
      .universal-editor .portrait-only {
        display: none;
      }
      
      .universal-editor .landscape-only {
        display: block;
      }
    }
  `;

  responsiveStyleElement.textContent = responsiveCSS;
  document.head.appendChild(responsiveStyleElement);
  
  stylesInjected = true;
};

/**
 * Supprime les styles injectés
 */
export const removeSiteStyles = (): void => {
  const existingSiteStyle = document.getElementById('universal-editor-site-styles');
  if (existingSiteStyle) {
    existingSiteStyle.remove();
  }
  
  const existingResponsiveStyle = document.getElementById('universal-editor-responsive-styles');
  if (existingResponsiveStyle) {
    existingResponsiveStyle.remove();
  }
  
  stylesInjected = false;
};

/**
 * Vérifie si les styles sont déjà injectés
 */
export const areStylesInjected = (): boolean => {
  return stylesInjected;
};