const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
const axios = require('axios');

const app = express();
const PORT = 3001;

// Configuration
const CMS_API_URL = 'http://localhost:8000/api';
const STATIC_DIR = path.join(__dirname, 'www.victorberbel.work');

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (CSS, JS, images)
app.use('/css', express.static(path.join(STATIC_DIR, 'css')));
app.use('/js', express.static(path.join(STATIC_DIR, 'js')));
app.use('/images', express.static(path.join(STATIC_DIR, 'images')));
app.use('/fonts', express.static(path.join(STATIC_DIR, 'fonts')));
app.use('/videos', express.static(path.join(STATIC_DIR, 'videos')));

// Proxy pour les uploads du CMS
app.use('/uploads', async (req, res) => {
  try {
    const response = await axios.get(`${CMS_API_URL.replace('/api', '')}/uploads${req.path}`, {
      responseType: 'stream'
    });
    
    // Copier les headers de contenu
    if (response.headers['content-type']) {
      res.set('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.set('Content-Length', response.headers['content-length']);
    }
    
    // Pipe la réponse
    response.data.pipe(res);
  } catch (error) {
    console.log(`❌ Failed to proxy upload: ${req.path}`);
    res.status(404).send('Image not found');
  }
});

// Fonction pour récupérer les données du CMS
async function getCMSData(endpoint) {
  try {
    const response = await axios.get(`${CMS_API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.log(`❌ CMS API not available for ${endpoint}:`, error.message);
    return null;
  }
}

// Fonction pour récupérer le HTML généré du projet depuis le CMS
async function getProjectHTML(projectId) {
  try {
    const response = await axios.get(`${CMS_API_URL}/template-projects/${projectId}/html`);
    return response.data;
  } catch (error) {
    console.log(`❌ Failed to get project HTML from CMS: ${error.message}`);
    return null;
  }
}

// Fonction pour remplacer TOUS les projets par les projets CMS
function injectProjectsIntoHTML(html, projects) {
  // Générer le HTML pour les projets du CMS
  const projectsHTML = projects.length > 0 ? projects.slice(0, 6).map(project => `
       <a class="work_card w-inline-block" fade-in="" href="${project.slug || project.id}.html" id="w-node-cd0c8328-2622-8d6b-295f-f4d5926d9154-926d9154" project-category="all">
        <div class="work_img">
         <img alt="${project.title}" class="work_card_img" loading="lazy" 
              src="${project.imageUrl || '/images/placeholder-project.jpg'}" />
        </div>
        <div class="work_card_text_footer">
         <div class="work_card_text_title">
          <h3 class="u-text-style-large u-color-dark">
           ${project.title}
          </h3>
         </div>
         <div class="u-text-style-small u-color-gray-900">
          ${project.description}
         </div>
        </div>
        <div class="card-hover w-embed">
        </div>
       </a>`).join('') : '       <!-- Aucun projet dans le CMS -->';
  
  // Remplacer TOUT le contenu du work_main_grid_group (tous les projets statiques)
  const workGridRegex = /(<div class="work_main_grid_group">\s*)([\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/;
  
  if (workGridRegex.test(html)) {
    const newHTML = html.replace(workGridRegex, `$1${projectsHTML}$3`);
    console.log('✅ Replaced ALL static projects with', projects.length, 'CMS projects');
    return newHTML;
  } else {
    console.log('⚠️  Could not find work_main_grid_group section to replace projects');
    return html;
  }
}

// Fonction pour injecter le contenu Hero du CMS
function injectHeroContentIntoHTML(html, heroData) {
  if (!heroData) {
    console.log('⚠️  No hero data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter le titre Hero
  if (heroData.title) {
    const titleRegex = /<h1 class="u-text-style-display">\s*([^<]+)\s*<\/h1>/;
    updatedHTML = updatedHTML.replace(titleRegex, `<h1 class="u-text-style-display">
        ${heroData.title}
       </h1>`);
  }

  // Injecter la description Hero
  if (heroData.description) {
    const descriptionRegex = /<div class="u-text-style-regular u-color-gray-900" data-hero-description="">\s*[\s\S]*?<\/div>/;
    updatedHTML = updatedHTML.replace(descriptionRegex, `<div class="u-text-style-regular u-color-gray-900" data-hero-description="">
         ${heroData.description}
        </div>`);
  }

  // Injecter l'URL de la vidéo Hero
  if (heroData.videoUrl) {
    const videoRegex = /<source src="[^"]*" type="video\/mp4"\/>/;
    updatedHTML = updatedHTML.replace(videoRegex, `<source src="${heroData.videoUrl}" type="video/mp4"/>`);
  }

  console.log('✅ Injected Hero content from CMS');
  return updatedHTML;
}

// Fonction pour injecter le contenu Brands du CMS
function injectBrandsContentIntoHTML(html, brandsData) {
  if (!brandsData) {
    console.log('⚠️  No brands data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter le titre de la section brands (chercher spécifiquement dans la section brands)
  if (brandsData.title) {
    // Chercher le titre dans la section brands_hover_group
    const titleRegex = /(<div class="brands_hover_group">\s*<div class="u-text-style-1rem">)\s*([^<]+)\s*(<\/div>)/;
    updatedHTML = updatedHTML.replace(titleRegex, `$1
          ${brandsData.title}
         $3`);

  }

  // Injecter les logos dans le marquee
  if (brandsData.logos && brandsData.logos.length > 0) {
    // Générer le HTML pour les logos
    const logosHTML = brandsData.logos.map(logo => `
           <div class="brands_main_group-item">
            <img alt="${logo.name}" class="brands_main_group-img" loading="lazy" src="${logo.logoUrl}"/>
           </div>`).join('');

    // Dupliquer les logos pour créer un effet de marquee continu
    const duplicatedLogosHTML = logosHTML + logosHTML;

    // Remplacer tout le contenu du marquee_track
    const marqueeRegex = /<div class="marquee_track">\s*[\s\S]*?<\/div>/;
    updatedHTML = updatedHTML.replace(marqueeRegex, `<div class="marquee_track">
${duplicatedLogosHTML}
          </div>`);

    console.log('✅ Injected', brandsData.logos.length, 'brand logos from CMS');
  }

  return updatedHTML;
}

// Fonction pour injecter le contenu Services du CMS
function injectServicesContentIntoHTML(html, servicesData) {
  if (!servicesData) {
    console.log('⚠️  No services data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter le titre de la section services (utiliser le texte exact "Services")
  if (servicesData.title) {
    // Chercher spécifiquement le titre "Services" dans la section services_main_wrap
    const servicesPattern = /(section class="services_main_wrap">[\s\S]*?<h2 class="u-text-style-h2" text-split="">\s*)Services(\s*<\/h2>)/;
    
    if (servicesPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(servicesPattern, `$1${servicesData.title}$2`);
      console.log('✅ Injected services title:', servicesData.title);
    } else {
      console.log('⚠️  Services title "Services" not found in services_main_wrap section');
    }
  }

  // Injecter la description de la section services (approche très ciblée)
  if (servicesData.description) {
    // Utiliser une regex très spécifique qui inclut le contexte de la section services
    const descriptionRegex = /(section class="services_main_wrap">[\s\S]*?<p class="u-text-style-large teste">\s*)[\s\S]*?(\s*<\/p>)/;
    if (descriptionRegex.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(descriptionRegex, `$1${servicesData.description}$2`);
      console.log('✅ Injected services description');
    } else {
      console.log('⚠️  Services description pattern not found');
    }
  }

  // Injecter les services individuels
  if (servicesData.services && servicesData.services.length > 0) {
    // Générer le HTML pour les services
    const servicesHTML = servicesData.services.map(service => {
      // Déterminer la classe de couleur basée sur les données CMS
      let colorClass = 'services_bg_colored'; // Par défaut
      if (service.colorClass && service.colorClass.includes('services_bg_colored')) {
        colorClass = service.colorClass;
      }

      return `
       <a class="services_link w-inline-block" data-w-id="8ac0aab0-cf9b-9983-13d5-44e1e7191eed" data-wf--services-link--variant="base" fade-in="" href="${service.link}">
        <div class="services_top_wrp">
         <div class="services_text-group">
          <div class="u-text-style-large item-link">
           ${service.number}
          </div>
          <div class="u-text-style-h3">
           ${service.title}
          </div>
         </div>
         <div class="services_bullet_wrp">
          <div class="services_bullet">
           <div class="services_title">
            See projects
           </div>
           <div class="${colorClass}">
           </div>
           <div class="services_bg_black">
           </div>
          </div>
         </div>
        </div>
        <div class="services_bottom_wrp">
         <p class="service_description">
          ${service.description}
         </p>
        </div>
        <div class="service_shadow">
        </div>
       </a>`;
    }).join('');

    // Remplacer tout le contenu du services_group_link (y compris les 3 services statiques existants)
    // Utiliser une regex qui capture spécifiquement les 3 liens de services
    const servicesGroupRegex = /<div class="services_group_link">\s*((?:<a class="services_link[\s\S]*?<\/a>\s*){3})\s*<\/div>/;
    
    if (servicesGroupRegex.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(servicesGroupRegex, `<div class="services_group_link">
${servicesHTML}
      </div>`);
      console.log('✅ Successfully replaced 3 static services with CMS services');
    } else {
      console.log('⚠️  Could not find 3 static services to replace');
    }

    console.log('✅ Injected', servicesData.services.length, 'services from CMS');
  }

  return updatedHTML;
}

// Fonction pour injecter le contenu Offer du CMS
function injectOfferContentIntoHTML(html, offerData) {
  if (!offerData) {
    console.log('⚠️  No offer data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter le titre de la section offer ("Together, we can...")
  if (offerData.title) {
    const titlePattern = /(<h2 class="u-text-style-h2"[^>]*>\s*)Together, we can\.\.\.(\s*<\/h2>)/;
    
    if (titlePattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(titlePattern, `$1${offerData.title}$2`);
      console.log('✅ Injected offer title:', offerData.title);
    } else {
      console.log('⚠️  Offer title "Together, we can..." not found');
    }
  }

  // Injecter les points de valeur
  if (offerData.points && offerData.points.length > 0) {
    // Générer le HTML pour les points
    const pointsHTML = offerData.points
      .sort((a, b) => a.order - b.order)
      .map(point => `
         <div class="offer_text_wrp" data-w-id="6cfc2d39-7769-857a-c09f-9c09760358dd" fade-in="">
          <div class="orange_dot">
          </div>
          <div class="u-text-style-regular diff01">
           ${point.text}
          </div>
         </div>`).join('');

    // Remplacer tout le contenu des offer_texts_group
    const pointsGroupRegex = /(<div class="offer_texts_group">\s*)((?:<div class="offer_text_wrp"[\s\S]*?<\/div>\s*){4})(\s*<\/div>)/;
    
    if (pointsGroupRegex.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(pointsGroupRegex, `$1${pointsHTML}$3`);
      console.log('✅ Injected', offerData.points.length, 'offer points from CMS');
    } else {
      console.log('⚠️  Could not find offer points section to replace');
    }
  }

  return updatedHTML;
}

// Fonction pour injecter le contenu Testimonials du CMS
function injectTestimonialsContentIntoHTML(html, testimonialsData) {
  if (!testimonialsData) {
    console.log('⚠️  No testimonials data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter les témoignages
  if (testimonialsData.testimonials && testimonialsData.testimonials.length > 0) {
    // Trier les témoignages par ordre
    const sortedTestimonials = testimonialsData.testimonials.sort((a, b) => a.order - b.order);
    
    // Générer le HTML pour les témoignages
    const testimonialsHTML = sortedTestimonials.map(testimonial => `
        <div class="clientes-slide w-slide">
         <div class="testimonials-card" data-w-id="7f8594a2-1a89-6150-e0ab-ef47ae7a4fc7">
          <div class="testimonials-card-left">
           <div class="testimonial-text u-color-dark">
            "${testimonial.text}"
           </div>
           <div class="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf--global-section-space--section-space="even">
           </div>
           <div class="testimonials-card-person-group">
            <img alt="${testimonial.clientName}" class="testimonials-avatar" loading="lazy" src="${testimonial.clientPhoto}"/>
            <div class="testimonials-person-info">
             <div class="u-text-style-big">
              ${testimonial.clientName}
             </div>
             <div class="u-text-style-1rem u-color-gray-900">
              ${testimonial.clientTitle}
             </div>
            </div>
           </div>
          </div>
          <div class="testimonials-card-right">
           <div class="testimonial_card_img">
            <img alt="${testimonial.clientName} project" class="testimonials-person-thumb" loading="lazy" sizes="100vw" src="${testimonial.projectImage}"/>
           </div>
           <div class="testimonials-card-right-group">
            <div class="div-block-26">
             <a class="c-global-link uline-double small-3 w-inline-block" fade-in="" href="${testimonial.projectLink}" ${testimonial.projectLink.startsWith('http') ? 'target="_blank"' : ''}>
              <div class="text-link is-footer small-4">
               See the full case study
              </div>
              <div class="w-embed">
              </div>
             </a>
            </div>
           </div>
           <a class="area_link w-inline-block" data-w-id="50f1e4da-acc4-76d9-1f3f-b24d9de50a3e" href="${testimonial.projectLink}" ${testimonial.projectLink.startsWith('http') ? 'target="_blank"' : ''}>
           </a>
          </div>
         </div>
        </div>`).join('');

    // Remplacer tout le contenu du slider mask (tous les slides de témoignages)
    const sliderMaskRegex = /(<div class="mask w-slider-mask">\s*)([\s\S]*?)(\s*<\/div>\s*<div class="left-arrow w-slider-arrow-left">)/;
    
    if (sliderMaskRegex.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(sliderMaskRegex, `$1${testimonialsHTML}$3`);
      console.log('✅ Injected', sortedTestimonials.length, 'testimonials from CMS');
    } else {
      console.log('⚠️  Could not find testimonials slider section to replace');
    }
  }

  return updatedHTML;
}

// Fonction pour injecter le contenu Footer du CMS
function injectFooterContentIntoHTML(html, footerData) {
  if (!footerData) {
    console.log('⚠️  No footer data from CMS, using static content');
    return html;
  }

  let updatedHTML = html;

  // Injecter le titre du footer ("Let's work together")
  if (footerData.title) {
    // Remplacer tout le contenu entre les balises div
    const titlePattern = /(<div class="u-text-style-h4 u-color-gray-700" data-w-id="15828fe9-b698-9ed3-3a55-9a383fb763b2">)[\s\S]*?(<\/div>)/;
    
    if (titlePattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(titlePattern, `$1
         ${footerData.title}
        $2`);
      console.log('✅ Injected footer title:', footerData.title);
    } else {
      console.log('⚠️  Footer title div not found');
    }
  }

  // Injecter l'email de contact
  if (footerData.email) {
    // Remplacer l'email dans le href et le texte
    const emailHrefPattern = /(href="mailto:)[^"]*(")/;
    const emailTextPattern = /(<div class="text-link is-footer">\s*)hey@lawsonsydney\.work(\s*<\/div>)/;
    
    if (emailHrefPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(emailHrefPattern, `$1${footerData.email}$2`);
      console.log('✅ Injected footer email href:', footerData.email);
    } else {
      console.log('⚠️  Email href pattern not found');
    }
    
    if (emailTextPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(emailTextPattern, `$1${footerData.email}$2`);
      console.log('✅ Injected footer email text:', footerData.email);
    } else {
      console.log('⚠️  Email text pattern not found');
    }
  }

  // Injecter les titres des sections de liens
  if (footerData.links) {
    // Remplacer "Explore" par "Navigation"
    const explorePattern = /(<div class="u-color-gray-700 u-mb-2">\s*)Explore(\s*<\/div>)/;
    if (explorePattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(explorePattern, `$1Navigation$2`);
      console.log('✅ Replaced "Explore" with "Navigation"');
    }

    // Remplacer "Socials" par "Réseaux Pro"  
    const socialsPattern = /(<div class="u-color-gray-700 u-mb-2">\s*)Socials(\s*<\/div>)/;
    if (socialsPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(socialsPattern, `$1Réseaux Pro$2`);
      console.log('✅ Replaced "Socials" with "Réseaux Pro"');
    }
  }

  // Injecter les liens de navigation du site
  if (footerData.links && footerData.links.site && footerData.links.site.length > 0) {
    const siteLinksHTML = footerData.links.site.map(link => `
                                                                <li class="u-mb-1">
                                                                        <a class="link" href="${link.url}">
                                                                                ${link.text}
                                                                        </a>
                                                                </li>`).join('');

    // Remplacer les liens de navigation du site (première liste ul)
    const siteLinksPattern = /(<ul class="u-text-style-regular"\s+id="w-node-_15828fe9-b698-9ed3-3a55-9a383fb763bd-3fb763ab"\s+role="list">\s*)([\s\S]*?)(\s*<\/ul>)/;
    
    if (siteLinksPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(siteLinksPattern, `$1${siteLinksHTML}$3`);
      console.log('✅ Injected', footerData.links.site.length, 'site navigation links');
    } else {
      console.log('⚠️  Site links pattern not found');
    }
  }

  // Injecter les liens professionnels (deuxième liste)
  if (footerData.links && footerData.links.professional && footerData.links.professional.length > 0) {
    const professionalLinksHTML = footerData.links.professional.map(link => `
                                                                <li class="u-mb-1">
                                                                        <a class="link" href="${link.url}" target="_blank">
                                                                                ${link.text}
                                                                        </a>
                                                                </li>`).join('');

    // Remplacer les liens professionnels (deuxième liste ul)
    const professionalLinksPattern = /(<ul class="u-text-style-regular"\s+id="w-node-_15828fe9-b698-9ed3-3a55-9a383fb763cd-3fb763ab"\s+role="list">\s*)([\s\S]*?)(\s*<\/ul>)/;
    
    if (professionalLinksPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(professionalLinksPattern, `$1${professionalLinksHTML}$3`);
      console.log('✅ Injected', footerData.links.professional.length, 'professional links');
    } else {
      console.log('⚠️  Professional links pattern not found');
    }
  }

  // Injecter les liens sociaux (troisième liste) avec titre
  if (footerData.links && footerData.links.social && footerData.links.social.length > 0) {
    const socialLinksHTML = footerData.links.social.map(link => `
                                                                <li class="u-mb-1">
                                                                        <a class="link" href="${link.url}" target="_blank">
                                                                                ${link.text}
                                                                        </a>
                                                                </li>`).join('');

    // Ajouter un titre "Réseaux Sociaux" avant la troisième liste
    const socialTitlePattern = /(<ul class="u-text-style-regular"\s+id="w-node-_15828fe9-b698-9ed3-3a55-9a383fb763da-3fb763ab")/;
    if (socialTitlePattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(socialTitlePattern, `<div class="u-mb-3">
         <div class="u-color-gray-700 u-mb-2">
          Réseaux Sociaux
         </div>
        </div>
        $1`);
      console.log('✅ Added "Réseaux Sociaux" title before social links');
    }

    // Remplacer les liens sociaux (troisième liste ul)
    const socialLinksPattern = /(<ul class="u-text-style-regular"\s+id="w-node-_15828fe9-b698-9ed3-3a55-9a383fb763da-3fb763ab"\s+role="list">\s*)([\s\S]*?)(\s*<\/ul>)/;
    
    if (socialLinksPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(socialLinksPattern, `$1${socialLinksHTML}$3`);
      console.log('✅ Injected', footerData.links.social.length, 'social links');
    } else {
      console.log('⚠️  Social links pattern not found');
    }
  }

  // Injecter le copyright
  if (footerData.copyright) {
    const copyrightPattern = /(<a class="footer-info-text" href="privacy\.html">\s*)© 2025 Lawson Sydney — Designin' Incredibly Dope Shit Since '08\./;
    
    if (copyrightPattern.test(updatedHTML)) {
      updatedHTML = updatedHTML.replace(copyrightPattern, `$1${footerData.copyright}`);
      console.log('✅ Injected footer copyright:', footerData.copyright);
    } else {
      console.log('⚠️  Footer copyright text not found');
      // Essayer un pattern plus flexible
      const flexibleCopyrightPattern = /(<a class="footer-info-text" href="privacy\.html">\s*)© 2025 Lawson Sydney[^<]*(\s*<span)/;
      if (flexibleCopyrightPattern.test(updatedHTML)) {
        updatedHTML = updatedHTML.replace(flexibleCopyrightPattern, `$1${footerData.copyright}$2`);
        console.log('✅ Injected footer copyright (flexible pattern):', footerData.copyright);
      }
    }
  }

  return updatedHTML;
}

// Route pour la homepage
app.get('/', async (req, res) => {
  try {
    // Lire le template HTML original
    let htmlTemplate = await fs.readFile(path.join(STATIC_DIR, 'index.html'), 'utf8');
    
    // Récupérer les données Hero du CMS
    const heroData = await getCMSData('/homepage/hero');
    const heroContent = heroData?.data || null;
    
    // Récupérer les données Brands du CMS
    const brandsData = await getCMSData('/homepage/brands');
    const brandsContent = brandsData?.data || null;
    
    // Récupérer les données Services du CMS
    const servicesData = await getCMSData('/homepage/services');
    const servicesContent = servicesData?.data || null;
    
    // Récupérer les données Offer du CMS
    const offerData = await getCMSData('/homepage/offer');
    const offerContent = offerData?.data || null;
    
    // Récupérer les données Testimonials du CMS
    const testimonialsData = await getCMSData('/homepage/testimonials');
    const testimonialsContent = testimonialsData?.data || null;
    
    // Récupérer les données Footer du CMS
    const footerData = await getCMSData('/homepage/footer');
    const footerContent = footerData?.data || null;
    
    // Récupérer les projets du CMS
    const projects = await getCMSData('/projects') || [];
    
    console.log('📊 Homepage: Loaded Hero, Brands, Services, Offer, Testimonials, Footer content, and', projects.length, 'projects from CMS');
    
    // Injecter le contenu Hero du CMS
    htmlTemplate = injectHeroContentIntoHTML(htmlTemplate, heroContent);
    
    // Injecter le contenu Brands du CMS
    htmlTemplate = injectBrandsContentIntoHTML(htmlTemplate, brandsContent);
    
    // Injecter le contenu Services du CMS
    htmlTemplate = injectServicesContentIntoHTML(htmlTemplate, servicesContent);
    
    // Injecter le contenu Offer du CMS
    htmlTemplate = injectOfferContentIntoHTML(htmlTemplate, offerContent);
    
    // Injecter le contenu Testimonials du CMS
    htmlTemplate = injectTestimonialsContentIntoHTML(htmlTemplate, testimonialsContent);
    
    // Injecter le contenu Footer du CMS
    htmlTemplate = injectFooterContentIntoHTML(htmlTemplate, footerContent);
    
    // TOUJOURS remplacer les projets statiques par les projets CMS (même si vide)
    htmlTemplate = injectProjectsIntoHTML(htmlTemplate, projects);
    
    res.send(htmlTemplate);
    
  } catch (error) {
    console.error('Error serving homepage:', error);
    res.status(500).send('Error loading homepage');
  }
});

// Route pour la page About
app.get('/about', async (req, res) => {
  try {
    const htmlTemplate = await fs.readFile(path.join(STATIC_DIR, 'about.html'), 'utf8');
    
    // Récupérer les données About du CMS
    const aboutData = await getCMSData('/about') || null;
    
    res.send(htmlTemplate);
    
  } catch (error) {
    console.error('Error serving about page:', error);
    res.status(500).send('Error loading about page');
  }
});

// Route pour les pages de projet dynamiques
app.get('/:slug.html', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // D'abord, essayer de servir un fichier statique existant
    const htmlFile = path.join(STATIC_DIR, `${slug}.html`);
    try {
      const htmlTemplate = await fs.readFile(htmlFile, 'utf8');
      return res.send(htmlTemplate);
    } catch (err) {
      // Le fichier n'existe pas, vérifier si c'est un projet
    }
    
    // Récupérer tous les projets pour trouver celui qui correspond au slug
    const projects = await getCMSData('/projects') || [];
    const project = projects.find(p => (p.slug === slug) || (p.id === slug));
    
    if (project) {
      // Rediriger vers la page React du CMS avec isPreview=false
      return res.redirect(`http://localhost:3000/project/${project.id}?preview=false`);
    }
    
    // Si aucun projet trouvé, retourner 404
    res.status(404).send('Page not found');
    
  } catch (error) {
    console.error('Error serving page:', error);
    res.status(500).send('Error loading page');
  }
});

// Route pour les pages sans extension (pour compatibilité)
app.get('/:page', async (req, res) => {
  try {
    const page = req.params.page;
    const htmlFile = path.join(STATIC_DIR, `${page}.html`);
    
    // Vérifier si le fichier existe
    try {
      const htmlTemplate = await fs.readFile(htmlFile, 'utf8');
      res.send(htmlTemplate);
    } catch (err) {
      res.status(404).send('Page not found');
    }
    
  } catch (error) {
    console.error('Error serving page:', error);
    res.status(500).send('Error loading page');
  }
});

app.listen(PORT, () => {
  console.log(`🎨 Portfolio site running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${STATIC_DIR}`);
  console.log(`🔗 CMS API: ${CMS_API_URL}`);
  console.log('');
  console.log('📄 Available pages:');
  console.log(`   http://localhost:${PORT}/ (Homepage)`);
  console.log(`   http://localhost:${PORT}/about`);
  console.log(`   http://localhost:${PORT}/services`);
  console.log(`   http://localhost:${PORT}/contact`);
});