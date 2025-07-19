/* JavaScript personnalisé pour la page contact */

// Fonctions spécifiques à la page contact
document.addEventListener('DOMContentLoaded', function() {
  // Amélioration de l'expérience utilisateur du formulaire
  const form = document.getElementById('email-form');
  const submitButton = document.querySelector('.button-form');
  
  if (form && submitButton) {
    // Animation du bouton au survol
    submitButton.addEventListener('mouseenter', function() {
      if (this.classList.contains('active')) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(247, 91, 0, 0.3)';
      }
    });
    
    submitButton.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  }
  
  // Animation des FAQ au scroll
  const faqItems = document.querySelectorAll('.faq');
  
  if (faqItems.length > 0 && typeof gsap !== 'undefined') {
    gsap.fromTo(faqItems, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.faqs-grid',
          start: 'top 80%'
        }
      }
    );
  }
});