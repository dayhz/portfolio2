/* JavaScript spécifique à la page services */

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