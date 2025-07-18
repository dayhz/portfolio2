// Animations spécifiques à la page services

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

function initServicesAnimations() {
  console.log('Initialisation des animations de la page services...');
  
  // Animation du titre principal avec SplitText
  if (typeof SplitText !== 'undefined') {
    let h1Split = SplitText.create("h1", {
      types: "words, chars",
      mask: "words",
      charsClass: "charSplit"
    });
    
    const servicesTimeline = gsap.timeline();
    
    servicesTimeline
      .set("h1", { zIndex: 100 })
      .fromTo(h1Split.chars, 
        { yPercent: 100 }, 
        { yPercent: 0, stagger: 0.01, ease: "back(1.7).out" }
      )
      .to(".page_wrap-overlay", { autoAlpha: 0, visibility: "hidden" }, "-=.4")
      .to("h1", { zIndex: 10 });
  }
  
  // Initialiser Swiper pour les témoignages clients
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
  
  // Animations des éléments de service avec fade-in
  const serviceElements = [
    '[data-w-id="0fe385c4-c807-0ffe-f6fc-c250bfb174c7"]', // Description
    '[data-w-id="0ee68e3a-a2f6-3aee-4c8e-ed68eb69ef3c"]', // Service 1
    '[data-w-id="d7df0819-6ebf-7c2f-25d0-a080afe99284"]', // Service 2
    '[data-w-id="d432e9ff-9eaf-e99d-98ab-178bfc0496d4"]', // Service 3
    '[data-w-id="0feb1169-9583-1aaf-5fe8-7f438ff35b1c"]'  // Grid content
  ];
  
  serviceElements.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      gsap.fromTo(element,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          delay: 0.5 + (index * 0.2),
          ease: "power2.out" 
        }
      );
    }
  });
  
  // Animation des éléments d'approche avec ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.utils.toArray('.approach-iitem').forEach((item, index) => {
      gsap.fromTo(item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }
}

// Initialisation pour la page services
document.addEventListener('DOMContentLoaded', function() {
  const isServicesPage = window.location.pathname.includes('services.html');
  
  if (isServicesPage) {
    // Attendre que GSAP soit chargé
    function waitForGSAP() {
      if (typeof gsap === 'undefined') {
        setTimeout(waitForGSAP, 100);
        return;
      }
      
      initServicesAnimations();
    }
    
    waitForGSAP();
  }
});