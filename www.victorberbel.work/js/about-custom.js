/* JavaScript spécifique à la page about */

// Configuration Swiper pour la page about
document.addEventListener('DOMContentLoaded', function() {
  if (typeof Swiper !== 'undefined') {
    var swiper = new Swiper("#about", {
      loop: true,
      spaceBetween: 10,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 3000,
      },
    });
  }
});