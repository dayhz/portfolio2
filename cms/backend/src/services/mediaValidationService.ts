import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface MediaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: any;
  recommendations?: string[];
}

export interface ValidationConfig {
  allowedMimeTypes: string[];
  maxFileSize: number;
  minDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
  aspectRatio?: { min: number; max: number };
  requiredFormats?: string[];
  optimization?: {
    compress: boolean;
    generateThumbnail: boolean;
    generateResponsive: boolean;
  };
}

// Validation configurations for different content types
const VALIDATION_CONFIGS: Record<string, ValidationConfig> = {
  // Logo validation - prefer SVG, allow PNG/JPG
  logo: {
    allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    minDimensions: { width: 100, height: 100 },
    maxDimensions: { width: 2000, height: 2000 },
    aspectRatio: { min: 0.5, max: 3.0 }, // Allow some flexibility for logos
    optimization: {
      compress: true,
      generateThumbnail: true,
      generateResponsive: false // Logos usually don't need responsive variants
    }
  },

  // Avatar validation - square format preferred
  avatar: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    minDimensions: { width: 150, height: 150 },
    maxDimensions: { width: 1000, height: 1000 },
    aspectRatio: { min: 0.8, max: 1.25 }, // Nearly square
    optimization: {
      compress: true,
      generateThumbnail: true,
      generateResponsive: false
    }
  },

  // Project image validation - high quality images
  projectImage: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 15 * 1024 * 1024, // 15MB
    minDimensions: { width: 800, height: 600 },
    maxDimensions: { width: 4000, height: 3000 },
    aspectRatio: { min: 0.5, max: 2.5 },
    optimization: {
      compress: true,
      generateThumbnail: true,
      generateResponsive: true
    }
  },

  // Video validation
  video: {
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    optimization: {
      compress: false, // Video compression is complex
      generateThumbnail: true, // Generate video thumbnail
      generateResponsive: false
    }
  },

  // General image validation
  image: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 5000, height: 5000 },
    optimization: {
      compress: true,
      generateThumbnail: true,
      generateResponsive: true
    }
  },

  // Document validation
  document: {
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
    optimization: {
      compress: false,
      generateThumbnail: false,
      generateResponsive: false
    }
  }
};

export class MediaValidationService {
  /**
   * Validate a media file based on its intended use
   */
  async validateMedia(filePath: string, contentType: string, mimeType: string): Promise<MediaValidationResult> {
    const result: MediaValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    const config = VALIDATION_CONFIGS[contentType];
    if (!config) {
      result.errors.push(`Unknown content type: ${contentType}`);
      result.isValid = false;
      return result;
    }

    try {
      // Check file existence
      const stats = await fs.stat(filePath);
      
      // Validate file size
      if (stats.size > config.maxFileSize) {
        result.errors.push(`File size (${this.formatFileSize(stats.size)}) exceeds maximum allowed size (${this.formatFileSize(config.maxFileSize)})`);
        result.isValid = false;
      }

      // Validate MIME type
      if (!config.allowedMimeTypes.includes(mimeType)) {
        result.errors.push(`MIME type ${mimeType} is not allowed for ${contentType}. Allowed types: ${config.allowedMimeTypes.join(', ')}`);
        result.isValid = false;
      }

      // Image-specific validation
      if (mimeType.startsWith('image/')) {
        const imageValidation = await this.validateImage(filePath, config);
        result.errors.push(...imageValidation.errors);
        result.warnings.push(...imageValidation.warnings);
        result.recommendations.push(...imageValidation.recommendations);
        result.metadata = imageValidation.metadata;
        
        if (imageValidation.errors.length > 0) {
          result.isValid = false;
        }
      }

      // Video-specific validation
      if (mimeType.startsWith('video/')) {
        const videoValidation = await this.validateVideo(filePath, config);
        result.errors.push(...videoValidation.errors);
        result.warnings.push(...videoValidation.warnings);
        result.recommendations.push(...videoValidation.recommendations);
        
        if (videoValidation.errors.length > 0) {
          result.isValid = false;
        }
      }

      // Content-specific recommendations
      this.addContentSpecificRecommendations(result, contentType, mimeType);

    } catch (error) {
      result.errors.push(`Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate image files
   */
  private async validateImage(filePath: string, config: ValidationConfig): Promise<MediaValidationResult> {
    const result: MediaValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      const metadata = await sharp(filePath).metadata();
      result.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        density: metadata.density
      };

      // Validate dimensions
      if (config.minDimensions && metadata.width && metadata.height) {
        if (metadata.width < config.minDimensions.width || metadata.height < config.minDimensions.height) {
          result.errors.push(`Image dimensions (${metadata.width}x${metadata.height}) are below minimum required (${config.minDimensions.width}x${config.minDimensions.height})`);
        }
      }

      if (config.maxDimensions && metadata.width && metadata.height) {
        if (metadata.width > config.maxDimensions.width || metadata.height > config.maxDimensions.height) {
          result.warnings.push(`Image dimensions (${metadata.width}x${metadata.height}) exceed recommended maximum (${config.maxDimensions.width}x${config.maxDimensions.height}). Image will be resized.`);
        }
      }

      // Validate aspect ratio
      if (config.aspectRatio && metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;
        if (aspectRatio < config.aspectRatio.min || aspectRatio > config.aspectRatio.max) {
          result.warnings.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) is outside recommended range (${config.aspectRatio.min}-${config.aspectRatio.max})`);
        }
      }

