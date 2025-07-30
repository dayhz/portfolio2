"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaOptimizationService = exports.MediaOptimizationService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class MediaOptimizationService {
    constructor() {
        this.imageVariants = [
            { width: 320, quality: 75, suffix: 'mobile' },
            { width: 768, quality: 80, suffix: 'tablet' },
            { width: 1024, quality: 85, suffix: 'desktop' },
            { width: 1920, quality: 90, suffix: 'large' }
        ];
    }
    async optimizeImage(inputPath) {
        const originalStats = await promises_1.default.stat(inputPath);
        const originalSize = originalStats.size;
        const baseName = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const dir = path_1.default.dirname(inputPath);
        // Main optimized image
        const optimizedPath = path_1.default.join(dir, `${baseName}.webp`);
        // Create main optimized version
        await (0, sharp_1.default)(inputPath)
            .webp({ quality: 85, effort: 6 })
            .toFile(optimizedPath);
        // Generate responsive variants
        const variants = [];
        for (const variant of this.imageVariants) {
            const variantPath = path_1.default.join(dir, `${baseName}-${variant.suffix}.webp`);
            const info = await (0, sharp_1.default)(inputPath)
                .resize(variant.width, variant.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: variant.quality, effort: 6 })
                .toFile(variantPath);
            variants.push({
                path: variantPath,
                width: variant.width,
                height: variant.height,
                size: info.size
            });
        }
        // Generate thumbnail
        const thumbnailPath = path_1.default.join(dir, `${baseName}-thumb.webp`);
        await (0, sharp_1.default)(inputPath)
            .resize(300, 300, { fit: 'cover' })
            .webp({ quality: 75 })
            .toFile(thumbnailPath);
        // Calculate compression ratio
        const optimizedStats = await promises_1.default.stat(optimizedPath);
        const compressionRatio = (originalSize - optimizedStats.size) / originalSize;
        // Remove original file
        await promises_1.default.unlink(inputPath);
        return {
            originalPath: inputPath,
            optimizedPath,
            variants,
            thumbnailPath,
            compressionRatio
        };
    }
    async generateResponsiveImages(inputPath) {
        const baseName = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const dir = path_1.default.dirname(inputPath);
        const generatedPaths = [];
        for (const variant of this.imageVariants) {
            const variantPath = path_1.default.join(dir, `${baseName}-${variant.suffix}.webp`);
            await (0, sharp_1.default)(inputPath)
                .resize(variant.width, variant.height, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: variant.quality, effort: 6 })
                .toFile(variantPath);
            generatedPaths.push(variantPath);
        }
        return generatedPaths;
    }
    async compressImage(inputPath, quality = 85) {
        const baseName = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const dir = path_1.default.dirname(inputPath);
        const outputPath = path_1.default.join(dir, `${baseName}-compressed.webp`);
        await (0, sharp_1.default)(inputPath)
            .webp({ quality, effort: 6 })
            .toFile(outputPath);
        return outputPath;
    }
    async createThumbnail(inputPath, size = 300) {
        const baseName = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        const dir = path_1.default.dirname(inputPath);
        const thumbnailPath = path_1.default.join(dir, `${baseName}-thumb.webp`);
        await (0, sharp_1.default)(inputPath)
            .resize(size, size, { fit: 'cover' })
            .webp({ quality: 75 })
            .toFile(thumbnailPath);
        return thumbnailPath;
    }
    generateSrcSet(basePath, filename) {
        const baseName = path_1.default.basename(filename, path_1.default.extname(filename));
        const srcSetEntries = this.imageVariants.map(variant => {
            const variantFilename = `${baseName}-${variant.suffix}.webp`;
            return `${basePath}/${variantFilename} ${variant.width}w`;
        });
        return srcSetEntries.join(', ');
    }
    generateSizes() {
        return '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';
    }
    async getImageMetadata(imagePath) {
        try {
            const metadata = await (0, sharp_1.default)(imagePath).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: metadata.size,
                hasAlpha: metadata.hasAlpha,
                channels: metadata.channels
            };
        }
        catch (error) {
            console.error('Error getting image metadata:', error);
            return null;
        }
    }
    async validateImage(imagePath) {
        try {
            await (0, sharp_1.default)(imagePath).metadata();
            return true;
        }
        catch (error) {
            console.error('Invalid image file:', error);
            return false;
        }
    }
}
exports.MediaOptimizationService = MediaOptimizationService;
exports.mediaOptimizationService = new MediaOptimizationService();
//# sourceMappingURL=mediaOptimizationService.js.map