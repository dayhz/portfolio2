// Script universel de réinitialisation des animations
// Réinitialise les animations GSAP et Webflow lors de la navigation

function resetAnimations() {
  // Attendre que GSAP soit chargé
  if (typeof gsap === 'undefined') {
    setTimeout(resetAnimations, 100);
    return;
  }

  // Réinitialiser tous les éléments avec data-w-id qui ont opacity:0
  const elementsWithOpacity = document.querySelectorAll('[data-w-id][style*="opacity:0"], [data-w-id][style*="opacity: 0"]');
  elementsWithOpacity.forEach(element => {
    gsap.set(element, { opacity: 0, y: 30, clearProps: "transform" });
  });

  // Réinitialiser les éléments fade-in
  const fadeInElements = document.querySelectorAll('[fade-in]');
  fadeInElements.forEach(element => {
    gsap.set(element, { opacity: 0, y: 30, clearProps: "transform" });
  });

  // Réinitialiser les éléments spécifiques connus
  const specificElements = [
    '[data-w-id="b00b3c37-e428-f7b8-ba0f-106cdae27c4d"]', // About page text
    '[data-w-id="dedbec10-cefe-299f-aa71-060b8f506116"]', // About page images
    '[data-w-id="a7fda2c7-8caf-16ea-01a7-5e51e0a57bd4"]', // About page GIF
    '[data-w-id="5ae6e481-a178-b92a-c180-af296f83e1b4"]', // Work page filters
    '[data-w-id="827198b6-df77-fff4-3db1-990da6656560"]', // Home page brands
    '[data-w-id="15828fe9-b698-9ed3-3a55-9a383fb763b2"]', // Footer elements
    '[data-w-id="7320d164-c45c-d509-9cdb-282079bb48a3"]'  // Links
  ];
  
  specificElements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      gsap.set(element, { opacity: 0, y: 30, clearProps: "transform" });
    }
  });

  // Rafraîchir ScrollTrigger si disponible
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }

  // Réinitialiser Webflow si disponible
  if (typeof Webflow !== 'undefined') {
    Webflow.require('ix2').init();
  }

  console.log('Animations réinitialisées');
}

// Fonction pour détecter le retour sur la page
function handlePageReturn() {
  // Petit délai pour laisser le temps aux scripts de se charger
  setTimeout(resetAnimations, 200);
}

// Événements pour détecter le retour sur la page
document.addEventListener('DOMContentLoaded', handlePageReturn);
window.addEventListener('focus', handlePageReturn);
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    handlePageReturn();
  }
});

// Réinitialiser aussi lors du changement de visibilité de la page
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    handlePageReturn();
  }
});