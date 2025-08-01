// Services Validation Service Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { ServicesValidationService } from '../services/servicesValidationService';
import {
  ServicesData,
  HeroSectionData,
  ServicesGridData,
  ServiceItem,
  SkillsVideoData,
  SkillItem,
  VideoData,
  ApproachData,
  ApproachStep,
  TestimonialsData,
  Testimonial,
  TestimonialAuthor,
  TestimonialProject,
  ClientsData,
  ClientItem,
  ValidationError
} from '../../../shared/types/services';

describe('ServicesValidationService', () => {
  let validationService: ServicesValidationService;

  beforeEach(() => {
    validationService = new ServicesValidationService();
  });

  describe('Hero Section Validation', () => {
    it('should validate valid hero section data', async () => {
      const validHeroData: HeroSectionData = {
        title: 'Professional Web Development Services',
        description: 'I create modern, responsive websites and applications that deliver exceptional user experiences and drive business growth.',
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(validHeroData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject hero section with missing title', async () => {
      const invalidHeroData: HeroSectionData = {
        title: '',
        description: 'Valid description',
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(invalidHeroData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject hero section with title too long', async () => {
      const invalidHeroData: HeroSectionData = {
        title: 'A'.repeat(201),
        description: 'Valid description',
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(invalidHeroData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].code).toBe('MAX_LENGTH_EXCEEDED');
    });

    it('should reject hero section with missing description', async () => {
      const invalidHeroData: HeroSectionData = {
        title: 'Valid title',
        description: '',
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(invalidHeroData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('description');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject hero section with description too long', async () => {
      const invalidHeroData: HeroSectionData = {
        title: 'Valid title',
        description: 'A'.repeat(1001),
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(invalidHeroData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('description');
      expect(result.errors[0].code).toBe('MAX_LENGTH_EXCEEDED');
    });

    it('should warn about short title', async () => {
      const heroData: HeroSectionData = {
        title: 'Short',
        description: 'This is a valid description that meets the minimum length requirements.',
        highlightText: '17+ years'
      };

      const result = await validationService.validateHeroSection(heroData);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('title');
      expect(result.warnings[0].code).toBe('MIN_LENGTH_WARNING');
    });

    it('should reject invalid highlight text type', async () => {
      const invalidHeroData: any = {
        title: 'Valid title',
        description: 'Valid description',
        highlightText: 123
      };

      const result = await validationService.validateHeroSection(invalidHeroData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('highlightText');
      expect(result.errors[0].code).toBe('INVALID_TYPE');
    });
  });

  describe('Services Grid Validation', () => {
    it('should validate valid services grid data', async () => {
      const validServicesData: ServicesGridData = {
        services: [
          {
            id: '1',
            number: 1,
            title: 'Website Development',
            description: 'Custom websites built with modern technologies',
            color: '#FF6B6B',
            colorClass: 'text-red-500',
            order: 1
          },
          {
            id: '2',
            number: 2,
            title: 'Product Design',
            description: 'User-centered design for digital products',
            color: '#4ECDC4',
            colorClass: 'text-teal-500',
            order: 2
          },
          {
            id: '3',
            number: 3,
            title: 'Mobile Development',
            description: 'Native and cross-platform mobile apps',
            color: '#45B7D1',
            colorClass: 'text-blue-500',
            order: 3
          }
        ]
      };

      const result = await validationService.validateServicesGrid(validServicesData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject services grid with no services', async () => {
      const invalidServicesData: ServicesGridData = {
        services: []
      };

      const result = await validationService.validateServicesGrid(invalidServicesData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('services');
      expect(result.errors[0].code).toBe('MIN_ITEMS_REQUIRED');
    });

    it('should reject services grid with too many services', async () => {
      const services = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        number: i + 1,
        title: `Service ${i + 1}`,
        description: `Description ${i + 1}`,
        color: '#FF6B6B',
        colorClass: 'text-red-500',
        order: i + 1
      }));

      const invalidServicesData: ServicesGridData = { services };

      const result = await validationService.validateServicesGrid(invalidServicesData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('services');
      expect(result.errors[0].code).toBe('MAX_ITEMS_EXCEEDED');
    });

    it('should reject service with invalid color', async () => {
      const invalidServicesData: ServicesGridData = {
        services: [
          {
            id: '1',
            number: 1,
            title: 'Website Development',
            description: 'Custom websites built with modern technologies',
            color: 'invalid-color',
            colorClass: 'text-red-500',
            order: 1
          }
        ]
      };

      const result = await validationService.validateServicesGrid(invalidServicesData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('services[0].color');
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    });

    it('should warn about duplicate colors', async () => {
      const servicesData: ServicesGridData = {
        services: [
          {
            id: '1',
            number: 1,
            title: 'Website Development',
            description: 'Custom websites built with modern technologies',
            color: '#FF6B6B',
            colorClass: 'text-red-500',
            order: 1
          },
          {
            id: '2',
            number: 2,
            title: 'Product Design',
            description: 'User-centered design for digital products',
            color: '#FF6B6B',
            colorClass: 'text-red-500',
            order: 2
          }
        ]
      };

      const result = await validationService.validateServicesGrid(servicesData);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('services[1].color');
      expect(result.warnings[0].code).toBe('DUPLICATE_VALUE');
    });

    it('should reject duplicate service numbers', async () => {
      const servicesData: ServicesGridData = {
        services: [
          {
            id: '1',
            number: 1,
            title: 'Website Development',
            description: 'Custom websites built with modern technologies',
            color: '#FF6B6B',
            colorClass: 'text-red-500',
            order: 1
          },
          {
            id: '2',
            number: 1,
            title: 'Product Design',
            description: 'User-centered design for digital products',
            color: '#4ECDC4',
            colorClass: 'text-teal-500',
            order: 2
          }
        ]
      };

      const result = await validationService.validateServicesGrid(servicesData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('services[1].number');
      expect(result.errors[0].code).toBe('DUPLICATE_VALUE');
    });
  });

  describe('Skills Video Validation', () => {
    it('should validate valid skills video data', async () => {
      const validSkillsVideoData: SkillsVideoData = {
        description: 'I specialize in modern web technologies and frameworks',
        skills: [
          { id: '1', name: 'React', order: 1 },
          { id: '2', name: 'TypeScript', order: 2 },
          { id: '3', name: 'Node.js', order: 3 },
          { id: '4', name: 'Python', order: 4 },
          { id: '5', name: 'PostgreSQL', order: 5 }
        ],
        ctaText: 'See all projects',
        ctaUrl: '/work',
        video: {
          url: 'https://example.com/video.mp4',
          caption: 'Development process showcase',
          autoplay: false,
          loop: true,
          muted: true
        }
      };

      const result = await validationService.validateSkillsVideo(validSkillsVideoData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject skills video with missing description', async () => {
      const invalidSkillsVideoData: SkillsVideoData = {
        description: '',
        skills: [
          { id: '1', name: 'React', order: 1 },
          { id: '2', name: 'TypeScript', order: 2 },
          { id: '3', name: 'Node.js', order: 3 },
          { id: '4', name: 'Python', order: 4 },
          { id: '5', name: 'PostgreSQL', order: 5 }
        ],
        ctaText: 'See all projects',
        ctaUrl: '/work',
        video: {
          url: 'https://example.com/video.mp4',
          caption: 'Development process showcase',
          autoplay: false,
          loop: true,
          muted: true
        }
      };

      const result = await validationService.validateSkillsVideo(invalidSkillsVideoData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('description');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject skills video with too few skills', async () => {
      const invalidSkillsVideoData: SkillsVideoData = {
        description: 'I specialize in modern web technologies',
        skills: [
          { id: '1', name: 'React', order: 1 },
          { id: '2', name: 'TypeScript', order: 2 }
        ],
        ctaText: 'See all projects',
        ctaUrl: '/work',
        video: {
          url: 'https://example.com/video.mp4',
          caption: 'Development process showcase',
          autoplay: false,
          loop: true,
          muted: true
        }
      };

      const result = await validationService.validateSkillsVideo(invalidSkillsVideoData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('skills');
      expect(result.errors[0].code).toBe('MIN_ITEMS_REQUIRED');
    });

    it('should reject skills video with too many skills', async () => {
      const skills = Array.from({ length: 21 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Skill ${i + 1}`,
        order: i + 1
      }));

      const invalidSkillsVideoData: SkillsVideoData = {
        description: 'I specialize in modern web technologies',
        skills,
        ctaText: 'See all projects',
        ctaUrl: '/work',
        video: {
          url: 'https://example.com/video.mp4',
          caption: 'Development process showcase',
          autoplay: false,
          loop: true,
          muted: true
        }
      };

      const result = await validationService.validateSkillsVideo(invalidSkillsVideoData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('skills');
      expect(result.errors[0].code).toBe('MAX_ITEMS_EXCEEDED');
    });

    it('should reject invalid video URL', async () => {
      const invalidSkillsVideoData: SkillsVideoData = {
        description: 'I specialize in modern web technologies',
        skills: [
          { id: '1', name: 'React', order: 1 },
          { id: '2', name: 'TypeScript', order: 2 },
          { id: '3', name: 'Node.js', order: 3 },
          { id: '4', name: 'Python', order: 4 },
          { id: '5', name: 'PostgreSQL', order: 5 }
        ],
        ctaText: 'See all projects',
        ctaUrl: '/work',
        video: {
          url: 'invalid-url',
          caption: 'Development process showcase',
          autoplay: false,
          loop: true,
          muted: true
        }
      };

      const result = await validationService.validateSkillsVideo(invalidSkillsVideoData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('video.url');
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    });
  });

  describe('Approach Validation', () => {
    it('should validate valid approach data', async () => {
      const validApproachData: ApproachData = {
        description: 'My proven 4-step process for delivering exceptional results',
        steps: [
          {
            id: '1',
            number: 1,
            title: 'Discovery & Strategy',
            description: 'Understanding your goals and defining the project scope',
            icon: '/icons/discovery.svg',
            order: 1
          },
          {
            id: '2',
            number: 2,
            title: 'Design & Prototyping',
            description: 'Creating wireframes and visual designs',
            icon: '/icons/design.svg',
            order: 2
          },
          {
            id: '3',
            number: 3,
            title: 'Development',
            description: 'Building the solution with clean, maintainable code',
            icon: '/icons/development.svg',
            order: 3
          },
          {
            id: '4',
            number: 4,
            title: 'Launch & Support',
            description: 'Deploying and providing ongoing maintenance',
            icon: '/icons/launch.svg',
            order: 4
          }
        ]
      };

      const result = await validationService.validateApproach(validApproachData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject approach with too few steps', async () => {
      const invalidApproachData: ApproachData = {
        description: 'My process',
        steps: [
          {
            id: '1',
            number: 1,
            title: 'Discovery',
            description: 'Understanding your goals',
            order: 1
          },
          {
            id: '2',
            number: 2,
            title: 'Development',
            description: 'Building the solution',
            order: 2
          }
        ]
      };

      const result = await validationService.validateApproach(invalidApproachData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('steps');
      expect(result.errors[0].code).toBe('MIN_ITEMS_REQUIRED');
    });

    it('should reject approach with too many steps', async () => {
      const steps = Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        number: i + 1,
        title: `Step ${i + 1}`,
        description: `Description for step ${i + 1}`,
        order: i + 1
      }));

      const invalidApproachData: ApproachData = {
        description: 'My process',
        steps
      };

      const result = await validationService.validateApproach(invalidApproachData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('steps');
      expect(result.errors[0].code).toBe('MAX_ITEMS_EXCEEDED');
    });

    it('should reject duplicate step numbers', async () => {
      const invalidApproachData: ApproachData = {
        description: 'My process',
        steps: [
          {
            id: '1',
            number: 1,
            title: 'Discovery',
            description: 'Understanding your goals',
            order: 1
          },
          {
            id: '2',
            number: 1,
            title: 'Development',
            description: 'Building the solution',
            order: 2
          },
          {
            id: '3',
            number: 3,
            title: 'Launch',
            description: 'Deploying the solution',
            order: 3
          }
        ]
      };

      const result = await validationService.validateApproach(invalidApproachData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('steps[1].number');
      expect(result.errors[0].code).toBe('DUPLICATE_VALUE');
    });
  });

  describe('Testimonials Validation', () => {
    it('should validate valid testimonials data', async () => {
      const validTestimonialsData: TestimonialsData = {
        testimonials: [
          {
            id: '1',
            text: 'Victor delivered an exceptional website that exceeded our expectations. His attention to detail and technical expertise are outstanding.',
            author: {
              name: 'John Smith',
              title: 'CEO',
              company: 'Tech Startup Inc',
              avatar: 'https://example.com/avatar1.jpg'
            },
            project: {
              name: 'E-commerce Platform',
              image: 'https://example.com/project1.jpg',
              url: 'https://example.com/case-study-1'
            },
            order: 1
          },
          {
            id: '2',
            text: 'Working with Victor was a pleasure. He understood our vision and brought it to life with modern design and flawless functionality.',
            author: {
              name: 'Sarah Johnson',
              title: 'Marketing Director',
              company: 'Creative Agency',
              avatar: 'https://example.com/avatar2.jpg'
            },
            project: {
              name: 'Portfolio Website',
              image: 'https://example.com/project2.jpg',
              url: 'https://example.com/case-study-2'
            },
            order: 2
          }
        ]
      };

      const result = await validationService.validateTestimonials(validTestimonialsData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject testimonial with short text', async () => {
      const invalidTestimonialsData: TestimonialsData = {
        testimonials: [
          {
            id: '1',
            text: 'Good work',
            author: {
              name: 'John Smith',
              title: 'CEO',
              company: 'Tech Startup Inc',
              avatar: 'https://example.com/avatar1.jpg'
            },
            project: {
              name: 'E-commerce Platform',
              image: 'https://example.com/project1.jpg'
            },
            order: 1
          }
        ]
      };

      const result = await validationService.validateTestimonials(invalidTestimonialsData);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('testimonials[0].text');
      expect(result.warnings[0].code).toBe('MIN_LENGTH_WARNING');
    });

    it('should reject testimonial with missing author name', async () => {
      const invalidTestimonialsData: TestimonialsData = {
        testimonials: [
          {
            id: '1',
            text: 'Victor delivered an exceptional website that exceeded our expectations.',
            author: {
              name: '',
              title: 'CEO',
              company: 'Tech Startup Inc',
              avatar: 'https://example.com/avatar1.jpg'
            },
            project: {
              name: 'E-commerce Platform',
              image: 'https://example.com/project1.jpg'
            },
            order: 1
          }
        ]
      };

      const result = await validationService.validateTestimonials(invalidTestimonialsData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('testimonials[0].author.name');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should warn about missing author avatar', async () => {
      const testimonialsData: TestimonialsData = {
        testimonials: [
          {
            id: '1',
            text: 'Victor delivered an exceptional website that exceeded our expectations.',
            author: {
              name: 'John Smith',
              title: 'CEO',
              company: 'Tech Startup Inc',
              avatar: ''
            },
            project: {
              name: 'E-commerce Platform',
              image: 'https://example.com/project1.jpg'
            },
            order: 1
          }
        ]
      };

      const result = await validationService.validateTestimonials(testimonialsData);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1); // Only avatar warning since project image is provided
      expect(result.warnings[0].field).toBe('testimonials[0].author.avatar');
      expect(result.warnings[0].code).toBe('MISSING_MEDIA');
    });
  });

  describe('Clients Validation', () => {
    it('should validate valid clients data', async () => {
      const validClientsData: ClientsData = {
        clients: [
          {
            id: '1',
            name: 'Tech Startup Inc',
            logo: 'https://example.com/logo1.svg',
            description: 'Innovative technology solutions for modern businesses',
            industry: 'Technology',
            order: 1,
            isActive: true
          },
          {
            id: '2',
            name: 'Creative Agency',
            logo: 'https://example.com/logo2.svg',
            description: 'Full-service creative agency specializing in brand development',
            industry: 'Marketing',
            order: 2,
            isActive: true
          }
        ]
      };

      const result = await validationService.validateClients(validClientsData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject client with missing name', async () => {
      const invalidClientsData: ClientsData = {
        clients: [
          {
            id: '1',
            name: '',
            logo: 'https://example.com/logo1.svg',
            description: 'Innovative technology solutions',
            industry: 'Technology',
            order: 1,
            isActive: true
          }
        ]
      };

      const result = await validationService.validateClients(invalidClientsData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('clients[0].name');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should warn about missing client logo', async () => {
      const clientsData: ClientsData = {
        clients: [
          {
            id: '1',
            name: 'Tech Startup Inc',
            logo: '',
            description: 'Innovative technology solutions',
            industry: 'Technology',
            order: 1,
            isActive: true
          }
        ]
      };

      const result = await validationService.validateClients(clientsData);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('clients[0].logo');
      expect(result.warnings[0].code).toBe('MISSING_MEDIA');
    });

    it('should reject client with invalid isActive type', async () => {
      const invalidClientsData: any = {
        clients: [
          {
            id: '1',
            name: 'Tech Startup Inc',
            logo: 'https://example.com/logo1.svg',
            description: 'Innovative technology solutions',
            industry: 'Technology',
            order: 1,
            isActive: 'true'
          }
        ]
      };

      const result = await validationService.validateClients(invalidClientsData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('clients[0].isActive');
      expect(result.errors[0].code).toBe('INVALID_TYPE');
    });
  });

  describe('Complete Services Data Validation', () => {
    it('should validate complete valid services data', async () => {
      const validServicesData: ServicesData = {
        id: '1',
        version: 1,
        lastModified: new Date(),
        isPublished: false,
        hero: {
          title: 'Professional Web Development Services',
          description: 'I create modern, responsive websites and applications that deliver exceptional user experiences.',
          highlightText: '17+ years'
        },
        services: {
          services: [
            {
              id: '1',
              number: 1,
              title: 'Website Development',
              description: 'Custom websites built with modern technologies',
              color: '#FF6B6B',
              colorClass: 'text-red-500',
              order: 1
            }
          ]
        },
        skillsVideo: {
          description: 'I specialize in modern web technologies',
          skills: [
            { id: '1', name: 'React', order: 1 },
            { id: '2', name: 'TypeScript', order: 2 },
            { id: '3', name: 'Node.js', order: 3 },
            { id: '4', name: 'Python', order: 4 },
            { id: '5', name: 'PostgreSQL', order: 5 }
          ],
          ctaText: 'See all projects',
          ctaUrl: '/work',
          video: {
            url: 'https://example.com/video.mp4',
            caption: 'Development process showcase',
            autoplay: false,
            loop: true,
            muted: true
          }
        },
        approach: {
          description: 'My proven process',
          steps: [
            {
              id: '1',
              number: 1,
              title: 'Discovery',
              description: 'Understanding your goals',
              order: 1
            },
            {
              id: '2',
              number: 2,
              title: 'Design',
              description: 'Creating the solution',
              order: 2
            },
            {
              id: '3',
              number: 3,
              title: 'Development',
              description: 'Building the product',
              order: 3
            }
          ]
        },
        testimonials: {
          testimonials: []
        },
        clients: {
          clients: []
        },
        seo: {
          title: 'Professional Web Development Services - Victor Berbel',
          description: 'Expert web development services including custom websites, web applications, and digital solutions. 17+ years of experience.',
          keywords: ['web development', 'react', 'typescript', 'nodejs'],
          ogImage: 'https://example.com/og-image.jpg'
        }
      };

      const result = await validationService.validateServicesData(validServicesData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors from multiple sections', async () => {
      const invalidServicesData: ServicesData = {
        id: '1',
        version: 1,
        lastModified: new Date(),
        isPublished: false,
        hero: {
          title: '', // Invalid
          description: 'Valid description',
        },
        services: {
          services: [] // Invalid - no services
        },
        skillsVideo: {
          description: '', // Invalid
          skills: [], // Invalid - too few
          ctaText: 'See all projects',
          ctaUrl: '/work',
          video: {
            url: 'invalid-url', // Invalid
            caption: 'Development process showcase',
            autoplay: false,
            loop: true,
            muted: true
          }
        },
        approach: {
          description: 'My process',
          steps: [] // Invalid - too few
        },
        testimonials: {
          testimonials: []
        },
        clients: {
          clients: []
        },
        seo: {
          title: '', // Invalid
          description: 'Valid SEO description',
          keywords: [],
        }
      };

      const result = await validationService.validateServicesData(invalidServicesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5); // Multiple validation errors
    });
  });

  describe('Real-time Field Validation', () => {
    it('should validate hero title field in real-time', async () => {
      const error = await validationService.validateField('hero', 'title', '');
      expect(error).not.toBeNull();
      expect(error?.field).toBe('title');
      expect(error?.code).toBe('REQUIRED_FIELD');
    });

    it('should validate hero title field with valid value', async () => {
      const error = await validationService.validateField('hero', 'title', 'Valid Title');
      expect(error).toBeNull();
    });

    it('should validate hero title field with too long value', async () => {
      const error = await validationService.validateField('hero', 'title', 'A'.repeat(201));
      expect(error).not.toBeNull();
      expect(error?.field).toBe('title');
      expect(error?.code).toBe('MAX_LENGTH_EXCEEDED');
    });

    it('should handle unknown section gracefully', async () => {
      const error = await validationService.validateField('unknown' as any, 'field', 'value');
      expect(error).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null data gracefully', async () => {
      const result = await validationService.validateHeroSection(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined data gracefully', async () => {
      const result = await validationService.validateHeroSection(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle array instead of object gracefully', async () => {
      const result = await validationService.validateHeroSection([] as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle validation errors during processing', async () => {
      // Mock a scenario where validation throws an error
      const invalidData = {
        get title() {
          throw new Error('Property access error');
        },
        description: 'Valid description'
      };

      const result = await validationService.validateHeroSection(invalidData as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });
  });
});