import { PrismaClient } from '@prisma/client';
import { HomepageData } from '../../../shared/types/homepage';
import { homepageService } from '../services/homepageService';

const prisma = new PrismaClient();

// Default homepage content based on the existing portfolio
const defaultHomepageContent: HomepageData = {
  hero: {
    title: "Product Designer & Manager",
    description: "Hey, Je suis Lawson Sydney, Je transforme vos idées en applications mobiles et sites web qui répondent aux vrais besoins de vos utilisateurs.",
    videoUrl: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/vbreel2025.mp4"
  },
  brands: {
    title: "Je travaille avec des clients fabuleux",
    logos: [
      { id: 1, name: "Client 1", logoUrl: "/images/logo-01.svg", order: 1 },
      { id: 2, name: "Client 2", logoUrl: "/images/logo-02.svg", order: 2 },
      { id: 3, name: "Client 3", logoUrl: "/images/logo-03.svg", order: 3 },
      { id: 4, name: "Client 4", logoUrl: "/images/logo-04.svg", order: 4 }
    ]
  },
  services: {
    title: "Services",
    description: "Je me focalise sur 3 services de design qui vous aideront à créer des expériences numériques exceptionnelles.",
    services: [
      {
        id: 1,
        number: "1.",
        title: "Produits",
        description: "Des produits qui répondent aux vrais besoins de vos utilisateurs et qui génèrent des résultats mesurables.",
        link: "work@filter=website.html#options",
        colorClass: "services_bg_colored"
      },
      {
        id: 2,
        number: "2.",
        title: "Apps",
        description: "Je crée des apps mobiles fluides et intuitives qui offrent une expérience utilisateur exceptionnelle.",
        link: "work@filter=product.html#options",
        colorClass: ""
      },
      {
        id: 3,
        number: "3.",
        title: "Sites Web",
        description: "Des sites web performants et responsifs qui convertissent vos visiteurs en clients fidèles.",
        link: "work@filter=mobile.html#options",
        colorClass: ""
      }
    ]
  },
  offer: {
    title: "M'engager c'est...",
    points: [
      { id: 1, text: "Trouver un partenaire qui a coeur votre développement.", order: 1 },
      { id: 2, text: "Bénéficier d'une approche centrée sur l'utilisateur.", order: 2 },
      { id: 3, text: "Obtenir des solutions créatives et innovantes.", order: 3 },
      { id: 4, text: "Profiter d'un suivi personnalisé tout au long du projet.", order: 4 }
    ]
  },
  testimonials: {
    testimonials: [
      {
        id: 1,
        text: "J'ai eu le privilège de travailler avec Lawson sur plusieurs projets et je peux dire sans hésitation qu'il est l'un des designers les plus talentueux avec qui j'ai collaboré.",
        clientName: "Jasen Dowell",
        clientTitle: "CEO, Savills Stacker",
        clientPhoto: "/images/img-jasen.png",
        projectLink: "https://apps.apple.com/us/app/stacker/id1234567890",
        projectImage: "/images/img-case-stacker.png",
        order: 1
      }
    ]
  },
  footer: {
    title: "Construisons Ensemble",
    email: "s.lawson@killingiants.com",
    copyright: "© 2025 Lawson Sydney — Comme Betsaleel, je construis avec excellence.",
    links: {
      site: [
        { text: "Accueil", url: "index.html" },
        { text: "Services", url: "services.html" },
        { text: "Travaux", url: "work.html" },
        { text: "À propos", url: "about.html" },
        { text: "Contact", url: "contact.html" }
      ],
      professional: [
        { text: "LinkedIn", url: "https://linkedin.com/in/lawsonsydney" },
        { text: "Dribbble", url: "https://dribbble.com/lawsonsydney" },
        { text: "Behance", url: "https://behance.net/lawsonsydney" }
      ],
      social: [
        { text: "Facebook", url: "https://facebook.com/lawsonsydney" },
        { text: "Instagram", url: "https://instagram.com/lawsonsydney" },
        { text: "Twitter", url: "https://twitter.com/lawsonsydney" }
      ]
    }
  }
};

