// Animations spécifiques à la page contact
document.addEventListener('DOMContentLoaded', function() {
  const isContactPage = window.location.pathname.includes('contact.html');
  
  if (isContactPage) {
    console.log('Initialisation des animations de la page contact...');
    
    // Attendre que GSAP soit chargé
    function waitForGSAP() {
      if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
        setTimeout(waitForGSAP, 100);
        return;
      }
      
      // Animation du titre principal avec SplitText
      let h1Split = SplitText.create("h1", {
        types: "words, chars",
        mask: "words",
        charsClass: "charSplit"
      });
      
      const contactTimeline = gsap.timeline();
      
      contactTimeline
        .set("h1", { zIndex: 100 })
        .fromTo(h1Split.chars, 
          { yPercent: 100 }, 
          { yPercent: 0, stagger: 0.03, ease: "back(1.7).out" }
        )
        .to(".page_wrap-overlay", { autoAlpha: 0, visibility: "hidden" }, ">")
        .to("h1", { zIndex: 10 });
      
      // Fonction pour vérifier la completion du formulaire
      function checkFormCompletion() {
        let allTextInputsFilled = true;
        textInputs.forEach(input => {
          if (input.value.trim() === '') {
            allTextInputsFilled = false;
          }
        });
        
        let atLeastOneCheckboxChecked = false;
        checkboxes.forEach(checkbox => {
          if (checkbox.checked) {
            atLeastOneCheckboxChecked = true;
          }
        });
        
        if (allTextInputsFilled && atLeastOneCheckboxChecked) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }
      
      // Sélecteurs pour le formulaire
      const textInputs = document.querySelectorAll('#email-form input[name="name"], #email-form input[name="email"], #email-form input[name="company"], #email-form textarea[name="about"]');
      const checkboxes = document.querySelectorAll('#email-form .checkbox-group input[type="checkbox"]');
      const button = document.querySelector("#email-form .button-form");
      
      if (textInputs.length > 0 && checkboxes.length > 0 && button) {
        // Ajouter les event listeners pour les inputs texte
        textInputs.forEach(input => {
          ['input', 'change', 'blur', 'focus'].forEach(eventType => {
            input.addEventListener(eventType, checkFormCompletion);
          });
        });
        
        // Ajouter les event listeners pour les checkboxes
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener("change", checkFormCompletion);
          checkbox.addEventListener("click", checkFormCompletion);
        });
        
        // Vérifications initiales
        setTimeout(checkFormCompletion, 500);
        window.addEventListener("load", checkFormCompletion);
        checkFormCompletion();
      }
      
      console.log('Animations de la page contact initialisées');
    }
    
    waitForGSAP();
  }
});