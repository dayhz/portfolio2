import { describe, it, expect } from 'vitest';
import { validateHeroSection, validateBrandsSection, validateServicesSection, validateOfferSection, validateTestimonialsSection, validateFooterSection } from '../utils/validation';

describe('Data Validation', () => {
  describe('Hero Section Validation', () => {
    it('should validate valid hero data', () => {
      const validData = {
        title: 'Valid Hero Title',
        description: 'This is a valid description that is long enough to pass validation',
        videoUrl: 'https://example.com/video.mp4'
      };

      const errors = validateHeroSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'Valid description'
      };

      const errors = validateHeroSection(invalidData);
      expect(errors).toContain('Title is required');
    });

    it('should reject short description', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Short'
      };

      const errors = validateHeroSection(invalidData);
      expect(errors).toContain('Description must be at least 10 characters');
    });

    it('should reject invalid video URL', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description',
        videoUrl: 'not-a-url'
      };

      const errors = validateHeroSection(invalidData);
      expect(errors).toContain('Invalid video URL format');
    });

    it('should allow empty video URL', () => {
      const validData = {
        title: 'Valid Title',
        description: 'Valid description',
        videoUrl: ''
      };

      const errors = validateHeroSection(validData);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Brands Section Validation', () => {
    it('should validate valid brands data', () => {
      const validData = {
        title: 'Our Clients',
        logos: [
          {
            name: 'Client 1',
            logoUrl: '/images/client1.png',
            order: 1
          },
          {
            name: 'Client 2',
            logoUrl: '/images/client2.png',
            order: 2
          }
        ]
      };

      const errors = validateBrandsSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty logo name', () => {
      const invalidData = {
        title: 'Our Clients',
        logos: [
          {
            name: '',
            logoUrl: '/images/client1.png',
            order: 1
          }
        ]
      };

      const errors = validateBrandsSection(invalidData);
      expect(errors).toContain('Logo 1: Logo name is required');
    });

    it('should reject invalid logo URL', () => {
      const invalidData = {
        title: 'Our Clients',
        logos: [
          {
            name: 'Client 1',
            logoUrl: '',
            order: 1
          }
        ]
      };

      const errors = validateBrandsSection(invalidData);
      expect(errors).toContain('Logo 1: Logo URL is required');
    });

    it('should validate logo order', () => {
      const invalidData = {
        title: 'Our Clients',
        logos: [
          {
            name: 'Client 1',
            logoUrl: '/images/client1.png',
            order: -1
          }
        ]
      };

      const errors = validateBrandsSection(invalidData);
      expect(errors).toContain('Logo 1: Logo order must be a positive number');
    });
  });

  describe('Services Section Validation', () => {
    it('should validate valid services data', () => {
      const validData = {
        title: 'Our Services',
        description: 'We offer great services',
        services: [
          {
            number: '1.',
            title: 'Service 1',
            description: 'First service description',
            link: '/service1',
            colorClass: 'bg-blue'
          }
        ]
      };

      const errors = validateServicesSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty service title', () => {
      const invalidData = {
        title: 'Our Services',
        services: [
          {
            number: '1.',
            title: '',
            description: 'Valid description',
            link: '/service1',
            colorClass: 'bg-blue'
          }
        ]
      };

      const errors = validateServicesSection(invalidData);
      expect(errors).toContain('Service 1: Service title is required');
    });

    it('should reject empty service description', () => {
      const invalidData = {
        title: 'Our Services',
        services: [
          {
            number: '1.',
            title: 'Valid Title',
            description: '',
            link: '/service1',
            colorClass: 'bg-blue'
          }
        ]
      };

      const errors = validateServicesSection(invalidData);
      expect(errors).toContain('Service 1: Service description is required');
    });

    it('should limit number of services', () => {
      const tooManyServices = {
        title: 'Our Services',
        services: Array(6).fill(0).map((_, i) => ({
          number: `${i + 1}.`,
          title: `Service ${i + 1}`,
          description: `Description ${i + 1}`,
          link: `/service${i + 1}`,
          colorClass: 'bg-blue'
        }))
      };

      const errors = validateServicesSection(tooManyServices);
      expect(errors).toContain('Maximum 5 services allowed');
    });
  });

  describe('Offer Section Validation', () => {
    it('should validate valid offer data', () => {
      const validData = {
        title: 'Our Offer',
        points: [
          {
            text: 'First benefit point',
            order: 1
          },
          {
            text: 'Second benefit point',
            order: 2
          }
        ]
      };

      const errors = validateOfferSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty point text', () => {
      const invalidData = {
        title: 'Our Offer',
        points: [
          {
            text: '',
            order: 1
          }
        ]
      };

      const errors = validateOfferSection(invalidData);
      expect(errors).toContain('Point 1: Point text is required');
    });

    it('should limit number of points', () => {
      const tooManyPoints = {
        title: 'Our Offer',
        points: Array(7).fill(0).map((_, i) => ({
          text: `Point ${i + 1}`,
          order: i + 1
        }))
      };

      const errors = validateOfferSection(tooManyPoints);
      expect(errors).toContain('Maximum 6 points allowed');
    });

    it('should validate point order', () => {
      const invalidData = {
        title: 'Our Offer',
        points: [
          {
            text: 'Valid point',
            order: 0
          }
        ]
      };

      const errors = validateOfferSection(invalidData);
      expect(errors).toContain('Point 1: Point order must be a positive number');
    });
  });

  describe('Testimonials Section Validation', () => {
    it('should validate valid testimonials data', () => {
      const validData = {
        testimonials: [
          {
            text: 'This is a great testimonial with enough content to be meaningful',
            clientName: 'John Doe',
            clientTitle: 'CEO',
            clientPhoto: '/images/john.jpg',
            projectLink: 'https://project.com',
            projectImage: '/images/project.jpg',
            order: 1
          }
        ]
      };

      const errors = validateTestimonialsSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject short testimonial text', () => {
      const invalidData = {
        testimonials: [
          {
            text: 'Short',
            clientName: 'John Doe',
            clientTitle: 'CEO',
            order: 1
          }
        ]
      };

      const errors = validateTestimonialsSection(invalidData);
      expect(errors).toContain('Testimonial 1: Testimonial text must be at least 20 characters');
    });

    it('should reject empty client name', () => {
      const invalidData = {
        testimonials: [
          {
            text: 'This is a valid testimonial text',
            clientName: '',
            clientTitle: 'CEO',
            order: 1
          }
        ]
      };

      const errors = validateTestimonialsSection(invalidData);
      expect(errors).toContain('Testimonial 1: Client name is required');
    });

    it('should validate project link format', () => {
      const invalidData = {
        testimonials: [
          {
            text: 'This is a valid testimonial text',
            clientName: 'John Doe',
            clientTitle: 'CEO',
            projectLink: 'not-a-url',
            order: 1
          }
        ]
      };

      const errors = validateTestimonialsSection(invalidData);
      expect(errors).toContain('Testimonial 1: Invalid project link format');
    });

    it('should limit number of testimonials', () => {
      const tooManyTestimonials = {
        testimonials: Array(11).fill(0).map((_, i) => ({
          text: `This is testimonial number ${i + 1} with enough content`,
          clientName: `Client ${i + 1}`,
          clientTitle: `Title ${i + 1}`,
          order: i + 1
        }))
      };

      const errors = validateTestimonialsSection(tooManyTestimonials);
      expect(errors).toContain('Maximum 10 testimonials allowed');
    });
  });

  describe('Footer Section Validation', () => {
    it('should validate valid footer data', () => {
      const validData = {
        title: 'Contact Us',
        email: 'contact@example.com',
        copyright: '© 2025 Company Name',
        links: {
          site: [
            { text: 'Home', url: '/home' },
            { text: 'About', url: '/about' }
          ],
          professional: [
            { text: 'LinkedIn', url: 'https://linkedin.com/company' }
          ],
          social: [
            { text: 'Twitter', url: 'https://twitter.com/company' }
          ]
        }
      };

      const errors = validateFooterSection(validData);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        copyright: 'Valid copyright'
      };

      const errors = validateFooterSection(invalidData);
      expect(errors).toContain('Invalid email format');
    });

    it('should reject empty copyright', () => {
      const invalidData = {
        email: 'valid@example.com',
        copyright: ''
      };

      const errors = validateFooterSection(invalidData);
      expect(errors).toContain('Copyright text is required');
    });

    it('should validate link URLs', () => {
      const invalidData = {
        email: 'valid@example.com',
        copyright: 'Valid copyright',
        links: {
          site: [
            { text: 'Home', url: 'invalid-url' }
          ]
        }
      };

      const errors = validateFooterSection(invalidData);
      expect(errors).toContain('site link 1: Invalid link URL format');
    });

    it('should reject empty link text', () => {
      const invalidData = {
        email: 'valid@example.com',
        copyright: 'Valid copyright',
        links: {
          site: [
            { text: '', url: '/home' }
          ]
        }
      };

      const errors = validateFooterSection(invalidData);
      expect(errors).toContain('site link 1: Link text is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values', () => {
      const errors1 = validateHeroSection(null);
      const errors2 = validateHeroSection(undefined);
      
      expect(errors1.length).toBeGreaterThan(0);
      expect(errors2.length).toBeGreaterThan(0);
    });

    it('should handle empty objects', () => {
      const errors = validateHeroSection({});
      expect(errors).toContain('Title is required');
    });

    it('should handle arrays instead of objects', () => {
      const errors = validateHeroSection([]);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle very long strings', () => {
      const veryLongString = 'a'.repeat(10000);
      const data = {
        title: veryLongString,
        description: veryLongString
      };

      const errors = validateHeroSection(data);
      expect(errors).toContain('Title must be less than 200 characters');
      expect(errors).toContain('Description must be less than 2000 characters');
    });

    it('should handle special characters', () => {
      const specialCharsData = {
        title: 'Title with émojis 🚀 and spéciàl chars',
        description: 'Description with special characters: <>&"\'',
        videoUrl: 'https://example.com/video-with-special-chars.mp4'
      };

      const errors = validateHeroSection(specialCharsData);
      expect(errors).toHaveLength(0);
    });
  });
});