import { describe, it, expect, beforeEach } from 'vitest';
import { homepageService } from '../services/homepageService';
import { prisma } from './setup';

describe('HomepageService', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.homepageContent.deleteMany();
    await prisma.homepageVersion.deleteMany();
  });

  describe('getStructuredContent', () => {
    it('should return hero section data', async () => {
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

      const result = await homepageService.getStructuredContent();
      
      expect(result.hero).toEqual({
        title: 'Test Hero Title',
        description: 'Test Hero Description'
      });
    });

    it('should return brands section with parsed logos', async () => {
      await prisma.homepageContent.createMany({
        data: [
          {
            section: 'brands',
            fieldName: 'title',
            fieldValue: 'Our Clients',
            fieldType: 'text'
          },
          {
            section: 'brands',
            fieldName: 'logos',
            fieldValue: JSON.stringify([
              { name: 'Client 1', logoUrl: '/logo1.png', order: 1 },
              { name: 'Client 2', logoUrl: '/logo2.png', order: 2 }
            ]),
            fieldType: 'json'
          }
        ]
      });

      const result = await HomepageService.getSection('brands');
      
      expect(result.title).toBe('Our Clients');
      expect(result.logos).toHaveLength(2);
      expect(result.logos[0].name).toBe('Client 1');
    });

    it('should return empty object for non-existent section', async () => {
      const result = await HomepageService.getSection('hero');
      expect(result).toEqual({});
    });
  });

  describe('updateSection', () => {
    it('should create new content fields', async () => {
      const heroData = {
        title: 'New Hero Title',
        description: 'New Hero Description',
        videoUrl: 'https://example.com/video.mp4'
      };

      await HomepageService.updateSection('hero', heroData);

      const savedContent = await prisma.homepageContent.findMany({
        where: { section: 'hero' }
      });

      expect(savedContent).toHaveLength(3);
      
      const titleField = savedContent.find(c => c.fieldName === 'title');
      expect(titleField?.fieldValue).toBe('New Hero Title');
    });

    it('should update existing content fields', async () => {
      // Create initial content
      await prisma.homepageContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: 'Old Title',
          fieldType: 'text'
        }
      });

      // Update content
      await HomepageService.updateSection('hero', {
        title: 'Updated Title'
      });

      const updatedContent = await prisma.homepageContent.findFirst({
        where: { section: 'hero', fieldName: 'title' }
      });

      expect(updatedContent?.fieldValue).toBe('Updated Title');
    });

    it('should handle JSON fields correctly', async () => {
      const brandsData = {
        logos: [
          { name: 'Client 1', logoUrl: '/logo1.png', order: 1 },
          { name: 'Client 2', logoUrl: '/logo2.png', order: 2 }
        ]
      };

      await HomepageService.updateSection('brands', brandsData);

      const savedContent = await prisma.homepageContent.findFirst({
        where: { section: 'brands', fieldName: 'logos' }
      });

      expect(savedContent?.fieldType).toBe('json');
      const parsedLogos = JSON.parse(savedContent?.fieldValue || '[]');
      expect(parsedLogos).toHaveLength(2);
    });
  });

  describe('getAllContent', () => {
    it('should return all sections with their content', async () => {
      await prisma.homepageContent.createMany({
        data: [
          {
            section: 'hero',
            fieldName: 'title',
            fieldValue: 'Hero Title',
            fieldType: 'text'
          },
          {
            section: 'brands',
            fieldName: 'title',
            fieldValue: 'Brands Title',
            fieldType: 'text'
          }
        ]
      });

      const result = await HomepageService.getAllContent();

      expect(result).toHaveProperty('hero');
      expect(result).toHaveProperty('brands');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('offer');
      expect(result).toHaveProperty('testimonials');
      expect(result).toHaveProperty('footer');

      expect(result.hero.title).toBe('Hero Title');
      expect(result.brands.title).toBe('Brands Title');
    });

    it('should return empty sections when no content exists', async () => {
      const result = await HomepageService.getAllContent();

      expect(result.hero).toEqual({});
      expect(result.brands).toEqual({});
      expect(result.services).toEqual({});
      expect(result.offer).toEqual({});
      expect(result.testimonials).toEqual({});
      expect(result.footer).toEqual({});
    });
  });

  describe('createVersion', () => {
    it('should create version with current content snapshot', async () => {
      // Add some content first
      await prisma.homepageContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: 'Version Test Title',
          fieldType: 'text'
        }
      });

      const version = await HomepageService.createVersion('Test Version');

      expect(version.versionName).toBe('Test Version');
      expect(version.contentSnapshot).toBeDefined();

      const snapshot = JSON.parse(version.contentSnapshot);
      expect(snapshot.hero.title).toBe('Version Test Title');
    });

    it('should set version as active', async () => {
      const version = await HomepageService.createVersion('Active Version');
      expect(version.isActive).toBe(true);
    });

    it('should deactivate previous versions', async () => {
      // Create first version
      await HomepageService.createVersion('Version 1');
      
      // Create second version
      await HomepageService.createVersion('Version 2');

      const versions = await prisma.homepageVersion.findMany({
        orderBy: { createdAt: 'desc' }
      });

      expect(versions[0].isActive).toBe(true); // Latest version
      expect(versions[1].isActive).toBe(false); // Previous version
    });
  });

  describe('restoreVersion', () => {
    it('should restore content from version snapshot', async () => {
      // Create version with specific content
      const versionContent = {
        hero: { title: 'Restored Title', description: 'Restored Description' },
        brands: { title: 'Restored Brands' }
      };

      const version = await prisma.homepageVersion.create({
        data: {
          versionName: 'Restore Test',
          contentSnapshot: JSON.stringify(versionContent),
          isActive: false
        }
      });

      await HomepageService.restoreVersion(version.id);

      // Check that content was restored
      const heroContent = await HomepageService.getSection('hero');
      const brandsContent = await HomepageService.getSection('brands');

      expect(heroContent.title).toBe('Restored Title');
      expect(heroContent.description).toBe('Restored Description');
      expect(brandsContent.title).toBe('Restored Brands');
    });

    it('should create backup before restoring', async () => {
      // Add current content
      await prisma.homepageContent.create({
        data: {
          section: 'hero',
          fieldName: 'title',
          fieldValue: 'Current Title',
          fieldType: 'text'
        }
      });

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

      const initialVersionCount = await prisma.homepageVersion.count();
      
      await HomepageService.restoreVersion(version.id);

      const finalVersionCount = await prisma.homepageVersion.count();
      expect(finalVersionCount).toBe(initialVersionCount + 1); // Backup created
    });

    it('should throw error for non-existent version', async () => {
      await expect(HomepageService.restoreVersion(999))
        .rejects.toThrow('Version not found');
    });
  });

  describe('getVersions', () => {
    it('should return versions ordered by creation date', async () => {
      await prisma.homepageVersion.createMany({
        data: [
          {
            versionName: 'Version 1',
            contentSnapshot: '{}',
            isActive: false
          },
          {
            versionName: 'Version 2',
            contentSnapshot: '{}',
            isActive: true
          }
        ]
      });

      const versions = await HomepageService.getVersions();

      expect(versions).toHaveLength(2);
      expect(versions[0].versionName).toBe('Version 2'); // Most recent first
      expect(versions[1].versionName).toBe('Version 1');
    });

    it('should limit to 10 versions', async () => {
      // Create 15 versions
      const versionData = Array(15).fill(0).map((_, i) => ({
        versionName: `Version ${i + 1}`,
        contentSnapshot: '{}',
        isActive: i === 14 // Last one is active
      }));

      await prisma.homepageVersion.createMany({ data: versionData });

      const versions = await HomepageService.getVersions();
      expect(versions).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in content fields', async () => {
      await prisma.homepageContent.create({
        data: {
          section: 'brands',
          fieldName: 'logos',
          fieldValue: 'invalid json',
          fieldType: 'json'
        }
      });

      const result = await HomepageService.getSection('brands');
      expect(result.logos).toEqual([]); // Should default to empty array
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalFindMany = prisma.homepageContent.findMany;
      prisma.homepageContent.findMany = () => {
        throw new Error('Database connection failed');
      };

      await expect(HomepageService.getSection('hero'))
        .rejects.toThrow('Database connection failed');

      // Restore original method
      prisma.homepageContent.findMany = originalFindMany;
    });
  });

  describe('Data Integrity', () => {
    it('should maintain field types correctly', async () => {
      const testData = {
        title: 'Text Field',
        description: 'Textarea Field',
        videoUrl: 'https://example.com/video.mp4',
        logos: [{ name: 'Logo 1' }]
      };

      await HomepageService.updateSection('hero', testData);

      const savedFields = await prisma.homepageContent.findMany({
        where: { section: 'hero' }
      });

      const titleField = savedFields.find(f => f.fieldName === 'title');
      const descField = savedFields.find(f => f.fieldName === 'description');
      const urlField = savedFields.find(f => f.fieldName === 'videoUrl');
      const logosField = savedFields.find(f => f.fieldName === 'logos');

      expect(titleField?.fieldType).toBe('text');
      expect(descField?.fieldType).toBe('textarea');
      expect(urlField?.fieldType).toBe('url');
      expect(logosField?.fieldType).toBe('json');
    });

    it('should handle concurrent updates correctly', async () => {
      const updates = Array(5).fill(0).map((_, i) => 
        HomepageService.updateSection('hero', {
          title: `Concurrent Title ${i}`,
          description: `Concurrent Description ${i}`
        })
      );

      await Promise.all(updates);

      const finalContent = await HomepageService.getSection('hero');
      expect(finalContent.title).toMatch(/^Concurrent Title \d$/);
      expect(finalContent.description).toMatch(/^Concurrent Description \d$/);
    });
  });
});