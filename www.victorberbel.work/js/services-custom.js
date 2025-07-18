/* JavaScript personnalisé pour la page services */

// Configuration des devises Webflow
window.__WEBFLOW_CURRENCY_SETTINGS = {
  "currencyCode": "USD",
  "symbol": "$",
  "decimal": ".",
  "fractionDigits": 2,
  "group": ",",
  "template": "{{wf {\"path\":\"symbol\",\"type\":\"PlainText\"} }} {{wf {\"path\":\"amount\",\"type\":\"CommercePrice\"} }} {{wf {\"path\":\"currencyCode\",\"type\":\"PlainText\"} }}",
  "hideDecimalForWholeNumbers": false
};

// Fonction pour vérifier l'affichage du menu mobile
function checkMobileMenuDisplay() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const linkItems = document.querySelectorAll('.navbar_link_item');
  const logo = document.querySelector('.vb_logo');

  if (!mobileMenu) return;

  const menuStyle = window.getComputedStyle(mobileMenu);

  if (menuStyle.display === 'flex') {
    linkItems.forEach(item => item.style.color = '#ffffff');
    if (logo) logo.style.color = '#ffffff';
  } else {
    // Reverter à l'état original
    linkItems.forEach(item => item.style.color = '');
    if (logo) logo.style.color = '';
  }
}

// Vérifier au chargement de la page
window.addEventListener('load', checkMobileMenuDisplay);

// Vérifier lors du redimensionnement
window.addEventListener('resize', checkMobileMenuDisplay);

// Observer les changements du menu mobile
const observer = new MutationObserver(checkMobileMenuDisplay);
const target = document.querySelector('.mobile-menu');

if (target) {
  observer.observe(target, { 
    attributes: true, 
    attributeFilter: ['style', 'class'] 
  });
}

// Fonction pour égaliser les hauteurs des slides
function equalizeSlideHeights() {
  const slides = document.querySelectorAll(".swiper-slide");
  
  // Reset heights
  slides.forEach(slide => {
    slide.style.height = "auto";
  });
  
  // Find max height
  let maxHeight = 0;
  slides.forEach(slide => {
    const height = slide.offsetHeight;
    if (height > maxHeight) {
      maxHeight = height;
    }
  });
  
  // Apply max height to all slides
  slides.forEach(slide => {
    slide.style.height = `${maxHeight}px`;
  });
}

// Initialiser Swiper pour les témoignages clients
document.addEventListener('DOMContentLoaded', function() {
  if (typeof Swiper !== 'undefined' && document.querySelector("#brands")) {
    const swiper = new Swiper("#brands", {
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        720: {
          slidesPerView: 2,
          spaceBetween: 40
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 80
        }
      },
      on: {
        init: () => {
          equalizeSlideHeights();
        },
        resize: () => {
          equalizeSlideHeights();
        }
      }
    });
  }
});