import { PrismaClient } from '@prisma/client';
import {
  HomepageContent,
  HomepageVersion,
  HomepageSection,
  HomepageData,
  CreateHomepageContentInput,
  UpdateHomepageContentInput,
  HeroSection,
  BrandsSection,
  ServicesSection,
  OfferSection,
  TestimonialsSection,
  FooterSection,
  ContentTransformer,
  FieldType
} from '../../../shared/types/homepage';

// Type for Prisma database results
type PrismaHomepageContent = {
  id: string;
  section: string;
  fieldName: string;
  fieldValue: string | null;
  fieldType: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaHomepageVersion = {
  id: string;
  versionName: string | null;
  contentSnapshot: string;
  isActive: boolean;
  createdAt: Date;
};

const prisma = new PrismaClient();

export class HomepageService {
  // Get all content for a specific section
  async getSectionContent(section: HomepageSection): Promise<HomepageContent[]> {
    const results = await prisma.homepageContent.findMany({
      where: { section },
      orderBy: { displayOrder: 'asc' }
    });
    return this.mapPrismaToHomepageContent(results);
  }

  // Get all homepage content
  async getAllContent(): Promise<HomepageContent[]> {
    const results = await prisma.homepageContent.findMany({
      orderBy: [
        { section: 'asc' },
        { displayOrder: 'asc' }
      ]
    });
    return this.mapPrismaToHomepageContent(results);
  }

  // Update or create content for a field
  async upsertContent(input: CreateHomepageContentInput): Promise<HomepageContent> {
    const result = await prisma.homepageContent.upsert({
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
    return this.mapPrismaToHomepageContent([result])[0];
  }

  // Update multiple content fields for a section
  async updateSectionContent(
    section: HomepageSection, 
    updates: CreateHomepageContentInput[]
  ): Promise<HomepageContent[]> {
    const results: HomepageContent[] = [];
    
    for (const update of updates) {
      const result = await this.upsertContent({
        ...update,
        section
      });
      results.push(result);
    }
    
    return results;
  }

  // Map Prisma results to our typed interfaces
  private mapPrismaToHomepageContent(results: PrismaHomepageContent[]): HomepageContent[] {
    return results.map(result => ({
      ...result,
      section: result.section as HomepageSection,
      fieldType: result.fieldType as FieldType
    }));
  }

  private mapPrismaToHomepageVersion(results: PrismaHomepageVersion[]): HomepageVersion[] {
    return results.map(result => ({
      ...result
    }));
  }

  // Delete content field
  async deleteContent(section: HomepageSection, fieldName: string): Promise<void> {
    await prisma.homepageContent.delete({
      where: {
        section_fieldName: {
          section,
          fieldName
        }
      }
    });
  }

  // Version management
  async createVersion(versionName?: string, contentSnapshot?: HomepageData): Promise<HomepageVersion> {
    // If no snapshot provided, create one from current content
    let snapshot = contentSnapshot;
    if (!snapshot) {
      snapshot = await this.getStructuredContent();
    }

    // Deactivate current active version
    await prisma.homepageVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    return await prisma.homepageVersion.create({
      data: {
        versionName,
        contentSnapshot: JSON.stringify(snapshot),
        isActive: true
      }
    });
  }

  // Get all versions
  async getVersions(limit: number = 10): Promise<HomepageVersion[]> {
    const results = await prisma.homepageVersion.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return this.mapPrismaToHomepageVersion(results);
  }

  // Get specific version
  async getVersion(id: string): Promise<HomepageVersion | null> {
    const result = await prisma.homepageVersion.findUnique({
      where: { id }
    });
    return result ? this.mapPrismaToHomepageVersion([result])[0] : null;
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
    const snapshot: HomepageData = JSON.parse(version.contentSnapshot);
    
    // Clear existing content
    await prisma.homepageContent.deleteMany();

    // Restore content from snapshot
    await this.restoreContentFromSnapshot(snapshot);

    // Mark this version as active
    await prisma.homepageVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    await prisma.homepageVersion.update({
      where: { id },
      data: { isActive: true }
    });
  }

  // Get structured content (organized by sections)
  async getStructuredContent(): Promise<HomepageData> {
    const allContent = await this.getAllContent();
    
    return {
      hero: this.transformToHeroSection(allContent.filter(c => c.section === 'hero')),
      brands: this.transformToBrandsSection(allContent.filter(c => c.section === 'brands')),
      services: this.transformToServicesSection(allContent.filter(c => c.section === 'services')),
      offer: this.transformToOfferSection(allContent.filter(c => c.section === 'offer')),
      testimonials: this.transformToTestimonialsSection(allContent.filter(c => c.section === 'testimonials')),
      footer: this.transformToFooterSection(allContent.filter(c => c.section === 'footer'))
    };
  }

  // Content transformation methods
  private transformToHeroSection(content: HomepageContent[]): HeroSection {
    const getField = (fieldName: string) => 
      content.find(c => c.fieldName === fieldName)?.fieldValue || '';

    return {
      title: getField('title'),
      description: getField('description'),
      videoUrl: getField('videoUrl')
    };
  }

  private transformToBrandsSection(content: HomepageContent[]): BrandsSection {
    const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
    const logosJson = content.find(c => c.fieldName === 'logos')?.fieldValue || '[]';
    
    return {
      title,
      logos: JSON.parse(logosJson)
    };
  }

  private transformToServicesSection(content: HomepageContent[]): ServicesSection {
    const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
    const description = content.find(c => c.fieldName === 'description')?.fieldValue || '';
    const servicesJson = content.find(c => c.fieldName === 'services')?.fieldValue || '[]';
    
    return {
      title,
      description,
      services: JSON.parse(servicesJson)
    };
  }

  private transformToOfferSection(content: HomepageContent[]): OfferSection {
    const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
    const pointsJson = content.find(c => c.fieldName === 'points')?.fieldValue || '[]';
    
    return {
      title,
      points: JSON.parse(pointsJson)
    };
  }

  private transformToTestimonialsSection(content: HomepageContent[]): TestimonialsSection {
    const testimonialsJson = content.find(c => c.fieldName === 'testimonials')?.fieldValue || '[]';
    
    return {
      testimonials: JSON.parse(testimonialsJson)
    };
  }

  private transformToFooterSection(content: HomepageContent[]): FooterSection {
    const getField = (fieldName: string) => 
      content.find(c => c.fieldName === fieldName)?.fieldValue || '';

    const linksJson = content.find(c => c.fieldName === 'links')?.fieldValue || '{"site":[],"professional":[],"social":[]}';
    
    return {
      title: getField('title'),
      email: getField('email'),
      copyright: getField('copyright'),
      links: JSON.parse(linksJson)
    };
  }

  // Restore content from snapshot
  private async restoreContentFromSnapshot(snapshot: HomepageData): Promise<void> {
    const contentToRestore: CreateHomepageContentInput[] = [
      // Hero section
      { section: 'hero', fieldName: 'title', fieldValue: snapshot.hero.title, fieldType: 'text' },
      { section: 'hero', fieldName: 'description', fieldValue: snapshot.hero.description, fieldType: 'textarea' },
      { section: 'hero', fieldName: 'videoUrl', fieldValue: snapshot.hero.videoUrl, fieldType: 'url' },
      
      // Brands section
      { section: 'brands', fieldName: 'title', fieldValue: snapshot.brands.title, fieldType: 'text' },
      { section: 'brands', fieldName: 'logos', fieldValue: JSON.stringify(snapshot.brands.logos), fieldType: 'json' },
      
      // Services section
      { section: 'services', fieldName: 'title', fieldValue: snapshot.services.title, fieldType: 'text' },
      { section: 'services', fieldName: 'description', fieldValue: snapshot.services.description, fieldType: 'textarea' },
      { section: 'services', fieldName: 'services', fieldValue: JSON.stringify(snapshot.services.services), fieldType: 'json' },
      
      // Offer section
      { section: 'offer', fieldName: 'title', fieldValue: snapshot.offer.title, fieldType: 'text' },
      { section: 'offer', fieldName: 'points', fieldValue: JSON.stringify(snapshot.offer.points), fieldType: 'json' },
      
      // Testimonials section
      { section: 'testimonials', fieldName: 'testimonials', fieldValue: JSON.stringify(snapshot.testimonials.testimonials), fieldType: 'json' },
      
      // Footer section
      { section: 'footer', fieldName: 'title', fieldValue: snapshot.footer.title, fieldType: 'text' },
      { section: 'footer', fieldName: 'email', fieldValue: snapshot.footer.email, fieldType: 'text' },
      { section: 'footer', fieldName: 'copyright', fieldValue: snapshot.footer.copyright, fieldType: 'text' },
      { section: 'footer', fieldName: 'links', fieldValue: JSON.stringify(snapshot.footer.links), fieldType: 'json' }
    ];

    for (const content of contentToRestore) {
      await this.upsertContent(content);
    }
  }

  // Cleanup old versions (keep only the latest N versions)
  async cleanupOldVersions(keepCount: number = 10): Promise<void> {
    const versions = await prisma.homepageVersion.findMany({
      orderBy: { createdAt: 'desc' },
      skip: keepCount
    });

    if (versions.length > 0) {
      const idsToDelete = versions.map(v => v.id);
      await prisma.homepageVersion.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      });
    }
  }
}

export const homepageService = new HomepageService();