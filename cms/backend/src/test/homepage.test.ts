import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { prisma } from './setup';
import { homepageService } from '../services/homepageService';
import { homepageRouter } from '../routes/homepage';

// Create test app without starting server
const app = express();
app.use(cors());
app.use(express.json());

// Mock auth middleware for tests
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', email: 'test@example.com' };
  next();
});

app.use('/api/homepage', homepageRouter);

describe('Homepage API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      }
    });

    // Mock auth token for tests
    authToken = 'Bearer test-token';
  });

  describe('GET /api/homepage', () => {
    it('should return all homepage content', async () => {
      // Seed test data
      await prisma.homepageContent.createMany({
        data: [
          {
            section: 'hero',
            fieldName: 'title',
            fieldValue: 'Test Hero Title',
            fieldType: 'text'
          },
          {
            section: 'hero',
            fieldName: 'description',
            fieldValue: 'Test Hero Description',
            fieldType: 'textarea'
          }
        ]
      });

      const response = await request(app)
        .get('/api/homepage')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hero');
      expect(response.body.hero).toHaveProperty('title', 'Test Hero Title');
      expect(response.body.hero).toHaveProperty('description', 'Test Hero Description');
    });

    it('should return empty sections when no content exists', async () => {
      const response = await request(app)
        .get('/api/homepage')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hero');
      expect(response.body).toHaveProperty('brands');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('offer');
      expect(response.body).toHaveProperty('testimonials');
      expect(response.body).toHaveProperty('footer');
    });
  });

  describe('GET /api/homepage/:section', () => {
    it('should return specific section content', async () => {
      await prisma.homepageContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: 'Hero Title',
          fieldType: 'text'
        }
      });

      const response = await request(app)
        .get('/api/homepage/hero')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Hero Title');
    });

    it('should return 404 for invalid section', async () => {
      const response = await request(app)
        .get('/api/homepage/invalid-section')
        .set('Authorization', authToken);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/homepage/:section', () => {
    it('should update hero section', async () => {
      const heroData = {
        title: 'Updated Hero Title',
        description: 'Updated Hero Description',
        videoUrl: 'https://example.com/video.mp4'
      };

      const response = await request(app)
        .put('/api/homepage/hero')
        .set('Authorization', authToken)
        .send(heroData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify data was saved
      const savedContent = await homepageService.getStructuredContent();
      expect(savedContent.hero.title).toBe(heroData.title);
      expect(savedContent.hero.description).toBe(heroData.description);
      expect(savedContent.hero.videoUrl).toBe(heroData.videoUrl);
    });

    it('should update brands section', async () => {
      const brandsData = {
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

      const response = await request(app)
        .put('/api/homepage/brands')
        .set('Authorization', authToken)
        .send(brandsData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const savedContent = await homepageService.getStructuredContent();
      expect(savedContent.brands.title).toBe(brandsData.title);
      expect(savedContent.brands.logos).toHaveLength(2);
      expect(savedContent.brands.logos[0].name).toBe('Client 1');
    });

    it('should update services section', async () => {
      const servicesData = {
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

      const response = await request(app)
        .put('/api/homepage/services')
        .set('Authorization', authToken)
        .send(servicesData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const savedContent = await homepageService.getStructuredContent();
      expect(savedContent.services.title).toBe(servicesData.title);
      expect(savedContent.services.services).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        description: 'Valid description'
      };

      const response = await request(app)
        .put('/api/homepage/hero')
        .set('Authorization', authToken)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 for invalid section', async () => {
      const response = await request(app)
        .put('/api/homepage/invalid-section')
        .set('Authorization', authToken)
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/homepage/media', () => {
    it('should handle file upload', async () => {
      const response = await request(app)
        .post('/api/homepage/media')
        .set('Authorization', authToken)
        .attach('file', Buffer.from('fake image data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('filename');
    });

    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/homepage/media')
        .set('Authorization', authToken)
        .attach('file', Buffer.from('fake data'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Version Management', () => {
    describe('GET /api/homepage/versions', () => {
      it('should return version history', async () => {
        // Create test versions
        await prisma.homepageVersion.createMany({
          data: [
            {
              versionName: 'Version 1',
              contentSnapshot: JSON.stringify({ hero: { title: 'V1' } }),
              isActive: false
            },
            {
              versionName: 'Version 2',
              contentSnapshot: JSON.stringify({ hero: { title: 'V2' } }),
              isActive: true
            }
          ]
        });

        const response = await request(app)
          .get('/api/homepage/versions')
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('versionName');
        expect(response.body[0]).toHaveProperty('createdAt');
      });
    });

    describe('POST /api/homepage/versions', () => {
      it('should create new version', async () => {
        const versionData = {
          versionName: 'Test Version'
        };

        const response = await request(app)
          .post('/api/homepage/versions')
          .set('Authorization', authToken)
          .send(versionData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.versionName).toBe('Test Version');
      });
    });

    describe('PUT /api/homepage/versions/:id/restore', () => {
      it('should restore version', async () => {
        // Create version to restore
        const version = await prisma.homepageVersion.create({
          data: {
            versionName: 'Restore Test',
            contentSnapshot: JSON.stringify({
              hero: { title: 'Restored Title' }
            }),
            isActive: false
          }
        });

        const response = await request(app)
          .put(`/api/homepage/versions/${version.id}/restore`)
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify content was restored
        const content = await homepageService.getStructuredContent();
        expect(content.hero.title).toBe('Restored Title');
      });

      it('should return 404 for non-existent version', async () => {
        const response = await request(app)
          .put('/api/homepage/versions/999/restore')
          .set('Authorization', authToken);

        expect(response.status).toBe(404);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock database error
      const originalQuery = prisma.homepageContent.findMany;
      prisma.homepageContent.findMany = () => {
        throw new Error('Database connection failed');
      };

      const response = await request(app)
        .get('/api/homepage')
        .set('Authorization', authToken);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');

      // Restore original method
      prisma.homepageContent.findMany = originalQuery;
    });

    it('should handle malformed JSON in requests', async () => {
      const response = await request(app)
        .put('/api/homepage/hero')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/homepage');

      expect(response.status).toBe(401);
    });
  });

  describe('Data Validation', () => {
    it('should validate hero section data', async () => {
      const testCases = [
        {
          data: { title: '' },
          expectedError: 'Title is required'
        },
        {
          data: { title: 'Valid', description: 'a' },
          expectedError: 'Description must be at least 10 characters'
        },
        {
          data: { title: 'Valid', description: 'Valid description', videoUrl: 'invalid-url' },
          expectedError: 'Invalid video URL format'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .put('/api/homepage/hero')
          .set('Authorization', authToken)
          .send(testCase.data);

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain(testCase.expectedError);
      }
    });

    it('should validate services section data', async () => {
      const invalidServicesData = {
        title: 'Services',
        services: [
          {
            // Missing required fields
            title: '',
            description: ''
          }
        ]
      };

      const response = await request(app)
        .put('/api/homepage/services')
        .set('Authorization', authToken)
        .send(invalidServicesData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate offer section with max points limit', async () => {
      const tooManyPoints = {
        title: 'Our Offer',
        points: Array(7).fill(0).map((_, i) => ({
          text: `Point ${i + 1}`,
          order: i + 1
        }))
      };

      const response = await request(app)
        .put('/api/homepage/offer')
        .set('Authorization', authToken)
        .send(tooManyPoints);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Maximum 6 points allowed');
    });

    it('should validate email format in footer', async () => {
      const invalidFooterData = {
        email: 'invalid-email',
        copyright: 'Valid copyright'
      };

      const response = await request(app)
        .put('/api/homepage/footer')
        .set('Authorization', authToken)
        .send(invalidFooterData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Invalid email format');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large content updates efficiently', async () => {
      const largeTestimonialsData = {
        testimonials: Array(50).fill(0).map((_, i) => ({
          text: `This is testimonial number ${i + 1}. `.repeat(20),
          clientName: `Client ${i + 1}`,
          clientTitle: `Title ${i + 1}`,
          clientPhoto: `/images/client${i + 1}.jpg`,
          projectLink: `https://project${i + 1}.com`,
          projectImage: `/images/project${i + 1}.jpg`,
          order: i + 1
        }))
      };

      const startTime = Date.now();
      const response = await request(app)
        .put('/api/homepage/testimonials')
        .set('Authorization', authToken)
        .send(largeTestimonialsData);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(0).map((_, i) => 
        request(app)
          .put('/api/homepage/hero')
          .set('Authorization', authToken)
          .send({
            title: `Concurrent Title ${i}`,
            description: `Concurrent Description ${i}`
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});