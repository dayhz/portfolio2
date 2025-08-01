import { PrismaClient } from '@prisma/client';
import { ServicesData } from '../../../shared/types/services';

const prisma = new PrismaClient();

// Default services data based on the existing services.html
const defaultServicesData: ServicesData = {
  id: 'services-page',
  version: 1,
  lastModified: new Date(),
  isPublished: false,
  hero: {
    title: 'Services',
    description: 'Independent Product Designer with over 17 years of experience designing websites, SaaS platforms, and mobile apps from big corporations to small startups.',
    highlightText: '17+ years'
  },
  services: {
    services: [
      {
        id: 'website',
        number: 1,
        title: 'Website',
        description: 'From concept to launch, I design and develop responsive websites that engage users and drive results.',
        color: '#FF6B6B',
        colorClass: 'service-red',
        order: 1
      },
      {
        id: 'product',
        number: 2,
        title: 'Product',
        description: 'I create intuitive digital products that solve real problems and deliver exceptional user experiences.',
        color: '#4ECDC4',
        colorClass: 'service-teal',
        order: 2
      },
      {
        id: 'mobile',
        number: 3,
        title: 'Mobile',
        description: 'Native and cross-platform mobile apps designed with user-first approach and modern design principles.',
        color: '#45B7D1',
        colorClass: 'service-blue',
        order: 3
      }
    ]
  },
  skillsVideo: {
    description: 'The ideal balance between UX and UI is what makes a winning product. The sweet spot is the combination of both, and my four-step process gives you the ultimate framework for design.',
    skills: [
      { id: 'ux-design', name: 'UX Design', order: 1 },
      { id: 'ui-design', name: 'UI Design', order: 2 },
      { id: 'prototyping', name: 'Prototyping', order: 3 },
      { id: 'user-research', name: 'User Research', order: 4 },
      { id: 'wireframing', name: 'Wireframing', order: 5 },
      { id: 'design-systems', name: 'Design Systems', order: 6 },
      { id: 'responsive-design', name: 'Responsive Design', order: 7 },
      { id: 'accessibility', name: 'Accessibility', order: 8 }
    ],
    ctaText: 'See all projects',
    ctaUrl: '/work',
    video: {
      url: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/sweet-spot-60fps.mp4',
      caption: 'The sweet spot between UX and UI',
      autoplay: true,
      loop: true,
      muted: true
    }
  },
  approach: {
    description: 'The ideal balance between UX and UI is what makes a winning product. The sweet spot is the combination of both, and my four-step process gives you the ultimate framework for design.',
    steps: [
      {
        id: 'discover',
        number: 1,
        title: 'Discover',
        description: 'Understanding your business goals, user needs, and market landscape to define the project scope and strategy.',
        order: 1
      },
      {
        id: 'define',
        number: 2,
        title: 'Define',
        description: 'Creating user personas, journey maps, and defining the information architecture and user flows.',
        order: 2
      },
      {
        id: 'design',
        number: 3,
        title: 'Design',
        description: 'Crafting wireframes, prototypes, and high-fidelity designs that bring your vision to life.',
        order: 3
      },
      {
        id: 'deliver',
        number: 4,
        title: 'Deliver',
        description: 'Testing, iterating, and delivering polished designs with comprehensive documentation and assets.',
        order: 4
      }
    ]
  },
  testimonials: {
    testimonials: [
      {
        id: 'jasen-dowell',
        text: "I've had the privilege of working with Lawson Sydney for over five years, collaborating on the design and delivery of digital experiences that support both internal teams and Savills clients. Lawson brings a rare mix of creativity, precision, and empathy to every project—always leading with a human-centered, user-first mindset.",
        author: {
          name: 'Jasen Dowell',
          title: 'Head of Digital Experience',
          company: 'Savills',
          avatar: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/683d99eb6dd7493e2e881ce9_img-jasen.png'
        },
        project: {
          name: 'Savills Stacker',
          image: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/683d9a1faa1f1b861dd17db2_img-case-stacker.png',
          url: 'https://apps.apple.com/us/app/savills-stacker/id1516444309?platform=iphone'
        },
        order: 1
      },
      {
        id: 'jon-persson',
        text: "Lawson has been a great asset during our website overhaul. His attention to detail, attentiveness to our needs, and proactive communication made the whole process really enjoyable for us.",
        author: {
          name: 'Jon Persson',
          title: 'Co-Founder',
          company: 'Greco Gum',
          avatar: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813e5ee4368886f8a1f218c_img-jon.avif'
        },
        project: {
          name: 'Greco Gum Website',
          image: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/67dd5bb60eebacb9d1093652_img-case-greco.avif',
          url: '/greco-gum'
        },
        order: 2
      },
      {
        id: 'rodrigo-pavezi',
        text: "Lawson's work is a masterpiece. He is very well organized and makes your ideas look great. It was a few iterations for him to get my inputs and voilà. The mobile app we wanted looks awesome.",
        author: {
          name: 'Rodrigo Pavezi',
          title: 'Founder',
          company: 'Journaler',
          avatar: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813e62470565047a9e87b5a_img-rodrigo.avif'
        },
        project: {
          name: 'Journaler App',
          image: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/67dd5bb60eebacb9d1093652_img-case-journaler.avif',
          url: '/journaler'
        },
        order: 3
      }
    ]
  },
  clients: {
    clients: [
      {
        id: 'savills',
        name: 'Savills',
        logo: '/images/client-savills.svg',
        description: 'Global real estate services provider',
        industry: 'Real Estate',
        order: 1,
        isActive: true
      },
      {
        id: 'greco-gum',
        name: 'Greco Gum',
        logo: '/images/client-greco.svg',
        description: 'Premium chewing gum brand',
        industry: 'Consumer Goods',
        order: 2,
        isActive: true
      },
      {
        id: 'journaler',
        name: 'Journaler',
        logo: '/images/client-journaler.svg',
        description: 'Digital journaling platform',
        industry: 'Technology',
        order: 3,
        isActive: true
      },
      {
        id: 'booksprout',
        name: 'BookSprout',
        logo: '/images/client-booksprout.svg',
        description: 'Book marketing platform',
        industry: 'Publishing',
        order: 4,
        isActive: true
      },
      {
        id: 'investy',
        name: 'Investy Club',
        logo: '/images/client-investy.svg',
        description: 'Investment community platform',
        industry: 'Finance',
        order: 5,
        isActive: true
      },
      {
        id: 'nobe',
        name: 'Nobe',
        logo: '/images/client-nobe.svg',
        description: 'Electric vehicle manufacturer',
        industry: 'Automotive',
        order: 6,
        isActive: true
      }
    ]
  },
  seo: {
    title: 'Services - Victor Berbel Portfolio',
    description: 'Independent Product Designer with over 17 years of experience designing websites, SaaS platforms, and mobile apps from big corporations to small startups.',
    keywords: ['product design', 'UX design', 'UI design', 'web design', 'mobile design', 'design services', 'freelance designer']
  }
};

