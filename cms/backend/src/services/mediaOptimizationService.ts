import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ImageVariant {
  width: number;
  height?: number;
  quality: number;
  suffix: string;
}

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

export class MediaOptimizationService {
  private readonly imageVariants: ImageVariant[] = [
    { width: 320, quality: 75, suffix: 'mobile' },
    { width: 768, quality: 80, suffix: 'tablet' },
    { width: 1024, quality: 85, suffix: 'desktop' },
    { width: 1920, quality: 90, suffix: 'large' }
  ];

  async optimizeImage(inputPath: string): Promise<OptimizationResult> {
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;
    
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const dir = path.dirname(inputPath);
    
    // Main optimized image
    const optimizedPath = path.join(dir, `${baseName}.webp`);
    
    // Create main optimized version
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(optimizedPath);
    
    // Generate responsive variants
    const variants = [];
    for (const variant of this.imageVariants) {
      const variantPath = path.join(dir, `${baseName}-${variant.suffix}.webp`);
      
      const info = await sharp(inputPath)
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
    const thumbnailPath = path.join(dir, `${baseName}-thumb.webp`);
    await sharp(inputPath)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);
    
    // Calculate compression ratio
    const optimizedStats = await fs.stat(optimizedPath);
    const compressionRatio = (originalSize - optimizedStats.size) / originalSize;
    
    // Remove original file
    await fs.unlink(inputPath);
    
    return {
      originalPath: inputPath,
      optimizedPath,
      variants,
      thumbnailPath,
      compressionRatio
    };
  }

  async generateResponsiveImages(inputPath: string): Promise<string[]> {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const dir = path.dirname(inputPath);
    const generatedPaths = [];
    
    for (const variant of this.imageVariants) {
      const variantPath = path.join(dir, `${baseName}-${variant.suffix}.webp`);
      
      await sharp(inputPath)
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

  async compressImage(inputPath: string, quality: number = 85): Promise<string> {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const dir = path.dirname(inputPath);
    const outputPath = path.join(dir, `${baseName}-compressed.webp`);
    
    await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputPath);
    
    return outputPath;
  }

  async createThumbnail(inputPath: string, size: number = 300): Promise<string> {
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const dir = path.dirname(inputPath);
    const thumbnailPath = path.join(dir, `${baseName}-thumb.webp`);
    
    await sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  }

  generateSrcSet(basePath: string, filename: string): string {
    const baseName = path.basename(filename, path.extname(filename));
    const srcSetEntries = this.imageVariants.map(variant => {
      const variantFilename = `${baseName}-${variant.suffix}.webp`;
      return `${basePath}/${variantFilename} ${variant.width}w`;
    });
    
    return srcSetEntries.join(', ');
  }

  generateSizes(): string {
    return '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px';
  }

  async getImageMetadata(imagePath: string) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  async validateImage(imagePath: string): Promise<boolean> {
    try {
      await sharp(imagePath).metadata();
      return true;
    } catch (error) {
      console.error('Invalid image file:', error);
      return false;
    }
  }
}

export const mediaOptimizationService = new MediaOptimizationService();