/**
 * Script d'intégration pour le site portfolio principal
 * À inclure dans portfolio2/www.victorberbel.work/index.html
 */

(function() {
  'use strict';

  // Configuration
  const CMS_URL = 'http://localhost:3000'; // URL du CMS
  const STORAGE_KEY = 'zesty-template-projects';

  /**
   * Récupère les projets publiés depuis l'API du CMS
   */
  function getPublishedProjects() {
    try {
      // Lire depuis le localStorage
      const rawData = localStorage.getItem(STORAGE_KEY);
      console.log('Raw localStorage data:', rawData);
      
      const projects = JSON.parse(rawData || '[]');
      console.log('All projects:', projects);
      
      const publishedProjects = projects.filter(project => {
        console.log(`Project "${project.title}" status:`, project.status);
        return project.status === 'published';
      });
      
      console.log('Found published projects:', publishedProjects.length, publishedProjects);
      return publishedProjects;
    } catch (error) {
      console.warn('Cannot access CMS data:', error);
      return [];
    }
  }

  /**
   * Génère le HTML pour la section portfolio (format exact du site)
   */
  function generatePortfolioHTML(projects) {
    if (!projects.length) {
      return '<p class="u-text-style-large">Aucun projet publié pour le moment.</p>';
    }

    return projects.map((project, index) => `
      <a class="work_card w-inline-block" fade-in="" href="${CMS_URL}/project/${project.id}" target="_blank"
         id="w-node-cd0c8328-2622-8d6b-295f-f4d5926d9154-926d9154" project-category="all">
        <div class="work_img">
          ${project.heroImage ? 
            `<img alt="${project.title}" class="work_card_img" loading="lazy" 
                 sizes="(max-width: 1360px) 100vw, 1360px"
                 src="${project.heroImage}" 
                 style="width: 100%; height: 300px; object-fit: cover; border-radius: 0.5rem;" />` : 
            `<div class="work_card_img" style="background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; border-radius: 0.5rem; height: 300px; width: 100%;">
               ${project.title}
             </div>`
          }
        </div>
        <div class="work_card_text_footer">
          <div class="work_card_text_title">
            <h3 class="u-text-style-large u-color-dark">
              ${project.client}
            </h3>
          </div>
          <div class="u-text-style-small u-color-gray-900">
            ${project.title}
          </div>
        </div>
        <div class="card-hover w-embed"></div>
      </a>
    `).join('');
  }

  /**
   * Met à jour la section portfolio du site
   */
  async function updatePortfolioSection() {
    console.log('Starting portfolio update...');
    
    const projects = getPublishedProjects();
    console.log('Retrieved projects:', projects);
    
    if (projects.length === 0) {
      console.log('No published projects found');
      return;
    }

    // Page d'accueil - 4 projets les plus récents
    const homeContainer = document.querySelector('.work_main_grid_group');
    if (homeContainer) {
      const recentProjects = projects.slice(0, 4); // 4 plus récents
      console.log('Updating home container with projects:', recentProjects);
      homeContainer.innerHTML = generatePortfolioHTML(recentProjects);
      console.log(`Updated home page with ${recentProjects.length} recent projects`);
    } else {
      console.log('Home container (.work_main_grid_group) not found');
    }

    // Page work.html - Tous les projets
    const workContainer = document.querySelector('#projects-wrapper');
    if (workContainer) {
      workContainer.innerHTML = generatePortfolioHTML(projects);
      console.log(`Updated work page with ${projects.length} total projects`);
    }

    // Mettre à jour les statistiques si elles existent
    updateStats(projects);
  }

  /**
   * Met à jour les statistiques du portfolio
   */
  function updateStats(projects) {
    const stats = {
      projects: projects.length,
      clients: new Set(projects.map(p => p.client)).size,
      industries: new Set(projects.map(p => p.industry)).size
    };

    // Mettre à jour les éléments de stats
    const projectCount = document.querySelector('[data-stat="projects"]');
    const clientCount = document.querySelector('[data-stat="clients"]');
    const industryCount = document.querySelector('[data-stat="industries"]');

    if (projectCount) projectCount.textContent = stats.projects;
    if (clientCount) clientCount.textContent = stats.clients;
    if (industryCount) industryCount.textContent = stats.industries;
  }

  /**
   * Initialise l'intégration
   */
  function init() {
    // Mettre à jour au chargement
    updatePortfolioSection();

    // Écouter les changements dans le localStorage (si le CMS est ouvert)
    window.addEventListener('storage', function(e) {
      if (e.key === STORAGE_KEY) {
        updatePortfolioSection();
      }
    });

    // Rafraîchir périodiquement (toutes les 30 secondes)
    setInterval(updatePortfolioSection, 30000);
  }

  // Exposer les fonctions globalement
  window.portfolioIntegration = {
    update: updatePortfolioSection,
    getProjects: getPublishedProjects,
    init: init
  };

  // Auto-initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

// CSS pour forcer le bon format des projets CMS
const portfolioCSS = `
<style>
/* Forcer le bon format pour les projets CMS */
.work_main_grid_group .work_card_img {
  width: 100% !important;
  height: 300px !important;
  object-fit: cover !important;
  border-radius: 0.5rem !important;
  transform: scale(1.04) !important;
}

.work_main_grid_group .work_img {
  overflow: hidden !important;
  border-radius: 0.5rem !important;
  aspect-ratio: 16/9 !important;
}

/* Assurer que la grille fonctionne correctement */
.work_main_grid_group {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  grid-gap: 80px !important;
  grid-column-gap: 80px !important;
  grid-row-gap: 80px !important;
}

/* Hover effects pour les projets CMS */
.work_main_grid_group .work_card:hover .work_card_img {
  transform: scale(1.08) !important;
  transition: transform 0.3s ease !important;
}
</style>
`;

// Injecter le CSS
document.head.insertAdjacentHTML('beforeend', portfolioCSS);