      // Check for transparency
      if (metadata.hasAlpha && metadata.format !== 'png' && metadata.format !== 'webp') {
        result.warnings.push('Image has transparency but is not in PNG or WebP format. Transparency may be lost during optimization.');
      }

      // Check image quality indicators
      if (metadata.density && metadata.density < 72) {
        result.warnings.push('Image has low DPI. Consider using higher resolution images for better quality.');
      }

    } catch (error) {
      result.errors.push(`Failed to read image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validate video files
   */
  private async validateVideo(filePath: string, config: ValidationConfig): Promise<MediaValidationResult> {
    const result: MediaValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      // Basic video validation - in a real implementation, you might use ffprobe
      const stats = await fs.stat(filePath);
      
      // Check if file is too large for web delivery
      if (stats.size > 50 * 1024 * 1024) { // 50MB
        result.warnings.push('Video file is quite large. Consider compressing for better web performance.');
      }

      // Add video-specific recommendations
      result.recommendations.push('Consider using MP4 format with H.264 codec for best browser compatibility');
      result.recommendations.push('Keep video duration under 2 minutes for better user engagement');

    } catch (error) {
      result.errors.push(`Failed to validate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Add content-specific recommendations
   */
  private addContentSpecificRecommendations(result: MediaValidationResult, contentType: string, mimeType: string): void {
    switch (contentType) {
      case 'logo':
        if (mimeType !== 'image/svg+xml') {
          result.recommendations.push('Consider using SVG format for logos to ensure crisp display at all sizes');
        }
        result.recommendations.push('Ensure logo works well on both light and dark backgrounds');
        result.recommendations.push('Use transparent background for better integration');
        break;

      case 'avatar':
        result.recommendations.push('Use square format (1:1 aspect ratio) for best results');
        result.recommendations.push('Ensure face is clearly visible and centered');
        result.recommendations.push('Use high contrast and avoid busy backgrounds');
        break;

      case 'projectImage':
        result.recommendations.push('Use high-quality images to showcase your work effectively');
        result.recommendations.push('Consider the image composition and visual hierarchy');
        result.recommendations.push('Ensure images are well-lit and professionally presented');
        break;

      case 'video':
        result.recommendations.push('Include captions or subtitles for accessibility');
        result.recommendations.push('Provide a compelling thumbnail image');
        result.recommendations.push('Keep file size reasonable for web streaming');
        break;
    }

    // General optimization recommendations
    if (mimeType.startsWith('image/') && mimeType !== 'image/webp') {
      result.recommendations.push('Images will be automatically converted to WebP format for better performance');
    }
  }

  /**
   * Get validation configuration for a content type
   */
  getValidationConfig(contentType: string): ValidationConfig | null {
    return VALIDATION_CONFIGS[contentType] || null;
  }

  /**
   * Get all supported content types
   */
  getSupportedContentTypes(): string[] {
    return Object.keys(VALIDATION_CONFIGS);
  }

  /**
   * Format file size for human reading
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate multiple files at once
   */
  async validateMultipleMedia(files: Array<{ path: string; contentType: string; mimeType: string }>): Promise<MediaValidationResult[]> {
    const results = await Promise.all(
      files.map(file => this.validateMedia(file.path, file.contentType, file.mimeType))
    );
    return results;
  }

  /**
   * Check if a file needs optimization based on validation results
   */
  shouldOptimize(validationResult: MediaValidationResult, contentType: string): boolean {
    const config = VALIDATION_CONFIGS[contentType];
    if (!config?.optimization) return false;

    // Optimize if there are warnings about size or dimensions
    const hasOptimizationWarnings = validationResult.warnings.some(warning => 
      warning.includes('dimensions') || 
      warning.includes('size') || 
      warning.includes('quality')
    );

    return config.optimization.compress && hasOptimizationWarnings;
  }

  /**
   * Get optimization recommendations based on content type
   */
  getOptimizationRecommendations(contentType: string): string[] {
    const config = VALIDATION_CONFIGS[contentType];
    if (!config?.optimization) return [];

    const recommendations: string[] = [];

    if (config.optimization.compress) {
      recommendations.push('Image will be compressed for optimal web delivery');
    }

    if (config.optimization.generateThumbnail) {
      recommendations.push('Thumbnail will be generated for faster loading');
    }

    if (config.optimization.generateResponsive) {
      recommendations.push('Multiple sizes will be generated for responsive design');
    }

    return recommendations;
  }
}

export const mediaValidationService = new MediaValidationService();