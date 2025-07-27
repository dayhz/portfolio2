// Animations spécifiques à la page d'accueil

// 1. Animation de la vidéo avec scroll
function initVideoScrollDynamic() {
  const scrollSection = document.querySelector(".scroll_section");
  const scrollInner = document.querySelector(".scroll_inner");
  const videoWrapper = document.querySelector(".video_wrapper");
  
  if (!scrollSection || !scrollInner || !videoWrapper) return;
  
  // Nettoyer les animations existantes
  if (videoCenterTrigger && videoCenterTrigger.scrollTrigger) videoCenterTrigger.scrollTrigger.kill();
  if (videoPinTrigger && videoPinTrigger.scrollTrigger) videoPinTrigger.scrollTrigger.kill();
  if (bgColorTrigger && bgColorTrigger.scrollTrigger) bgColorTrigger.scrollTrigger.kill();
  
  // Animation du background
  bgColorTrigger = gsap.to("body", {
    backgroundColor: "#111111",
    scrollTrigger: {
      trigger: ".scroll_section",
      start: "top 20%",
      end: "center center",
      scrub: true,
      id: "bgColor"
    }
  });
  
  // Pin de la vidéo
  videoPinTrigger = gsap.to(".video_wrapper", {
    ease: "none",
    scrollTrigger: {
      trigger: ".scroll_section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      pin: ".scroll_inner",
      pinSpacing: true,
      id: "videoPin"
    }
  });
  
  // Centrage et scale de la vidéo
  const offset = (scrollInner.offsetHeight - videoWrapper.offsetHeight) / 2;
  videoCenterTrigger = gsap.fromTo(videoWrapper, 
    { y: 0 }, 
    {
      y: offset,
      scale: 0.85,
      ease: "none",
      scrollTrigger: {
        trigger: ".scroll_section",
        start: "top-=15% top",
        end: "top top",
        scrub: 1,
        id: "videoCenter"
      }
    }
  );
}

// 2. Animation du marquee des marques
function initMarquee() {
  function duplicateItems() {
    try {
      const items = marqueeTrack.querySelectorAll(".brands_main_group-item");
      for (let i = 0; i < items.length; i++) {
        const clone = items[i].cloneNode(true);
        marqueeTrack.appendChild(clone);
      }
      marqueeTrack.style.display = "flex";
      marqueeTrack.style.position = "relative";
      marqueeTrack.style.willChange = "transform";
    } catch (e) {
      console.error("Erreur lors de la duplication des items:", e);
    }
  }
  
  function startAnimation() {
    try {
      const items = marqueeTrack.querySelectorAll(".brands_main_group-item");
      const halfLength = Math.floor(items.length / 2);
      let totalWidth = 0;
      
      for (let i = 0; i < halfLength; i++) {
        totalWidth += items[i].offsetWidth;
      }
      
      let currentX = 0;
      
      function animate() {
        currentX -= speed;
        if (currentX <= -totalWidth) {
          currentX = 0;
        }
        marqueeTrack.style.transform = `translateX(${currentX}px)`;
        animationId = requestAnimationFrame(animate);
      }
      
      animationId = requestAnimationFrame(animate);
    } catch (e) {
      console.error("Erreur lors de l'animation:", e);
    }
  }
  
  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      startAnimation();
    }
  }
  
  const marqueeTrack = document.querySelector(".marquee_track");
  if (!marqueeTrack) return;
  
  let animationId;
  const speed = 1;
  
  duplicateItems();
  startAnimation();
  
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", function() {
    cancelAnimationFrame(animationId);
    startAnimation();
  });
}

// 3. Animation du titre principal avec SplitText
function initHeroAnimation() {
  if (typeof SplitText === 'undefined') {
    console.warn('SplitText non disponible');
    return;
  }
  
  let h1Split = SplitText.create("h1", {
    types: "words, chars",
    mask: "words",
    charsClass: "charSplit"
  });
  
  const heroTimeline = gsap.timeline();
  
  heroTimeline
    .set("h1", { zIndex: 100 })
    .fromTo(h1Split.chars, 
      { yPercent: 100 }, 
      { yPercent: 0, stagger: 0.01, ease: "back(1.7).out" }
    )
    .to(".page_wrap-overlay", { autoAlpha: 0, visibility: "hidden" }, "-=.4")
    .fromTo("[data-hero-description]", 
      { opacity: 0, x: 10 }, 
      { opacity: 1, x: 0, duration: 0.2 }, 
      "<=0.1"
    )
    .fromTo(".video_wrapper", 
      { opacity: 0 }, 
      { opacity: 1 }, 
      "<+0.3"
    )
    .to("h1", { zIndex: 10 });
}

// Gestion responsive
function handleResponsiveGSAP() {
  if (window.innerWidth > 991) {
    initVideoScrollDynamic();
  } else {
    // Nettoyer les animations sur mobile
    if (videoCenterTrigger && videoCenterTrigger.scrollTrigger) videoCenterTrigger.scrollTrigger.kill();
    if (videoPinTrigger && videoPinTrigger.scrollTrigger) videoPinTrigger.scrollTrigger.kill();
    if (bgColorTrigger && bgColorTrigger.scrollTrigger) bgColorTrigger.scrollTrigger.kill();
  }
}

// Variables globales
let videoCenterTrigger, videoPinTrigger, bgColorTrigger;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si on est sur la page d'accueil
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
  
  if (isHomePage) {
    console.log('Initialisation des animations de la page d\'accueil...');
    
    // Attendre que GSAP soit chargé
    function waitForGSAP() {
      if (typeof gsap === 'undefined') {
        setTimeout(waitForGSAP, 100);
        return;
      }
      
      // Initialiser les animations
      initHeroAnimation();
      initMarquee();
      
      if (document.querySelector(".scroll_section")) {
        handleResponsiveGSAP();
        window.addEventListener("resize", () => {
          clearTimeout(window._videoResizeTimeout);
          window._videoResizeTimeout = setTimeout(() => {
            handleResponsiveGSAP();
          }, 200);
        });
      }
    }
    
    waitForGSAP();
  }
});