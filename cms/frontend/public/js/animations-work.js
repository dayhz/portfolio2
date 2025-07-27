// Animations spécifiques à la page work
console.log('Chargement du script animations-work.js');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé pour animations-work.js');
  
  // Attendre que GSAP soit chargé
  function waitForGSAP() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
      console.log('En attente de GSAP et SplitText...');
      setTimeout(waitForGSAP, 100);
      return;
    }
    
    console.log('GSAP et SplitText chargés, initialisation des animations work...');
    
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
    
    const workTimeline = gsap.timeline();
    
    workTimeline
      .set("h1", { zIndex: 100 })
      .fromTo(h1Split.chars, 
        { yPercent: 100 }, 
        { yPercent: 0, stagger: 0.03, ease: "back(1.7).out" }
      )
      .to(".page_wrap-overlay", { autoAlpha: 0, visibility: "hidden" }, ">")
      .to("h1", { zIndex: 10 });
    
    // Animations des cartes de travail avec ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.work_card').forEach((card, index) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }
    
    console.log('Animations de la page work initialisées avec succès');
  }
  
  waitForGSAP();
});