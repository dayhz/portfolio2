/* JavaScript extrait de about.html */

/* Script 1 */
!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

/* Script 2 */
window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('set', 'developer_id.dZGVlNj', true);gtag('config', 'G-08DF2SL8QK');

/* Script 3 */
(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "mkrh3ax4x3");

/* Script 4 */
window.__WEBFLOW_CURRENCY_SETTINGS = {"currencyCode":"USD","symbol":"$","decimal":".","fractionDigits":2,"group":",","template":"{{wf {\"path\":\"symbol\",\"type\":\"PlainText\"} }} {{wf {\"path\":\"amount\",\"type\":\"CommercePrice\"} }} {{wf {\"path\":\"currencyCode\",\"type\":\"PlainText\"} }}","hideDecimalForWholeNumbers":false};

/* Script 5 */
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
    // Se quiser reverter ao estado original, coloque a cor padrão aqui
    linkItems.forEach(item => item.style.color = '');
    if (logo) logo.style.color = '';
  }
}

// Verifica ao carregar a página
window.addEventListener('load', checkMobileMenuDisplay);

// Verifica sempre que houver redimensionamento ou alterações visuais
window.addEventListener('resize', checkMobileMenuDisplay);

// Se a exibição do menu mudar por clique ou outra interação, escute isso também
const observer = new MutationObserver(checkMobileMenuDisplay);
const target = document.querySelector('.mobile-menu');

if (target) {
  observer.observe(target, { attributes: true, attributeFilter: ['style', 'class'] });
}

/* Script 6 */
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[data-color]").forEach(div => {
      const color = div.getAttribute("data-color");
      if (color) {
        div.style.setProperty("background-color", color, "important"); 
      }
    });
  });

/* Script 7 */
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[data-color]").forEach(div => {
      const color = div.getAttribute("data-color");
      if (color) {
        div.style.setProperty("background-color", color, "important"); 
      }
    });
  });

/* Script 8 */
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[data-color]").forEach(div => {
      const color = div.getAttribute("data-color");
      if (color) {
        div.style.setProperty("background-color", color, "important"); 
      }
    });
  });

/* Script 9 */
gsap.registerPlugin(ScrollTrigger,SplitText);

// Réinitialiser les animations lors du chargement de la page
function resetAnimations() {
  // Réinitialiser les éléments avec opacity:0
  const elementsToReset = [
    '[data-w-id="b00b3c37-e428-f7b8-ba0f-106cdae27c4d"]',
    '[data-w-id="dedbec10-cefe-299f-aa71-060b8f506116"]',
    '[data-w-id="a7fda2c7-8caf-16ea-01a7-5e51e0a57bd4"]'
  ];
  
  elementsToReset.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      gsap.set(element, { opacity: 0, y: 30 });
    }
  });
  
  // Rafraîchir ScrollTrigger
  ScrollTrigger.refresh();
}

// Réinitialiser au chargement de la page
document.addEventListener('DOMContentLoaded', resetAnimations);

// Réinitialiser aussi lors du focus de la fenêtre (retour de navigation)
window.addEventListener('focus', resetAnimations);

// Réinitialiser lors du pageshow (navigation avec cache)
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    resetAnimations();
  }
});

/* Script 10 */
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

/* Script 11 */
const swiper = new Swiper("#about", {
  loop: true,
  autoplay: {
    delay: 1000
  },
  sliderPerView: 1,
  pagination: {
    el: ".swiper-pagination",
    clickable: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  scrollbar: {
    el: ".swiper-scrollbar",
  },
  breakpoints: {
    320: {
      slidesPerView: 3,
      spaceBetween: 10, 
      centeredSlides: false,
    },
    480: {
      slidesPerView: 3,
      spaceBetween: 10, 
      centeredSlides: false,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 50, 
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 120, 
    },
  },
});

