import sharp from 'sharp';
interface OptimizationResult {
    originalPath: string;
    optimizedPath: string;
    variants: Array<{
        path: string;
        width: number;
        height?: number;
        size: number;
    }>;
    thumbnailPath: string;
    compressionRatio: number;
}
export declare class MediaOptimizationService {
    private readonly imageVariants;
    optimizeImage(inputPath: string): Promise<OptimizationResult>;
    generateResponsiveImages(inputPath: string): Promise<string[]>;
    compressImage(inputPath: string, quality?: number): Promise<string>;
    createThumbnail(inputPath: string, size?: number): Promise<string>;
    generateSrcSet(basePath: string, filename: string): string;
    generateSizes(): string;
    getImageMetadata(imagePath: string): Promise<{
        width: number | undefined;
        height: number | undefined;
        format: keyof sharp.FormatEnum | undefined;
        size: number | undefined;
        hasAlpha: boolean | undefined;
        channels: sharp.Channels | undefined;
    } | null>;
    validateImage(imagePath: string): Promise<boolean>;
}
export declare const mediaOptimizationService: MediaOptimizationService;
export {};
//# sourceMappingURL=mediaOptimizationService.d.ts.map