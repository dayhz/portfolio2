/* JavaScript personnalisé pour la page about */

// Configuration Webflow
window.dataLayer = window.dataLayer || [];
function gtag() { 
  dataLayer.push(arguments); 
}
gtag('js', new Date());
gtag('set', 'developer_id.dZGVlNj', true);
gtag('config', 'G-08DF2SL8QK');

// Configuration Clarity
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
  t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "mkrh3ax4x3");

// Configuration des devises Webflow
window.__WEBFLOW_CURRENCY_SETTINGS = {
  "currencyCode": "USD",
  "symbol": "$",
  "decimal": ".",
  "fractionDigits": 2,
  "group": ",",
  "template": "{{wf {\"path\":\"symbol\",\"type\":\"PlainText\"} }} {{wf {\"path\":\"amount\",\"type\":\"CommercePrice\"} }} {{wf {\"path\":\"currencyCode\",\"type\":\"PlainText\"} }}",
  "hideDecimalForWholeNumbers": false
};

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

// Enregistrement des plugins GSAP
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    console.log('Plugins GSAP registrados com sucesso');
  }
});