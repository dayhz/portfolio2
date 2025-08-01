// Services API Integration Tests
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import servicesRouter from '../routes/services';
import { prisma } from '../lib/prisma';
import { ServicesData, HeroSectionData, ServicesGridData, SkillsVideoData, ApproachData, TestimonialsData, ClientsData } from '../../../shared/types/services';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/services', servicesRouter);

describe('Services API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.servicesContent.deleteMany({});
    await prisma.servicesVersion.deleteMany({});
    
    // Clear cache to ensure fresh data
    const { cacheService } = await import('../services/cacheService');
    await cacheService.invalidatePattern('services:*');
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.servicesContent.deleteMany({});
    await prisma.servicesVersion.deleteMany({});
    
    // Clear cache after tests
    const { cacheService } = await import('../services/cacheService');
    await cacheService.invalidatePattern('services:*');
  });

  describe('GET /api/services', () => {
    it('should return structured services content', async () => {
      // Create some test content
      await prisma.servicesContent.createMany({
        data: [
          {
            section: 'hero',
            fieldName: 'title',
            fieldValue: 'Professional Services',
            fieldType: 'text',
            displayOrder: 1
          },
          {
            section: 'hero',
            fieldName: 'description',
            fieldValue: 'We provide professional web development services',
            fieldType: 'textarea',
            displayOrder: 2
          }
        ]
      });

      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.hero).toBeDefined();
      expect(response.body.data.hero.title).toBe('Professional Services');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return default structure when no content exists', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.hero).toBeDefined();
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.skillsVideo).toBeDefined();
      expect(response.body.data.approach).toBeDefined();
      expect(response.body.data.testimonials).toBeDefined();
      expect(response.body.data.clients).toBeDefined();
    });
  });

  describe('GET /api/services/:section', () => {
    beforeEach(async () => {
      // Create test content for hero section
      await prisma.servicesContent.createMany({
        data: [
          {
            section: 'hero',
            fieldName: 'title',
            fieldValue: 'Hero Title',
            fieldType: 'text',
            displayOrder: 1
          },
          {
            section: 'hero',
            fieldName: 'description',
            fieldValue: 'Hero Description',
            fieldType: 'textarea',
            displayOrder: 2
          }
        ]
      });
    });

    it('should return specific section content', async () => {
      const response = await request(app)
        .get('/api/services/hero')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.section).toBe('hero');
      // The service returns the actual database values, not defaults when data exists
      expect(response.body.data.title).toBe('Hero Title');
      expect(response.body.data.description).toBe('Hero Description');
    });

    it('should return 400 for invalid section', async () => {
      const response = await request(app)
        .get('/api/services/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid section');
    });
  });

  describe('PUT /api/services/:section', () => {
    it('should update hero section successfully', async () => {
      const heroData: HeroSectionData = {
        title: 'Updated Hero Title',
        description: 'Updated hero description with sufficient length to pass validation',
        highlightText: '17+ years'
      };

      const response = await request(app)
        .put('/api/services/hero')
        .send(heroData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('hero section updated successfully');
      expect(response.body.data.title).toBe(heroData.title);
      expect(response.body.data.description).toBe(heroData.description);
    });

    it('should update services section successfully', async () => {
      const servicesData: ServicesGridData = {
        services: [
          {
            id: '1',
            number: 1,
            title: 'Web Development',
            description: 'Custom websites and web applications',
            color: '#FF6B6B',
            colorClass: 'text-red-500',
            order: 1
          },
          {
            id: '2',
            number: 2,
            title: 'Mobile Development',
            description: 'Native and cross-platform mobile apps',
            color: '#4ECDC4',
            colorClass: 'text-teal-500',
            order: 2
          }
        ]
      };

      const response = await request(app)
        .put('/api/services/services')
        .send(servicesData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toHaveLength(2);
      expect(response.body.data.services[0].title).toBe('Web Development');
    });

    it('should return validation errors for invalid data', async () => {
      const invalidHeroData = {
        title: '', // Invalid - empty title
        description: 'Valid description'
      };

      const response = await request(app)
        .put('/api/services/hero')
        .send(invalidHeroData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid section', async () => {
      const response = await request(app)
        .put('/api/services/invalid')
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body.error).toBe('Invalid section');
    });
  });

  describe('PUT /api/services', () => {
    it('should update complete services data successfully', async () => {
      const completeServicesData: ServicesData = {
        id: 'services-page',
        version: 1,
        lastModified: new Date(),
        isPublished: false,
        hero: {
          title: 'Professional Web Development Services',
          description: 'I create modern, responsive websites and applications that deliver exceptional user experiences and drive business growth.',
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
        },
        approach: {
          description: 'My proven 4-step process for delivering exceptional results',
          steps: [
            {
              id: '1',
              number: 1,
              title: 'Discovery',
              description: 'Understanding your goals and requirements',
              order: 1
            },
            {
              id: '2',
              number: 2,
              title: 'Design',
              description: 'Creating wireframes and visual designs',
              order: 2
            },
            {
              id: '3',
              number: 3,
              title: 'Development',
              description: 'Building the solution with clean code',
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
          description: 'Expert web development services including custom websites, web applications, and digital solutions.',
          keywords: ['web development', 'react', 'typescript', 'nodejs']
        }
      };

      const response = await request(app)
        .put('/api/services')
        .send(completeServicesData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Services data updated successfully');
      expect(response.body.data.hero.title).toBe(completeServicesData.hero.title);
      expect(response.body.data.services.services).toHaveLength(1);
      expect(response.body.data.skillsVideo.skills).toHaveLength(5);
    });

    it('should return validation errors for invalid complete data', async () => {
      const invalidServicesData = {
        hero: {
          title: '', // Invalid
          description: 'Valid description'
        },
        services: {
          services: [] // Invalid - no services
        },
        skillsVideo: {
          description: 'Valid description',
          skills: [], // Invalid - too few skills
          ctaText: 'CTA',
          ctaUrl: '/work',
          video: {
            url: 'invalid-url', // Invalid URL
            caption: 'Caption',
            autoplay: false,
            loop: true,
            muted: true
          }
        },
        approach: {
          description: 'Valid description',
          steps: [] // Invalid - too few steps
        },
        testimonials: { testimonials: [] },
        clients: { clients: [] },
        seo: {
          title: 'Valid title',
          description: 'Valid description',
          keywords: []
        }
      };

      const response = await request(app)
        .put('/api/services')
        .send(invalidServicesData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/services/publish', () => {
    beforeEach(async () => {
      // Create valid content for publishing
      await prisma.servicesContent.createMany({
        data: [
          {
            section: 'hero',
            fieldName: 'title',
            fieldValue: 'Professional Services',
            fieldType: 'text',
            displayOrder: 1
          },
          {
            section: 'hero',
            fieldName: 'description',
            fieldValue: 'We provide professional web development services with over 17 years of experience',
            fieldType: 'textarea',
            displayOrder: 2
          },
          {
            section: 'services',
            fieldName: 'services',
            fieldValue: JSON.stringify([
              {
                id: '1',
                number: 1,
                title: 'Web Development',
                description: 'Custom websites',
                color: '#FF6B6B',
                colorClass: 'text-red-500',
                order: 1
              }
            ]),
            fieldType: 'json',
            displayOrder: 1
          },
          {
            section: 'skills',
            fieldName: 'description',
            fieldValue: 'I specialize in modern technologies',
            fieldType: 'textarea',
            displayOrder: 1
          },
          {
            section: 'skills',
            fieldName: 'skills',
            fieldValue: JSON.stringify([
              { id: '1', name: 'React', order: 1 },
              { id: '2', name: 'TypeScript', order: 2 },
              { id: '3', name: 'Node.js', order: 3 },
              { id: '4', name: 'Python', order: 4 },
              { id: '5', name: 'PostgreSQL', order: 5 }
            ]),
            fieldType: 'json',
            displayOrder: 2
          },
          {
            section: 'skills',
            fieldName: 'ctaText',
            fieldValue: 'See all projects',
            fieldType: 'text',
            displayOrder: 3
          },
          {
            section: 'skills',
            fieldName: 'ctaUrl',
            fieldValue: '/work',
            fieldType: 'url',
            displayOrder: 4
          },
          {
            section: 'skills',
            fieldName: 'video',
            fieldValue: JSON.stringify({
              url: 'https://example.com/video.mp4',
              caption: 'Development showcase',
              autoplay: false,
              loop: true,
              muted: true
            }),
            fieldType: 'json',
            displayOrder: 5
          },
          {
            section: 'approach',
            fieldName: 'description',
            fieldValue: 'My proven process',
            fieldType: 'textarea',
            displayOrder: 1
          },
          {
            section: 'approach',
            fieldName: 'steps',
            fieldValue: JSON.stringify([
              {
                id: '1',
                number: 1,
                title: 'Discovery',
                description: 'Understanding requirements',
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
            ]),
            fieldType: 'json',
            displayOrder: 2
          },
          {
            section: 'testimonials',
            fieldName: 'testimonials',
            fieldValue: JSON.stringify([]),
            fieldType: 'json',
            displayOrder: 1
          },
          {
            section: 'clients',
            fieldName: 'clients',
            fieldValue: JSON.stringify([]),
            fieldType: 'json',
            displayOrder: 1
          }
        ]
      });
    });

    it('should publish services content successfully', async () => {
      const response = await request(app)
        .post('/api/services/publish')
        .send({ createBackup: true, versionName: 'Test publish' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Services content published successfully');
      expect(response.body.data.publishedAt).toBeDefined();
      expect(response.body.data.sections).toEqual(['hero', 'services', 'skills', 'approach', 'testimonials', 'clients']);

      // Verify version was created
      const versions = await prisma.servicesVersion.findMany();
      expect(versions.length).toBe(1);
      expect(versions[0].versionName).toBe('Test publish');
    });

    it('should publish without creating backup when requested', async () => {
      const response = await request(app)
        .post('/api/services/publish')
        .send({ createBackup: false })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify no version was created
      const versions = await prisma.servicesVersion.findMany();
      expect(versions.length).toBe(0);
    });

    it('should fail to publish invalid content', async () => {
      // Clear existing content and add invalid content
      await prisma.servicesContent.deleteMany({});
      await prisma.servicesContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: '', // Invalid - empty title
          fieldType: 'text',
          displayOrder: 1
        }
      });

      const response = await request(app)
        .post('/api/services/publish')
        .send({ createBackup: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Content validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Version Management', () => {
    beforeEach(async () => {
      // Create some test content
      await prisma.servicesContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: 'Test Title',
          fieldType: 'text',
          displayOrder: 1
        }
      });
    });

    it('should create a version', async () => {
      const response = await request(app)
        .post('/api/services/versions')
        .send({ versionName: 'Test Version' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Version created successfully');
      expect(response.body.data.versionName).toBe('Test Version');
    });

    it('should list versions', async () => {
      // Create a version first
      await request(app)
        .post('/api/services/versions')
        .send({ versionName: 'Test Version' });

      const response = await request(app)
        .get('/api/services/versions/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].versionName).toBe('Test Version');
    });

    it('should restore a version', async () => {
      // Create a version
      const createResponse = await request(app)
        .post('/api/services/versions')
        .send({ versionName: 'Test Version' });

      const versionId = createResponse.body.data.id;

      // Modify content
      await prisma.servicesContent.update({
        where: {
          section_fieldName: {
            section: 'hero',
            fieldName: 'title'
          }
        },
        data: { fieldValue: 'Modified Title' }
      });

      // Restore version
      const response = await request(app)
        .post(`/api/services/versions/${versionId}/restore`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Version restored successfully');

      // Clear cache and verify content was restored
      const { cacheService } = await import('../services/cacheService');
      await cacheService.invalidatePattern('services:*');
      
      const content = await prisma.servicesContent.findUnique({
        where: {
          section_fieldName: {
            section: 'hero',
            fieldName: 'title'
          }
        }
      });
      expect(content?.fieldValue).toBe('Test Title');
    });

    it('should delete a version', async () => {
      // Create a version
      const createResponse = await request(app)
        .post('/api/services/versions')
        .send({ versionName: 'Test Version' });

      const versionId = createResponse.body.data.id;

      // Delete version
      const response = await request(app)
        .delete(`/api/services/versions/${versionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Version deleted successfully');

      // Verify version was deleted
      const versions = await prisma.servicesVersion.findMany();
      expect(versions.length).toBe(0);
    });
  });

  describe('Media Upload', () => {
    it('should handle media upload for services content', async () => {
      // This test would require setting up file upload mocking
      // For now, we'll test the endpoint exists and returns appropriate error
      const response = await request(app)
        .post('/api/services/media')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by trying to access non-existent version
      const response = await request(app)
        .post('/api/services/versions/non-existent-id/restore')
        .expect(404);

      expect(response.body.error).toBe('Version not found');
    });

    it('should handle malformed JSON in section updates', async () => {
      const response = await request(app)
        .put('/api/services/hero')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express will handle malformed JSON and return 400
    });
  });
});