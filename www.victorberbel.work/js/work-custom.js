/* JavaScript personnalisé pour la page work */

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

// Chargement du portfolio Slater
document.addEventListener("DOMContentLoaded", function () {
  function loadlawsonsydneyportfolio(e) {
    let t = document.createElement("script");
    t.setAttribute("src", e);
    t.setAttribute("type", "module");
    document.body.appendChild(t);
    t.addEventListener("load", () => {
      console.log("Slater loaded Lawson Sydney Portfolio.js: https://slater.app/14220.js 🤙");
    });
    t.addEventListener("error", e => {
      console.log("Error loading file", e);
    });
  }
  
  let src = window.location.host.includes("webflow.io") 
    ? "https://slater.app/14220.js" 
    : "https://assets.slater.app/slater/14220.js?v=1.0";
  
  loadlawsonsydneyportfolio(src);
});

// Enregistrement des plugins GSAP
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    console.log('Plugins GSAP registrados com sucesso');
  }
});