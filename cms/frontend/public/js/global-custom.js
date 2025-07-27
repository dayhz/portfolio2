/* JavaScript global personnalisé - Code commun à toutes les pages */

// Configuration Google Analytics - COMMUN À TOUTES LES PAGES
window.dataLayer = window.dataLayer || [];
function gtag() { 
  dataLayer.push(arguments); 
}
gtag('js', new Date());
gtag('set', 'developer_id.dZGVlNj', true);
gtag('config', 'G-08DF2SL8QK');

// Configuration Microsoft Clarity - COMMUN À TOUTES LES PAGES
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
  t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "mkrh3ax4x3");

// Configuration des devises Webflow - COMMUN À TOUTES LES PAGES
window.__WEBFLOW_CURRENCY_SETTINGS = {
  "currencyCode": "USD",
  "symbol": "$",
  "decimal": ".",
  "fractionDigits": 2,
  "group": ",",
  "template": "{{wf {\"path\":\"symbol\",\"type\":\"PlainText\"} }} {{wf {\"path\":\"amount\",\"type\":\"CommercePrice\"} }} {{wf {\"path\":\"currencyCode\",\"type\":\"PlainText\"} }}",
  "hideDecimalForWholeNumbers": false
};

// Enregistrement des plugins GSAP - COMMUN À TOUTES LES PAGES
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    console.log('Plugins GSAP enregistrés avec succès');
  }
});

// Chargement du portfolio Slater - COMMUN AUX PAGES PRINCIPALES
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si on est sur une page qui a besoin de Slater
  const needsSlater = window.location.pathname.includes('index.html') || 
                     window.location.pathname.includes('work.html') ||
                     window.location.pathname === '/' ||
                     window.location.pathname === '';
  
  if (needsSlater) {
    function loadlawsonsydneyportfolio(e) {
      let t = document.createElement("script");
      t.setAttribute("src", e);
      t.setAttribute("type", "module");
      document.body.appendChild(t);
      t.addEventListener("load", () => {
        console.log("Slater loaded Lawson Sydney Portfolio.js: https://slater.app/14220.js 🤙");
      });
      t.addEventListener("error", e => {
        console.log("Error loading Slater file", e);
      });
    }
    
    let src = window.location.host.includes("webflow.io") 
      ? "https://slater.app/14220.js" 
      : "https://assets.slater.app/slater/14220.js?v=1.0";
    
    loadlawsonsydneyportfolio(src);
  }
});

// Fonction pour vérifier l'affichage du menu mobile - COMMUN À TOUTES LES PAGES
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

// Initialiser la vérification du menu mobile - COMMUN À TOUTES LES PAGES
document.addEventListener('DOMContentLoaded', function() {
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
});