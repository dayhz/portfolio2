/**
 * Utilitaire pour injecter les styles du site dans l'éditeur
 */

let stylesInjected = false;

/**
 * Injecte les styles du site dans le document
 */
export const injectSiteStyles = (): void => {
  if (stylesInjected) return;

  // Créer un élément style
  const styleElement = document.createElement('style');
  styleElement.id = 'universal-editor-site-styles';
  
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

  styleElement.textContent = siteCSS;
  document.head.appendChild(styleElement);
  
  stylesInjected = true;
};

/**
 * Supprime les styles injectés
 */
export const removeSiteStyles = (): void => {
  const existingStyle = document.getElementById('universal-editor-site-styles');
  if (existingStyle) {
    existingStyle.remove();
    stylesInjected = false;
  }
};

/**
 * Vérifie si les styles sont déjà injectés
 */
export const areStylesInjected = (): boolean => {
  return stylesInjected;
};