import { PrismaClient } from '@prisma/client';
import {
  ServicesContent,
  ServicesVersion,
  ServicesSection,
  ServicesData,
  CreateServicesContentInput,
  UpdateServicesContentInput,
  HeroSectionData,
  ServicesGridData,
  SkillsVideoData,
  ApproachData,
  TestimonialsData,
  ClientsData,
  ValidationError,
  ValidationResult,
  FieldType
} from '../../../shared/types/services';
import { cacheService } from './cacheService';
import { prisma } from '../lib/prisma';
import { servicesValidationService } from './servicesValidationService';

// Type for Prisma database results
type PrismaServicesContent = {
  id: string;
  section: string;
  fieldName: string;
  fieldValue: string | null;
  fieldType: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaServicesVersion = {
  id: string;
  versionName: string | null;
  contentSnapshot: string;
  isActive: boolean;
  createdAt: Date;
};

export class ServicesService {
  // Get all content for a specific section
  async getSectionContent(section: ServicesSection): Promise<ServicesContent[]> {
    // Try to get from cache first
    const cacheKey = `services:section:${section}`;
    const cached = await cacheService.get<ServicesContent[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const results = await prisma.servicesContent.findMany({
      where: { section },
      orderBy: { displayOrder: 'asc' }
    });
    
    const content = this.mapPrismaToServicesContent(results);
    
    // Cache the result for 30 minutes
    await cacheService.set(cacheKey, content, 1800);
    
    return content;
  }

  // Get all services content
  async getAllContent(): Promise<ServicesContent[]> {
    // Try to get from cache first
    const cacheKey = 'services:all:content';
    const cached = await cacheService.get<ServicesContent[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const results = await prisma.servicesContent.findMany({
      orderBy: [
        { section: 'asc' },
        { displayOrder: 'asc' }
      ]
    });
    
    const content = this.mapPrismaToServicesContent(results);
    
    // Cache the result for 30 minutes
    await cacheService.set(cacheKey, content, 1800);
    
    return content;
  }

  // Update or create content for a field
  async upsertContent(input: CreateServicesContentInput): Promise<ServicesContent> {
    const result = await prisma.servicesContent.upsert({
      where: {
        section_fieldName: {
          section: input.section,
          fieldName: input.fieldName
        }
      },
      update: {
        fieldValue: input.fieldValue,
        fieldType: input.fieldType,
        displayOrder: input.displayOrder,
        updatedAt: new Date()
      },
      create: input
    });
    
    // Invalidate related caches
    await this.invalidateCache(input.section);
    
    return this.mapPrismaToServicesContent([result])[0];
  }

  // Update multiple content fields for a section
  async updateSectionContent(
    section: ServicesSection, 
    updates: CreateServicesContentInput[],
    createBackup: boolean = true
  ): Promise<ServicesContent[]> {
    // Create automatic backup before major changes
    if (createBackup) {
      await this.createVersion(`Auto-backup before ${section} update`);
    }

    const results: ServicesContent[] = [];
    
    try {
      for (const update of updates) {
        const result = await this.upsertContent({
          ...update,
          section
        });
        results.push(result);
      }
      
      // Invalidate all caches after bulk update
      await this.invalidateAllCaches();
      
      // Cleanup old versions after successful update
      await this.cleanupOldVersions(10);
      
      return results;
    } catch (error) {
      console.error('Error updating section content:', error);
      
      // Attempt automatic recovery by restoring the last backup
      try {
        await this.recoverFromError();
      } catch (recoveryError) {
        console.error('Failed to recover from error:', recoveryError);
      }
      
      throw error;
    }
  }

  // Map Prisma results to our typed interfaces
  private mapPrismaToServicesContent(results: PrismaServicesContent[]): ServicesContent[] {
    return results.map(result => ({
      ...result,
      section: result.section as ServicesSection,
      fieldType: result.fieldType as FieldType
    }));
  }

  private mapPrismaToServicesVersion(results: PrismaServicesVersion[]): ServicesVersion[] {
    return results.map(result => ({
      ...result
    }));
  }

  // Delete content field
  async deleteContent(section: ServicesSection, fieldName: string): Promise<void> {
    await prisma.servicesContent.delete({
      where: {
        section_fieldName: {
          section,
          fieldName
        }
      }
    });
  }

  // Version management
  async createVersion(versionName?: string, contentSnapshot?: ServicesData): Promise<ServicesVersion> {
    // If no snapshot provided, create one from current content
    let snapshot = contentSnapshot;
    if (!snapshot) {
      snapshot = await this.getStructuredContent();
    }

    // Deactivate current active version
    await prisma.servicesVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    return await prisma.servicesVersion.create({
      data: {
        versionName,
        contentSnapshot: JSON.stringify(snapshot),
        isActive: true
      }
    });
  }

  // Get all versions
  async getVersions(limit: number = 10): Promise<ServicesVersion[]> {
    const results = await prisma.servicesVersion.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return this.mapPrismaToServicesVersion(results);
  }

  // Get specific version
  async getVersion(id: string): Promise<ServicesVersion | null> {
    const result = await prisma.servicesVersion.findUnique({
      where: { id }
    });
    return result ? this.mapPrismaToServicesVersion([result])[0] : null;
  }

  // Restore version
  async restoreVersion(id: string): Promise<void> {
    const version = await this.getVersion(id);
    if (!version) {
      throw new Error('Version not found');
    }

    // Create backup of current state
    await this.createVersion('Auto-backup before restore');

    // Parse the snapshot and restore content
    const snapshot: ServicesData = JSON.parse(version.contentSnapshot);
    
    // Clear existing content
    await prisma.servicesContent.deleteMany();

    // Restore content from snapshot
    await this.restoreContentFromSnapshot(snapshot);

    // Mark this version as active
    await prisma.servicesVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    await prisma.servicesVersion.update({
      where: { id },
      data: { isActive: true }
    });
  }

  // Get structured content (organized by sections)
  async getStructuredContent(): Promise<ServicesData> {
    // Try to get from cache first
    const cacheKey = 'services:structured';
    const cached = await cacheService.get<ServicesData>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const allContent = await this.getAllContent();
    
    const structuredData: ServicesData = {
      id: 'services-page',
      version: 1,
      lastModified: new Date(),
      isPublished: false,
      hero: this.transformToHeroSection(allContent.filter(c => c.section === 'hero')),
      services: this.transformToServicesSection(allContent.filter(c => c.section === 'services')),
      skillsVideo: this.transformToSkillsVideoSection(allContent.filter(c => c.section === 'skills')),
      approach: this.transformToApproachSection(allContent.filter(c => c.section === 'approach')),
      testimonials: this.transformToTestimonialsSection(allContent.filter(c => c.section === 'testimonials')),
      clients: this.transformToClientsSection(allContent.filter(c => c.section === 'clients')),
      seo: {
        title: 'Services - Victor Berbel Portfolio',
        description: 'Independent Product Designer with over 17 years of experience designing websites, SaaS platforms, and mobile apps.',
        keywords: ['product design', 'UX design', 'UI design', 'web design', 'mobile design']
      }
    };
    
    // Cache the result for 30 minutes
    await cacheService.set(cacheKey, structuredData, 1800);
    
    return structuredData;
  }

  // Content transformation methods
  private transformToHeroSection(content: ServicesContent[]): HeroSectionData {
    const getField = (fieldName: string) => 
      content.find(c => c.fieldName === fieldName)?.fieldValue || '';

    return {
      title: getField('title') || 'Services',
      description: getField('description') || 'Independent Product Designer with over 17 years of experience designing websites, SaaS platforms, and mobile apps from big corporations to small startups.',
      highlightText: getField('highlightText') || '17+ years'
    };
  }

  private transformToServicesSection(content: ServicesContent[]): ServicesGridData {
    const servicesJson = content.find(c => c.fieldName === 'services')?.fieldValue || '[]';
    
    return {
      services: JSON.parse(servicesJson)
    };
  }

  private transformToSkillsVideoSection(content: ServicesContent[]): SkillsVideoData {
    const getField = (fieldName: string) => 
      content.find(c => c.fieldName === fieldName)?.fieldValue || '';

    const skillsJson = content.find(c => c.fieldName === 'skills')?.fieldValue || '[]';
    const videoJson = content.find(c => c.fieldName === 'video')?.fieldValue || '{}';
    
    return {
      description: getField('description') || 'The ideal balance between UX and UI is what makes a winning product.',
      skills: JSON.parse(skillsJson),
      ctaText: getField('ctaText') || 'See all projects',
      ctaUrl: getField('ctaUrl') || '/work',
      video: JSON.parse(videoJson)
    };
  }

  private transformToApproachSection(content: ServicesContent[]): ApproachData {
    const getField = (fieldName: string) => 
      content.find(c => c.fieldName === fieldName)?.fieldValue || '';

    const stepsJson = content.find(c => c.fieldName === 'steps')?.fieldValue || '[]';
    const videoJson = content.find(c => c.fieldName === 'video')?.fieldValue || '{}';
    
    return {
      title: getField('title') || 'Approach',
      description: getField('description') || 'The ideal balance between UX and UI is what makes a winning product. The sweet spot is the combination of both, and my four-step process gives you the ultimate framework for design.',
      video: JSON.parse(videoJson) || {
        url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/sweet-spot-60fps.mp4",
        caption: "Sweet spot animation",
        autoplay: true,
        loop: true,
        muted: true
      },
      ctaText: getField('ctaText') || "Let's work together!",
      ctaUrl: getField('ctaUrl') || "contact.html",
      steps: JSON.parse(stepsJson)
    };
  }

  private transformToTestimonialsSection(content: ServicesContent[]): TestimonialsData {
    const testimonialsJson = content.find(c => c.fieldName === 'testimonials')?.fieldValue || '[]';
    
    return {
      testimonials: JSON.parse(testimonialsJson)
    };
  }

  private transformToClientsSection(content: ServicesContent[]): ClientsData {
    const clientsJson = content.find(c => c.fieldName === 'clients')?.fieldValue || '[]';
    
    return {
      clients: JSON.parse(clientsJson)
    };
  }

  // Restore content from snapshot
  private async restoreContentFromSnapshot(snapshot: ServicesData): Promise<void> {
    const contentToRestore: CreateServicesContentInput[] = [
      // Hero section
      { section: 'hero', fieldName: 'title', fieldValue: snapshot.hero.title, fieldType: 'text' },
      { section: 'hero', fieldName: 'description', fieldValue: snapshot.hero.description, fieldType: 'textarea' },
      { section: 'hero', fieldName: 'highlightText', fieldValue: snapshot.hero.highlightText || '', fieldType: 'text' },
      
      // Services section
      { section: 'services', fieldName: 'services', fieldValue: JSON.stringify(snapshot.services.services), fieldType: 'json' },
      
      // Skills & Video section
      { section: 'skills', fieldName: 'description', fieldValue: snapshot.skillsVideo.description, fieldType: 'textarea' },
      { section: 'skills', fieldName: 'skills', fieldValue: JSON.stringify(snapshot.skillsVideo.skills), fieldType: 'json' },
      { section: 'skills', fieldName: 'ctaText', fieldValue: snapshot.skillsVideo.ctaText, fieldType: 'text' },
      { section: 'skills', fieldName: 'ctaUrl', fieldValue: snapshot.skillsVideo.ctaUrl, fieldType: 'url' },
      { section: 'skills', fieldName: 'video', fieldValue: JSON.stringify(snapshot.skillsVideo.video), fieldType: 'json' },
      
      // Approach section
      { section: 'approach', fieldName: 'description', fieldValue: snapshot.approach.description, fieldType: 'textarea' },
      { section: 'approach', fieldName: 'steps', fieldValue: JSON.stringify(snapshot.approach.steps), fieldType: 'json' },
      
      // Testimonials section
      { section: 'testimonials', fieldName: 'testimonials', fieldValue: JSON.stringify(snapshot.testimonials.testimonials), fieldType: 'json' },
      
      // Clients section
      { section: 'clients', fieldName: 'clients', fieldValue: JSON.stringify(snapshot.clients.clients), fieldType: 'json' }
    ];

    for (const content of contentToRestore) {
      await this.upsertContent(content);
    }
  }

  // Delete a specific version
  async deleteVersion(id: string): Promise<void> {
    await prisma.servicesVersion.delete({
      where: { id }
    });
  }

  // Cleanup old versions (keep only the latest N versions)
  async cleanupOldVersions(keepCount: number = 10): Promise<void> {
    const versions = await prisma.servicesVersion.findMany({
      orderBy: { createdAt: 'desc' },
      skip: keepCount
    });

    if (versions.length > 0) {
      const idsToDelete = versions.map(v => v.id);
      await prisma.servicesVersion.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      });
    }
  }

  // Error recovery - restore to the most recent backup
  async recoverFromError(): Promise<void> {
    console.log('Attempting automatic recovery...');
    
    // Find the most recent auto-backup
    const latestBackup = await prisma.servicesVersion.findFirst({
      where: {
        versionName: {
          startsWith: 'Auto-backup'
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (latestBackup) {
      console.log(`Restoring from backup: ${latestBackup.versionName}`);
      await this.restoreVersion(latestBackup.id);
    } else {
      console.log('No auto-backup found for recovery');
    }
  }

  // Create emergency backup (used before risky operations)
  async createEmergencyBackup(): Promise<ServicesVersion> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return await this.createVersion(`Emergency-backup-${timestamp}`);
  }

  // Cache management methods
  private async invalidateCache(section: ServicesSection): Promise<void> {
    await Promise.all([
      cacheService.del(`services:section:${section}`),
      cacheService.del('services:all:content'),
      cacheService.del('services:structured')
    ]);
  }

  private async invalidateAllCaches(): Promise<void> {
    await cacheService.invalidatePattern('services:*');
  }

  // Get section with caching
  async getSection(section: ServicesSection): Promise<any> {
    const cacheKey = `services:${section}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const content = await this.getSectionContent(section);
    let sectionData;

    switch (section) {
      case 'hero':
        sectionData = this.transformToHeroSection(content);
        break;
      case 'services':
        sectionData = this.transformToServicesSection(content);
        break;
      case 'skills':
        sectionData = this.transformToSkillsVideoSection(content);
        break;
      case 'approach':
        sectionData = this.transformToApproachSection(content);
        break;
      case 'testimonials':
        sectionData = this.transformToTestimonialsSection(content);
        break;
      case 'clients':
        sectionData = this.transformToClientsSection(content);
        break;
      default:
        sectionData = {};
    }

    await cacheService.set(cacheKey, sectionData, 1800);
    return sectionData;
  }

  // Validate content integrity using comprehensive validation service
  async validateContentIntegrity(): Promise<ValidationResult> {
    try {
      const content = await this.getStructuredContent();
      return await servicesValidationService.validateServicesData(content);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'general',
          section: 'hero',
          message: `Content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  // Validate complete services data
  async validateServicesData(data: ServicesData): Promise<ValidationResult> {
    return await servicesValidationService.validateServicesData(data);
  }

  // Validate specific section data
  async validateSectionData(section: ServicesSection, data: any): Promise<ValidationResult> {
    try {
      switch (section) {
        case 'hero':
          return await servicesValidationService.validateHeroSection(data);
        case 'services':
          return await servicesValidationService.validateServicesGrid(data);
        case 'skills':
          return await servicesValidationService.validateSkillsVideo(data);
        case 'approach':
          return await servicesValidationService.validateApproach(data);
        case 'testimonials':
          return await servicesValidationService.validateTestimonials(data);
        case 'clients':
          return await servicesValidationService.validateClients(data);
        default:
          return {
            isValid: false,
            errors: [{
              field: 'section',
              section,
              message: `Unknown section: ${section}`,
              severity: 'error',
              code: 'UNKNOWN_SECTION'
            }],
            warnings: []
          };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'general',
          section,
          message: `Section validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  // Real-time field validation
  async validateField(section: ServicesSection, field: string, value: any, context?: any): Promise<ValidationError | null> {
    return await servicesValidationService.validateField(section, field, value, context);
  }

  // Publish content - mark as published and update timestamps (simplified like Homepage CMS)
  async publishContent(): Promise<{ publishedAt: string; isPublished: boolean }> {
    const publishedAt = new Date().toISOString();
    
    // TODO: Implement actual publishing logic (same as Homepage CMS)
    // This could involve:
    // - Updating static files
    // - Invalidating caches
    // - Triggering site rebuild
    // - Notifying CDN of changes
    
    // Invalidate all caches after publishing
    await this.invalidateAllCaches();
    
    console.log(`Services page published successfully at ${publishedAt}`);
    
    return {
      publishedAt,
      isPublished: true
    };
  }

  // Get publishing status
  async getPublishingStatus(): Promise<{ isPublished: boolean; publishedAt?: string; lastModified: string }> {
    const content = await this.getStructuredContent();
    
    return {
      isPublished: content.isPublished,
      publishedAt: content.publishedAt?.toISOString(),
      lastModified: content.lastModified.toISOString()
    };
  }
}

export const servicesService = new ServicesService();