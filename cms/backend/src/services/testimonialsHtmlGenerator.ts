import { TestimonialsData, Testimonial } from '../../../shared/types/services';

export class TestimonialsHtmlGenerator {
  /**
   * Génère le HTML pour un témoignage individuel
   */
  private generateTestimonialSlide(testimonial: Testimonial): string {
    const avatarSrc = testimonial.author.avatar || 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/default-avatar.png';
    const projectImageSrc = testimonial.project.image || 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/default-project.png';
    const projectUrl = testimonial.project.url || '#';
    const projectName = testimonial.project.name || 'Projet';

    return `
         <div class="clientes-slide w-slide">
          <div class="testimonials-card" data-w-id="7f8594a2-1a89-6150-e0ab-ef47ae7a4fc7">
           <div class="testimonials-card-left">
            <div class="testimonial-text u-color-dark">
             "${testimonial.text}"
            </div>
            <div class="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf--global-section-space--section-space="even">
            </div>
            <div class="testimonials-card-person-group">
             <img alt="${testimonial.author.name}" class="testimonials-avatar" loading="lazy" src="${avatarSrc}"/>
             <div class="testimonials-person-info">
              <div class="u-text-style-big">
               ${testimonial.author.name}
              </div>
              <div class="u-text-style-small">
               ${testimonial.author.title}${testimonial.author.company ? ` • ${testimonial.author.company}` : ''}
              </div>
             </div>
            </div>
           </div>
           <div class="testimonials-card-right">
            <div class="testimonial_card_img">
             <img alt="${projectName}" class="testimonials-person-thumb" loading="lazy" sizes="100vw" src="${projectImageSrc}"/>
            </div>
            <div class="testimonials-card-right-group">
             <div class="div-block-26">
              <a class="c-global-link uline-double small-3 w-inline-block" fade-in="" href="${projectUrl}" ${projectUrl.startsWith('http') ? 'target="_blank"' : ''}>
               <div class="u-text-style-small">
                Voir le projet
               </div>
               <div class="c-global-link-arrow">
                <div class="c-global-link-arrow-icon w-embed">
                 <svg fill="currentColor" height="100%" viewbox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17">
                  </path>
                 </svg>
                </div>
               </div>
              </a>
             </div>
            </div>
           </div>
          </div>
         </div>`;
  }

  /**
   * Génère le HTML complet pour la section testimonials
   */
  generateTestimonialsSection(testimonialsData: TestimonialsData): string {
    if (!testimonialsData.testimonials || testimonialsData.testimonials.length === 0) {
      // Retourner une section vide si pas de témoignages
      return `
        <div class="mask w-slider-mask">
         <div class="clientes-slide w-slide">
          <div class="testimonials-card" data-w-id="7f8594a2-1a89-6150-e0ab-ef47ae7a4fc7">
           <div class="testimonials-card-left">
            <div class="testimonial-text u-color-dark">
             "Aucun témoignage disponible pour le moment."
            </div>
            <div class="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf--global-section-space--section-space="even">
            </div>
            <div class="testimonials-card-person-group">
             <img alt="Admin" class="testimonials-avatar" loading="lazy" src="https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/default-avatar.png"/>
             <div class="testimonials-person-info">
              <div class="u-text-style-big">
               Admin
              </div>
              <div class="u-text-style-small">
               Administrateur
              </div>
             </div>
            </div>
           </div>
           <div class="testimonials-card-right">
            <div class="testimonial_card_img">
             <img alt="Projet" class="testimonials-person-thumb" loading="lazy" sizes="100vw" src="https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/default-project.png"/>
            </div>
            <div class="testimonials-card-right-group">
             <div class="div-block-26">
              <a class="c-global-link uline-double small-3 w-inline-block" fade-in="" href="#">
               <div class="u-text-style-small">
                Voir le projet
               </div>
               <div class="c-global-link-arrow">
                <div class="c-global-link-arrow-icon w-embed">
                 <svg fill="currentColor" height="100%" viewbox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17">
                  </path>
                 </svg>
                </div>
               </div>
              </a>
             </div>
            </div>
           </div>
          </div>
         </div>
        </div>`;
    }

    // Trier les témoignages par ordre
    const sortedTestimonials = [...testimonialsData.testimonials].sort((a, b) => a.order - b.order);

    // Générer les slides pour chaque témoignage
    const slides = sortedTestimonials.map(testimonial => this.generateTestimonialSlide(testimonial)).join('');

    return `
        <div class="mask w-slider-mask">${slides}
        </div>`;
  }

