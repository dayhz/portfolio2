// Script pour organiser les clients comme sur la maquette
document.addEventListener('DOMContentLoaded', function () {
  // Vérifier si nous sommes sur la page services
  if (window.location.pathname.includes('services')) {
    console.log('Page services détectée, organisation des clients...');

    // Trouver la section des clients
    const clientsSection = document.querySelector('#brands');
    if (clientsSection) {
      console.log('Section clients trouvée');

      // Désactiver le comportement Swiper
      if (window.Swiper && clientsSection.swiper) {
        clientsSection.swiper.destroy(true, true);
      }

      // Appliquer les styles pour organiser les clients en 3 colonnes et 2 lignes
      const swiperWrapper = clientsSection.querySelector('.swiper-wrapper');
      if (swiperWrapper) {
        swiperWrapper.style.display = 'grid';
        swiperWrapper.style.gridTemplateColumns = 'repeat(3, 1fr)';
        swiperWrapper.style.gap = '30px';
        swiperWrapper.style.transform = 'none';

        // Réorganiser les cartes de clients
        const slides = clientsSection.querySelectorAll('.swiper-slide');
        const cards = [];

        // Extraire toutes les cartes de clients
        slides.forEach(slide => {
          const slideCards = slide.querySelectorAll('.clientes-testimonials-card');
          slideCards.forEach(card => {
            cards.push(card.cloneNode(true));
          });

          // Supprimer le slide
          slide.remove();
        });

        // Créer de nouveaux slides avec une carte par slide
        cards.forEach(card => {
          const newSlide = document.createElement('div');
          newSlide.className = 'swiper-slide service';
          newSlide.style.width = '100%';
          newSlide.style.height = 'auto';
          newSlide.style.marginRight = '0';

          newSlide.appendChild(card);
          swiperWrapper.appendChild(newSlide);
        });

        // Masquer les éléments de navigation
        const navigationElements = clientsSection.querySelectorAll('.swiper-pagination, .swiper-button-next, .swiper-button-prev');
        navigationElements.forEach(element => {
          element.style.display = 'none';
        });

        console.log('Clients organisés avec succès');
      }
    }
  }
});