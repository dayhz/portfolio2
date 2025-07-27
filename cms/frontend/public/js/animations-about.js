// Animations spécifiques à la page about
console.log('Chargement du script animations-about.js');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé pour animations-about.js');
  
  // Attendre que GSAP soit chargé
  function waitForGSAP() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
      console.log('En attente de GSAP et SplitText...');
      setTimeout(waitForGSAP, 100);
      return;
    }
    
    console.log('GSAP et SplitText chargés, initialisation des animations about...');
    
    // Vérifier s'il y a un h1 sur la page
    const h1Element = document.querySelector("h1");
    if (!h1Element) {
      console.log('Aucun h1 trouvé sur cette page');
      return;
    }
    
    console.log('H1 trouvé:', h1Element.textContent);
    
    // Animation du titre principal avec SplitText
    let h1Split = SplitText.create("h1", {
      types: "words, chars",
      mask: "words",
      charsClass: "charSplit"
    });
    
    const aboutTimeline = gsap.timeline();
    
    aboutTimeline
      .set("h1", { zIndex: 100 })
      .fromTo(h1Split.chars, 
        { yPercent: 100 }, 
        { yPercent: 0, stagger: 0.02, ease: "back(1.7).out" }
      )
      .to(".page_wrap-overlay", { autoAlpha: 0, visibility: "hidden" }, ">")
      .to("h1", { zIndex: 10 });
    
    // Animations des éléments spécifiques à la page about
    const aboutElements = [
      '[data-w-id="b00b3c37-e428-f7b8-ba0f-106cdae27c4d"]', // Texte about
      '[data-w-id="dedbec10-cefe-299f-aa71-060b8f506116"]', // Images about
      '[data-w-id="a7fda2c7-8caf-16ea-01a7-5e51e0a57bd4"]'  // GIF about
    ];
    
    aboutElements.forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (element) {
        console.log('Animation de l\'élément about:', selector);
        gsap.fromTo(element,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            delay: 1 + (index * 0.3),
            ease: "power2.out" 
          }
        );
      } else {
        console.log('Élément about non trouvé:', selector);
      }
    });
    
    console.log('Animations de la page about initialisées avec succès');
  }
  
  waitForGSAP();
});