  /**
   * Met à jour le fichier services.html avec les nouveaux témoignages
   */
  async updateServicesHtml(testimonialsData: TestimonialsData, servicesHtmlPath: string): Promise<void> {
    const fs = require('fs').promises;
    
    try {
      // Lire le fichier HTML actuel
      const htmlContent = await fs.readFile(servicesHtmlPath, 'utf8');
      
      // Générer le nouveau HTML pour les témoignages
      const newTestimonialsHtml = this.generateTestimonialsSection(testimonialsData);
      
      // Trouver et remplacer la section testimonials
      // Pattern pour matcher la section testimonials complète
      const testimonialsPattern = /<div class="mask w-slider-mask">[\s\S]*?<\/div>\s*<\/div>/;
      
      if (!testimonialsPattern.test(htmlContent)) {
        throw new Error('Section testimonials non trouvée dans le fichier HTML');
      }
      
      // Remplacer la section
      const updatedHtml = htmlContent.replace(testimonialsPattern, newTestimonialsHtml.trim());
      
      // Écrire le fichier mis à jour
      await fs.writeFile(servicesHtmlPath, updatedHtml, 'utf8');
      
      console.log(`✅ Fichier services.html mis à jour avec ${testimonialsData.testimonials.length} témoignage(s)`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du fichier HTML:', error);
      throw error;
    }
  }

  /**
   * Valide les données testimonials avant génération
   */
  validateTestimonialsData(testimonialsData: TestimonialsData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testimonialsData) {
      errors.push('Données testimonials manquantes');
      return { isValid: false, errors };
    }

    if (!Array.isArray(testimonialsData.testimonials)) {
      errors.push('La propriété testimonials doit être un tableau');
      return { isValid: false, errors };
    }

    // Valider chaque témoignage
    testimonialsData.testimonials.forEach((testimonial, index) => {
      if (!testimonial.id) {
        errors.push(`Témoignage ${index + 1}: ID manquant`);
      }
      
      if (!testimonial.text || testimonial.text.trim().length === 0) {
        errors.push(`Témoignage ${index + 1}: Texte manquant`);
      }
      
      if (!testimonial.author || !testimonial.author.name) {
        errors.push(`Témoignage ${index + 1}: Nom de l'auteur manquant`);
      }
      
      if (!testimonial.author || !testimonial.author.title) {
        errors.push(`Témoignage ${index + 1}: Titre de l'auteur manquant`);
      }
      
      if (typeof testimonial.order !== 'number') {
        errors.push(`Témoignage ${index + 1}: Ordre invalide`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Génère un aperçu HTML pour les tests
   */
  generatePreviewHtml(testimonialsData: TestimonialsData): string {
    const validation = this.validateTestimonialsData(testimonialsData);
    
    if (!validation.isValid) {
      return `
        <div class="preview-error">
          <h3>Erreurs de validation:</h3>
          <ul>
            ${validation.errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    const testimonialsHtml = this.generateTestimonialsSection(testimonialsData);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aperçu Testimonials</title>
        <style>
          .testimonials-card { border: 1px solid #ddd; margin: 20px; padding: 20px; }
          .testimonial-text { font-style: italic; margin-bottom: 15px; }
          .testimonials-avatar { width: 50px; height: 50px; border-radius: 50%; }
          .u-text-style-big { font-weight: bold; }
          .u-text-style-small { color: #666; }
        </style>
      </head>
      <body>
        <h1>Aperçu des Témoignages (${testimonialsData.testimonials.length})</h1>
        ${testimonialsHtml}
      </body>
      </html>
    `;
  }
}

// Export singleton
export const testimonialsHtmlGenerator = new TestimonialsHtmlGenerator();