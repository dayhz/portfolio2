/* JavaScript extrait de work.html */

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
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectsWrapper = document.querySelector('#projects-wrapper'); // novo wrapper interno
  const originalProjects = document.querySelectorAll('#projects-wrapper a');
  const filterCounts = document.querySelectorAll('.filter-count');

  const FILTERS = ['all', 'website', 'product', 'mobile', 'app'];

  function updateCounts() {
    const counts = FILTERS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    originalProjects.forEach(project => {
      const categories = (project.getAttribute('project-category') || '').split(',').map(c => c.trim());
      counts.all++;
      categories.forEach(cat => {
        if (counts[cat] !== undefined) counts[cat]++;
      });
    });

    filterCounts.forEach(countEl => {
      const filter = countEl.parentElement.getAttribute('data-filter');
      const value = counts[filter] || 0;
      countEl.setAttribute('data-count', value);
      countEl.textContent = value;
    });
  }

  function applyFilter(filterValue) {
    filterButtons.forEach(btn => btn.classList.remove('is-active'));
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
    if (activeBtn) activeBtn.classList.add('is-active');

    projectsWrapper.innerHTML = '';
		const allProjects = Array.from(originalProjects);
		const fragment = document.createDocumentFragment();

    if (filterValue === 'all') {
      const firstContainer = document.createElement('div');
      firstContainer.className = 'projects-container u-grid-2-colls';

      const spacer = document.createElement('div');
      spacer.className = 'g_section_space w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490';

      const secondContainer = document.createElement('div');
      secondContainer.className = 'projects-container u-grid-3-colls';

      allProjects.forEach((project, index) => {
        const clone = project.cloneNode(true);
        clone.setAttribute('fade-in', '');
        clone.style.opacity = '1';

        if (index < 6) {
          firstContainer.appendChild(clone);
        } else {
          secondContainer.appendChild(clone);
        }
      });

      fragment.appendChild(firstContainer);
      fragment.appendChild(spacer);
      fragment.appendChild(secondContainer);
    } else {
      const container = document.createElement('div');
      container.className = 'projects-container u-grid-3-colls';

      allProjects.forEach(project => {
        const categories = (project.getAttribute('project-category') || '').split(',').map(c => c.trim());
        if (categories.includes(filterValue)) {
          const clone = project.cloneNode(true);
          clone.setAttribute('fade-in', '');
          clone.style.opacity = '1';
          container.appendChild(clone);
        }
      });

      fragment.appendChild(container);
    }

    projectsWrapper.appendChild(fragment);

    // Fade-in animado com GSAP
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        projectsWrapper.querySelectorAll('[fade-in]'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: {each: 0.05, from: 'start', delay: 0.4}, ease: 'power2.out', delay: 0.4 }
      );
    }
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const filterValue = button.getAttribute('data-filter');
      applyFilter(filterValue);
      history.pushState({}, document.title, `?filter=${filterValue}`);
    });
  });

  updateCounts();
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  applyFilter(FILTERS.includes(filterParam) ? filterParam : 'all');
});

/* Script 5 */
window.__WEBFLOW_CURRENCY_SETTINGS = {"currencyCode":"USD","symbol":"$","decimal":".","fractionDigits":2,"group":",","template":"{{wf {\"path\":\"symbol\",\"type\":\"PlainText\"} }} {{wf {\"path\":\"amount\",\"type\":\"CommercePrice\"} }} {{wf {\"path\":\"currencyCode\",\"type\":\"PlainText\"} }}","hideDecimalForWholeNumbers":false};

/* Script 6 */
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

/* Script 7 */
gsap.registerPlugin(ScrollTrigger,SplitText);

/* Script 8 */
document.addEventListener("DOMContentLoaded", function() {function loadlawsonsydneyportfolio(e){let t=document.createElement("script");t.setAttribute("src",e),t.setAttribute("type","module"),document.body.appendChild(t),t.addEventListener("load",()=>{console.log("Slater loaded Lawson Sydney Portfolio.js: https://slater.app/14220.js 🤙")}),t.addEventListener("error",e=>{console.log("Error loading file",e)})}let src=window.location.host.includes("webflow.io")?"https://slater.app/14220.js":"https://assets.slater.app/slater/14220.js?v=1.0";loadlawsonsydneyportfolio(src);})

/* Script 9 */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    console.log('Plugins GSAP registrados com sucesso');
  });

