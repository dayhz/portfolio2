"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homepageService = exports.HomepageService = void 0;
const client_1 = require("@prisma/client");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
class HomepageService {
    // Get all content for a specific section
    async getSectionContent(section) {
        // Try to get from cache first
        const cacheKey = `homepage:section:${section}`;
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const results = await prisma.homepageContent.findMany({
            where: { section },
            orderBy: { displayOrder: 'asc' }
        });
        const content = this.mapPrismaToHomepageContent(results);
        // Cache the result for 30 minutes
        await cacheService_1.cacheService.set(cacheKey, content, 1800);
        return content;
    }
    // Get all homepage content
    async getAllContent() {
        // Try to get from cache first
        const cacheKey = 'homepage:all:content';
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const results = await prisma.homepageContent.findMany({
            orderBy: [
                { section: 'asc' },
                { displayOrder: 'asc' }
            ]
        });
        const content = this.mapPrismaToHomepageContent(results);
        // Cache the result for 30 minutes
        await cacheService_1.cacheService.set(cacheKey, content, 1800);
        return content;
    }
    // Update or create content for a field
    async upsertContent(input) {
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
        // Invalidate related caches
        await this.invalidateCache(input.section);
        return this.mapPrismaToHomepageContent([result])[0];
    }
    // Update multiple content fields for a section
    async updateSectionContent(section, updates, createBackup = true) {
        // Create automatic backup before major changes
        if (createBackup) {
            await this.createVersion(`Auto-backup before ${section} update`);
        }
        const results = [];
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
        }
        catch (error) {
            console.error('Error updating section content:', error);
            // Attempt automatic recovery by restoring the last backup
            try {
                await this.recoverFromError();
            }
            catch (recoveryError) {
                console.error('Failed to recover from error:', recoveryError);
            }
            throw error;
        }
    }
    // Map Prisma results to our typed interfaces
    mapPrismaToHomepageContent(results) {
        return results.map(result => ({
            ...result,
            section: result.section,
            fieldType: result.fieldType
        }));
    }
    mapPrismaToHomepageVersion(results) {
        return results.map(result => ({
            ...result
        }));
    }
    // Delete content field
    async deleteContent(section, fieldName) {
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
    async createVersion(versionName, contentSnapshot) {
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
    async getVersions(limit = 10) {
        const results = await prisma.homepageVersion.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return this.mapPrismaToHomepageVersion(results);
    }
    // Get specific version
    async getVersion(id) {
        const result = await prisma.homepageVersion.findUnique({
            where: { id }
        });
        return result ? this.mapPrismaToHomepageVersion([result])[0] : null;
    }
    // Restore version
    async restoreVersion(id) {
        const version = await this.getVersion(id);
        if (!version) {
            throw new Error('Version not found');
        }
        // Create backup of current state
        await this.createVersion('Auto-backup before restore');
        // Parse the snapshot and restore content
        const snapshot = JSON.parse(version.contentSnapshot);
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
    async getStructuredContent() {
        // Try to get from cache first
        const cacheKey = 'homepage:structured';
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const allContent = await this.getAllContent();
        const structuredData = {
            hero: this.transformToHeroSection(allContent.filter(c => c.section === 'hero')),
            brands: this.transformToBrandsSection(allContent.filter(c => c.section === 'brands')),
            services: this.transformToServicesSection(allContent.filter(c => c.section === 'services')),
            work: this.transformToWorkSection(allContent.filter(c => c.section === 'work')),
            offer: this.transformToOfferSection(allContent.filter(c => c.section === 'offer')),
            testimonials: this.transformToTestimonialsSection(allContent.filter(c => c.section === 'testimonials')),
            footer: this.transformToFooterSection(allContent.filter(c => c.section === 'footer'))
        };
        // Cache the result for 30 minutes
        await cacheService_1.cacheService.set(cacheKey, structuredData, 1800);
        return structuredData;
    }
    // Content transformation methods
    transformToHeroSection(content) {
        const getField = (fieldName) => content.find(c => c.fieldName === fieldName)?.fieldValue || '';
        return {
            title: getField('title'),
            description: getField('description'),
            videoUrl: getField('videoUrl')
        };
    }
    transformToBrandsSection(content) {
        const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
        const logosJson = content.find(c => c.fieldName === 'logos')?.fieldValue || '[]';
        return {
            title,
            logos: JSON.parse(logosJson)
        };
    }
    transformToServicesSection(content) {
        const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
        const description = content.find(c => c.fieldName === 'description')?.fieldValue || '';
        const servicesJson = content.find(c => c.fieldName === 'services')?.fieldValue || '[]';
        return {
            title,
            description,
            services: JSON.parse(servicesJson)
        };
    }
    transformToWorkSection(content) {
        const getField = (fieldName) => content.find(c => c.fieldName === fieldName)?.fieldValue || '';
        return {
            title: getField('title'),
            description: getField('description'),
            linkText: getField('linkText'),
            linkUrl: getField('linkUrl')
        };
    }
    transformToOfferSection(content) {
        const title = content.find(c => c.fieldName === 'title')?.fieldValue || '';
        const pointsJson = content.find(c => c.fieldName === 'points')?.fieldValue || '[]';
        return {
            title,
            points: JSON.parse(pointsJson)
        };
    }
    transformToTestimonialsSection(content) {
        const testimonialsJson = content.find(c => c.fieldName === 'testimonials')?.fieldValue || '[]';
        return {
            testimonials: JSON.parse(testimonialsJson)
        };
    }
    transformToFooterSection(content) {
        const getField = (fieldName) => content.find(c => c.fieldName === fieldName)?.fieldValue || '';
        const linksJson = content.find(c => c.fieldName === 'links')?.fieldValue || '{"site":[],"professional":[],"social":[]}';
        return {
            title: getField('title'),
            email: getField('email'),
            copyright: getField('copyright'),
            links: JSON.parse(linksJson)
        };
    }
    // Restore content from snapshot
    async restoreContentFromSnapshot(snapshot) {
        const contentToRestore = [
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
            // Work section
            { section: 'work', fieldName: 'title', fieldValue: snapshot.work.title, fieldType: 'text' },
            { section: 'work', fieldName: 'description', fieldValue: snapshot.work.description, fieldType: 'textarea' },
            { section: 'work', fieldName: 'linkText', fieldValue: snapshot.work.linkText, fieldType: 'text' },
            { section: 'work', fieldName: 'linkUrl', fieldValue: snapshot.work.linkUrl, fieldType: 'text' },
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
    // Delete a specific version
    async deleteVersion(id) {
        await prisma.homepageVersion.delete({
            where: { id }
        });
    }
    // Cleanup old versions (keep only the latest N versions)
    async cleanupOldVersions(keepCount = 10) {
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
    // Error recovery - restore to the most recent backup
    async recoverFromError() {
        console.log('Attempting automatic recovery...');
        // Find the most recent auto-backup
        const latestBackup = await prisma.homepageVersion.findFirst({
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
        }
        else {
            console.log('No auto-backup found for recovery');
        }
    }
    // Create emergency backup (used before risky operations)
    async createEmergencyBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return await this.createVersion(`Emergency-backup-${timestamp}`);
    }
    // Cache management methods
    async invalidateCache(section) {
        await Promise.all([
            cacheService_1.cacheService.del(`homepage:section:${section}`),
            cacheService_1.cacheService.del('homepage:all:content'),
            cacheService_1.cacheService.del('homepage:structured')
        ]);
    }
    async invalidateAllCaches() {
        await cacheService_1.cacheService.invalidatePattern('homepage:*');
    }
    // Get section with caching
    async getSection(section) {
        const cacheKey = `homepage:${section}`;
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const content = await this.getSectionContent(section);
        let sectionData;
        switch (section) {
            case 'hero':
                sectionData = this.transformToHeroSection(content);
                break;
            case 'brands':
                sectionData = this.transformToBrandsSection(content);
                break;
            case 'services':
                sectionData = this.transformToServicesSection(content);
                break;
            case 'work':
                sectionData = this.transformToWorkSection(content);
                break;
            case 'offer':
                sectionData = this.transformToOfferSection(content);
                break;
            case 'testimonials':
                sectionData = this.transformToTestimonialsSection(content);
                break;
            case 'footer':
                sectionData = this.transformToFooterSection(content);
                break;
            default:
                sectionData = {};
        }
        await cacheService_1.cacheService.set(cacheKey, sectionData, 1800);
        return sectionData;
    }
    // Validate content integrity
    async validateContentIntegrity() {
        const errors = [];
        try {
            const content = await this.getStructuredContent();
            // Check if all required sections exist
            const requiredSections = ['hero', 'brands', 'services', 'work', 'offer', 'testimonials', 'footer'];
            for (const section of requiredSections) {
                if (!content[section]) {
                    errors.push(`Missing section: ${section}`);
                }
            }
            // Check hero section
            if (!content.hero.title || !content.hero.description) {
                errors.push('Hero section missing required fields');
            }
            // Check brands section
            if (!Array.isArray(content.brands.logos)) {
                errors.push('Brands section logos is not an array');
            }
            // Check services section
            if (!Array.isArray(content.services.services)) {
                errors.push('Services section services is not an array');
            }
            // Check testimonials section
            if (!Array.isArray(content.testimonials.testimonials)) {
                errors.push('Testimonials section testimonials is not an array');
            }
            // Check footer section
            if (!content.footer.email || !content.footer.copyright) {
                errors.push('Footer section missing required fields');
            }
            return {
                isValid: errors.length === 0,
                errors
            };
        }
        catch (error) {
            errors.push(`Content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                isValid: false,
                errors
            };
        }
    }
}
exports.HomepageService = HomepageService;
exports.homepageService = new HomepageService();
//# sourceMappingURL=homepageService.js.map