async function initializeServicesData() {
  try {
    console.log('🚀 Initializing Services CMS data...');

    // Check if services data already exists
    const existingContent = await prisma.servicesContent.findFirst();
    if (existingContent) {
      console.log('✅ Services data already exists, skipping initialization');
      return;
    }

    // Create content entries for each section
    const contentEntries = [
      // Hero section
      {
        section: 'hero',
        fieldName: 'title',
        fieldValue: defaultServicesData.hero.title,
        fieldType: 'text',
        displayOrder: 1
      },
      {
        section: 'hero',
        fieldName: 'description',
        fieldValue: defaultServicesData.hero.description,
        fieldType: 'textarea',
        displayOrder: 2
      },
      {
        section: 'hero',
        fieldName: 'highlightText',
        fieldValue: defaultServicesData.hero.highlightText || '',
        fieldType: 'text',
        displayOrder: 3
      },

      // Services section
      {
        section: 'services',
        fieldName: 'services',
        fieldValue: JSON.stringify(defaultServicesData.services.services),
        fieldType: 'json',
        displayOrder: 1
      },

      // Skills & Video section
      {
        section: 'skills',
        fieldName: 'description',
        fieldValue: defaultServicesData.skillsVideo.description,
        fieldType: 'textarea',
        displayOrder: 1
      },
      {
        section: 'skills',
        fieldName: 'skills',
        fieldValue: JSON.stringify(defaultServicesData.skillsVideo.skills),
        fieldType: 'json',
        displayOrder: 2
      },
      {
        section: 'skills',
        fieldName: 'ctaText',
        fieldValue: defaultServicesData.skillsVideo.ctaText,
        fieldType: 'text',
        displayOrder: 3
      },
      {
        section: 'skills',
        fieldName: 'ctaUrl',
        fieldValue: defaultServicesData.skillsVideo.ctaUrl,
        fieldType: 'url',
        displayOrder: 4
      },
      {
        section: 'skills',
        fieldName: 'video',
        fieldValue: JSON.stringify(defaultServicesData.skillsVideo.video),
        fieldType: 'json',
        displayOrder: 5
      },

      // Approach section
      {
        section: 'approach',
        fieldName: 'description',
        fieldValue: defaultServicesData.approach.description,
        fieldType: 'textarea',
        displayOrder: 1
      },
      {
        section: 'approach',
        fieldName: 'steps',
        fieldValue: JSON.stringify(defaultServicesData.approach.steps),
        fieldType: 'json',
        displayOrder: 2
      },

      // Testimonials section
      {
        section: 'testimonials',
        fieldName: 'testimonials',
        fieldValue: JSON.stringify(defaultServicesData.testimonials.testimonials),
        fieldType: 'json',
        displayOrder: 1
      },

      // Clients section
      {
        section: 'clients',
        fieldName: 'clients',
        fieldValue: JSON.stringify(defaultServicesData.clients.clients),
        fieldType: 'json',
        displayOrder: 1
      }
    ];

    // Insert all content entries
    for (const entry of contentEntries) {
      await prisma.servicesContent.create({
        data: entry
      });
    }

    // Create initial version
    await prisma.servicesVersion.create({
      data: {
        versionName: 'Initial services data',
        contentSnapshot: JSON.stringify(defaultServicesData),
        isActive: true
      }
    });

    console.log('✅ Services CMS data initialized successfully');
    console.log(`📊 Created ${contentEntries.length} content entries`);
    console.log('🔄 Created initial version');

  } catch (error) {
    console.error('❌ Error initializing services data:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeServicesData()
    .then(() => {
      console.log('🎉 Services initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Services initialization failed:', error);
      process.exit(1);
    });
}

export { initializeServicesData, defaultServicesData };