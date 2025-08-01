// Services Service Integration Test
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { servicesService } from '../services/servicesService';
import { prisma } from '../lib/prisma';

describe('Services Service Integration with Validation', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.servicesContent.deleteMany({});
    await prisma.servicesVersion.deleteMany({});
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.servicesContent.deleteMany({});
    await prisma.servicesVersion.deleteMany({});
  });

  it('should validate content integrity with new validation service', async () => {
    // Create some basic content using the correct method
    await servicesService.updateSectionContent('hero', [
      { section: 'hero', fieldName: 'title', fieldValue: 'Test Title', fieldType: 'text' },
      { section: 'hero', fieldName: 'description', fieldValue: 'Test Description', fieldType: 'textarea' }
    ]);

    await servicesService.updateSectionContent('services', [
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
        fieldType: 'json' 
      }
    ]);

    await servicesService.updateSectionContent('skills', [
      { section: 'skills', fieldName: 'description', fieldValue: 'I specialize in modern technologies', fieldType: 'textarea' },
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
        fieldType: 'json' 
      },
      { section: 'skills', fieldName: 'ctaText', fieldValue: 'See all projects', fieldType: 'text' },
      { section: 'skills', fieldName: 'ctaUrl', fieldValue: '/work', fieldType: 'url' },
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
        fieldType: 'json' 
      }
    ]);

    await servicesService.updateSectionContent('approach', [
      { section: 'approach', fieldName: 'description', fieldValue: 'My proven process', fieldType: 'textarea' },
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
        fieldType: 'json' 
      }
    ]);

    await servicesService.updateSectionContent('testimonials', [
      { 
        section: 'testimonials', 
        fieldName: 'testimonials', 
        fieldValue: JSON.stringify([]), 
        fieldType: 'json' 
      }
    ]);

    await servicesService.updateSectionContent('clients', [
      { 
        section: 'clients', 
        fieldName: 'clients', 
        fieldValue: JSON.stringify([]), 
        fieldType: 'json' 
      }
    ]);

    // Test validation
    const result = await servicesService.validateContentIntegrity();
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    // May have warnings about empty testimonials/clients
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('should validate section data using new validation service', async () => {
    const heroData = {
      title: 'Professional Web Development',
      description: 'I create modern, responsive websites and applications.',
      highlightText: '17+ years'
    };

    const result = await servicesService.validateSectionData('hero', heroData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate field in real-time', async () => {
    const error = await servicesService.validateField('hero', 'title', '');
    
    expect(error).not.toBeNull();
    expect(error?.field).toBe('title');
    expect(error?.code).toBe('REQUIRED_FIELD');
  });

  it('should validate field with valid value', async () => {
    const error = await servicesService.validateField('hero', 'title', 'Valid Title');
    
    expect(error).toBeNull();
  });

  it('should handle invalid section in validateSectionData', async () => {
    const result = await servicesService.validateSectionData('unknown' as any, {});
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('UNKNOWN_SECTION');
  });

  it('should detect validation errors in content integrity check', async () => {
    // Create invalid content
    await servicesService.updateSectionContent('hero', [
      { section: 'hero', fieldName: 'title', fieldValue: '', fieldType: 'text' }, // Invalid - empty title
      { section: 'hero', fieldName: 'description', fieldValue: 'Valid description', fieldType: 'textarea' }
    ]);

    await servicesService.updateSectionContent('services', [
      { 
        section: 'services', 
        fieldName: 'services', 
        fieldValue: JSON.stringify([]), // Invalid - no services
        fieldType: 'json' 
      }
    ]);

    const result = await servicesService.validateContentIntegrity();
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    // Should have errors for no services and other validation issues
    const servicesError = result.errors.find(e => e.field === 'services');
    const skillsError = result.errors.find(e => e.field === 'skills');
    
    expect(servicesError).toBeDefined();
    expect(servicesError?.code).toBe('MIN_ITEMS_REQUIRED');
    expect(skillsError).toBeDefined();
    expect(skillsError?.code).toBe('MIN_ITEMS_REQUIRED');
  });
});