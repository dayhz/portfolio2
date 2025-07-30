import { HomepageContent, HomepageVersion, HomepageSection, HomepageData, CreateHomepageContentInput } from '../../../shared/types/homepage';
export declare class HomepageService {
    getSectionContent(section: HomepageSection): Promise<HomepageContent[]>;
    getAllContent(): Promise<HomepageContent[]>;
    upsertContent(input: CreateHomepageContentInput): Promise<HomepageContent>;
    updateSectionContent(section: HomepageSection, updates: CreateHomepageContentInput[], createBackup?: boolean): Promise<HomepageContent[]>;
    private mapPrismaToHomepageContent;
    private mapPrismaToHomepageVersion;
    deleteContent(section: HomepageSection, fieldName: string): Promise<void>;
    createVersion(versionName?: string, contentSnapshot?: HomepageData): Promise<HomepageVersion>;
    getVersions(limit?: number): Promise<HomepageVersion[]>;
    getVersion(id: string): Promise<HomepageVersion | null>;
    restoreVersion(id: string): Promise<void>;
    getStructuredContent(): Promise<HomepageData>;
    private transformToHeroSection;
    private transformToBrandsSection;
    private transformToServicesSection;
    private transformToWorkSection;
    private transformToOfferSection;
    private transformToTestimonialsSection;
    private transformToFooterSection;
    private restoreContentFromSnapshot;
    deleteVersion(id: string): Promise<void>;
    cleanupOldVersions(keepCount?: number): Promise<void>;
    recoverFromError(): Promise<void>;
    createEmergencyBackup(): Promise<HomepageVersion>;
    validateContentIntegrity(): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
}
export declare const homepageService: HomepageService;
//# sourceMappingURL=homepageService.d.ts.map