async function initializeHomepageContent() {
  try {
    console.log('🚀 Initializing homepage content...');

    // Check if content already exists
    const existingContent = await homepageService.getAllContent();
    
    if (existingContent.length > 0) {
      console.log('📋 Homepage content already exists. Skipping initialization.');
      console.log(`Found ${existingContent.length} existing content entries.`);
      return;
    }

    // Initialize with default content
    console.log('📝 Creating default homepage content...');

    // Hero section
    await homepageService.upsertContent({
      section: 'hero',
      fieldName: 'title',
      fieldValue: defaultHomepageContent.hero.title,
      fieldType: 'text',
      displayOrder: 1
    });

    await homepageService.upsertContent({
      section: 'hero',
      fieldName: 'description',
      fieldValue: defaultHomepageContent.hero.description,
      fieldType: 'textarea',
      displayOrder: 2
    });

    await homepageService.upsertContent({
      section: 'hero',
      fieldName: 'videoUrl',
      fieldValue: defaultHomepageContent.hero.videoUrl,
      fieldType: 'url',
      displayOrder: 3
    });

    // Brands section
    await homepageService.upsertContent({
      section: 'brands',
      fieldName: 'title',
      fieldValue: defaultHomepageContent.brands.title,
      fieldType: 'text',
      displayOrder: 1
    });

    await homepageService.upsertContent({
      section: 'brands',
      fieldName: 'logos',
      fieldValue: JSON.stringify(defaultHomepageContent.brands.logos),
      fieldType: 'json',
      displayOrder: 2
    });

    // Services section
    await homepageService.upsertContent({
      section: 'services',
      fieldName: 'title',
      fieldValue: defaultHomepageContent.services.title,
      fieldType: 'text',
      displayOrder: 1
    });

    await homepageService.upsertContent({
      section: 'services',
      fieldName: 'description',
      fieldValue: defaultHomepageContent.services.description,
      fieldType: 'textarea',
      displayOrder: 2
    });

    await homepageService.upsertContent({
      section: 'services',
      fieldName: 'services',
      fieldValue: JSON.stringify(defaultHomepageContent.services.services),
      fieldType: 'json',
      displayOrder: 3
    });

    // Offer section
    await homepageService.upsertContent({
      section: 'offer',
      fieldName: 'title',
      fieldValue: defaultHomepageContent.offer.title,
      fieldType: 'text',
      displayOrder: 1
    });

    await homepageService.upsertContent({
      section: 'offer',
      fieldName: 'points',
      fieldValue: JSON.stringify(defaultHomepageContent.offer.points),
      fieldType: 'json',
      displayOrder: 2
    });

    // Testimonials section
    await homepageService.upsertContent({
      section: 'testimonials',
      fieldName: 'testimonials',
      fieldValue: JSON.stringify(defaultHomepageContent.testimonials.testimonials),
      fieldType: 'json',
      displayOrder: 1
    });

    // Footer section
    await homepageService.upsertContent({
      section: 'footer',
      fieldName: 'title',
      fieldValue: defaultHomepageContent.footer.title,
      fieldType: 'text',
      displayOrder: 1
    });

    await homepageService.upsertContent({
      section: 'footer',
      fieldName: 'email',
      fieldValue: defaultHomepageContent.footer.email,
      fieldType: 'text',
      displayOrder: 2
    });

    await homepageService.upsertContent({
      section: 'footer',
      fieldName: 'copyright',
      fieldValue: defaultHomepageContent.footer.copyright,
      fieldType: 'text',
      displayOrder: 3
    });

    await homepageService.upsertContent({
      section: 'footer',
      fieldName: 'links',
      fieldValue: JSON.stringify(defaultHomepageContent.footer.links),
      fieldType: 'json',
      displayOrder: 4
    });

    // Create initial version
    console.log('💾 Creating initial version...');
    await homepageService.createVersion('Initial content', defaultHomepageContent);

    console.log('✅ Homepage content initialized successfully!');
    console.log('📊 Summary:');
    console.log('  - Hero section: 3 fields');
    console.log('  - Brands section: 2 fields');
    console.log('  - Services section: 3 fields');
    console.log('  - Offer section: 2 fields');
    console.log('  - Testimonials section: 1 field');
    console.log('  - Footer section: 4 fields');
    console.log('  - Initial version created');

  } catch (error) {
    console.error('❌ Error initializing homepage content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeHomepageContent()
    .then(() => {
      console.log('🎉 Homepage initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Homepage initialization failed:', error);
      process.exit(1);
    });
}

export { initializeHomepageContent, defaultHomepageContent };