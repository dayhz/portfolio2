import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mediaValidationService } from '../services/mediaValidationService';
import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('sharp');

const mockFs = vi.mocked(fs);
const mockSharp = vi.mocked(sharp);

describe('MediaValidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateMedia', () => {
    it('should validate a valid image file', async () => {
      // Mock file stats
      mockFs.stat.mockResolvedValue({
        size: 1024000 // 1MB
      } as any);

      // Mock sharp metadata
      const mockMetadata = {
        width: 1920,
        height: 1080,
        format: 'jpeg',
        channels: 3,
        hasAlpha: false,
        density: 72
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/image.jpg',
        'image',
        'image/jpeg'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata).toEqual(mockMetadata);
    });

    it('should reject file that exceeds size limit', async () => {
      mockFs.stat.mockResolvedValue({
        size: 50 * 1024 * 1024 // 50MB (exceeds 10MB limit for images)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/large-image.jpg',
        'image',
        'image/jpeg'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('File size')
      );
    });

    it('should reject invalid MIME type', async () => {
      mockFs.stat.mockResolvedValue({
        size: 1024000
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/file.txt',
        'image',
        'text/plain'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('MIME type text/plain is not allowed')
      );
    });

    it('should validate logo with specific requirements', async () => {
      mockFs.stat.mockResolvedValue({
        size: 512000 // 512KB
      } as any);

      const mockMetadata = {
        width: 500,
        height: 500,
        format: 'svg',
        channels: 4,
        hasAlpha: true
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/logo.svg',
        'logo',
        'image/svg+xml'
      );

      expect(result.isValid).toBe(true);
      expect(result.recommendations).toContain(
        expect.stringContaining('transparent background')
      );
    });

    it('should warn about non-SVG logos', async () => {
      mockFs.stat.mockResolvedValue({
        size: 512000
      } as any);

      const mockMetadata = {
        width: 500,
        height: 500,
        format: 'png',
        channels: 4,
        hasAlpha: true
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/logo.png',
        'logo',
        'image/png'
      );

      expect(result.isValid).toBe(true);
      expect(result.recommendations).toContain(
        expect.stringContaining('Consider using SVG format')
      );
    });

    it('should validate avatar with aspect ratio requirements', async () => {
      mockFs.stat.mockResolvedValue({
        size: 2048000 // 2MB
      } as any);

      const mockMetadata = {
        width: 400,
        height: 400, // Perfect square
        format: 'jpeg',
        channels: 3,
        hasAlpha: false,
        density: 150
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/avatar.jpg',
        'avatar',
        'image/jpeg'
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about non-square avatars', async () => {
      mockFs.stat.mockResolvedValue({
        size: 2048000
      } as any);

      const mockMetadata = {
        width: 800,
        height: 400, // 2:1 aspect ratio
        format: 'jpeg',
        channels: 3,
        hasAlpha: false
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/avatar.jpg',
        'avatar',
        'image/jpeg'
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        expect.stringContaining('aspect ratio')
      );
    });

    it('should reject images below minimum dimensions', async () => {
      mockFs.stat.mockResolvedValue({
        size: 10000
      } as any);

      const mockMetadata = {
        width: 50,
        height: 50, // Below minimum for avatar (150x150)
        format: 'jpeg',
        channels: 3,
        hasAlpha: false
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/small-avatar.jpg',
        'avatar',
        'image/jpeg'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('below minimum required')
      );
    });

    it('should validate video files', async () => {
      mockFs.stat.mockResolvedValue({
        size: 25 * 1024 * 1024 // 25MB
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/video.mp4',
        'video',
        'video/mp4'
      );

      expect(result.isValid).toBe(true);
      expect(result.recommendations).toContain(
        expect.stringContaining('MP4 format with H.264 codec')
      );
    });

    it('should warn about large video files', async () => {
      mockFs.stat.mockResolvedValue({
        size: 75 * 1024 * 1024 // 75MB
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/large-video.mp4',
        'video',
        'video/mp4'
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        expect.stringContaining('quite large')
      );
    });

    it('should handle unknown content types', async () => {
      const result = await mediaValidationService.validateMedia(
        '/path/to/file.unknown',
        'unknown',
        'application/octet-stream'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown content type: unknown');
    });

    it('should handle file system errors', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));

      const result = await mediaValidationService.validateMedia(
        '/path/to/nonexistent.jpg',
        'image',
        'image/jpeg'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Failed to validate file')
      );
    });

    it('should handle sharp errors for invalid images', async () => {
      mockFs.stat.mockResolvedValue({
        size: 1024000
      } as any);

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockRejectedValue(new Error('Invalid image'))
      } as any);

      const result = await mediaValidationService.validateMedia(
        '/path/to/corrupt.jpg',
        'image',
        'image/jpeg'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Failed to read image metadata')
      );
    });
  });

  describe('getValidationConfig', () => {
    it('should return config for known content types', () => {
      const logoConfig = mediaValidationService.getValidationConfig('logo');
      expect(logoConfig).toBeDefined();
      expect(logoConfig?.allowedMimeTypes).toContain('image/svg+xml');

      const avatarConfig = mediaValidationService.getValidationConfig('avatar');
      expect(avatarConfig).toBeDefined();
      expect(avatarConfig?.aspectRatio).toBeDefined();

      const videoConfig = mediaValidationService.getValidationConfig('video');
      expect(videoConfig).toBeDefined();
      expect(videoConfig?.allowedMimeTypes).toContain('video/mp4');
    });

    it('should return null for unknown content types', () => {
      const config = mediaValidationService.getValidationConfig('unknown');
      expect(config).toBeNull();
    });
  });

  describe('getSupportedContentTypes', () => {
    it('should return all supported content types', () => {
      const types = mediaValidationService.getSupportedContentTypes();
      expect(types).toContain('logo');
      expect(types).toContain('avatar');
      expect(types).toContain('image');
      expect(types).toContain('video');
      expect(types).toContain('projectImage');
      expect(types).toContain('document');
    });
  });

  describe('validateMultipleMedia', () => {
    it('should validate multiple files', async () => {
      mockFs.stat.mockResolvedValue({
        size: 1024000
      } as any);

      const mockMetadata = {
        width: 500,
        height: 500,
        format: 'jpeg'
      };

      mockSharp.mockReturnValue({
        metadata: vi.fn().mockResolvedValue(mockMetadata)
      } as any);

      const files = [
        { path: '/path/to/image1.jpg', contentType: 'image', mimeType: 'image/jpeg' },
        { path: '/path/to/image2.jpg', contentType: 'image', mimeType: 'image/jpeg' }
      ];

      const results = await mediaValidationService.validateMultipleMedia(files);

      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
    });
  });

  describe('shouldOptimize', () => {
    it('should recommend optimization for files with warnings', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ['Image dimensions exceed recommended maximum'],
        recommendations: []
      };

      const shouldOptimize = mediaValidationService.shouldOptimize(validationResult, 'image');
      expect(shouldOptimize).toBe(true);
    });

    it('should not recommend optimization for files without warnings', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        recommendations: []
      };

      const shouldOptimize = mediaValidationService.shouldOptimize(validationResult, 'image');
      expect(shouldOptimize).toBe(false);
    });

    it('should not recommend optimization for content types without compression', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ['File is quite large'],
        recommendations: []
      };

      const shouldOptimize = mediaValidationService.shouldOptimize(validationResult, 'video');
      expect(shouldOptimize).toBe(false);
    });
  });

  describe('getOptimizationRecommendations', () => {
    it('should return optimization recommendations for images', () => {
      const recommendations = mediaValidationService.getOptimizationRecommendations('image');
      
      expect(recommendations).toContain(
        expect.stringContaining('compressed for optimal web delivery')
      );
      expect(recommendations).toContain(
        expect.stringContaining('Thumbnail will be generated')
      );
      expect(recommendations).toContain(
        expect.stringContaining('Multiple sizes will be generated')
      );
    });

    it('should return appropriate recommendations for logos', () => {
      const recommendations = mediaValidationService.getOptimizationRecommendations('logo');
      
      expect(recommendations).toContain(
        expect.stringContaining('compressed for optimal web delivery')
      );
      expect(recommendations).toContain(
        expect.stringContaining('Thumbnail will be generated')
      );
      // Logos don't need responsive variants
      expect(recommendations).not.toContain(
        expect.stringContaining('Multiple sizes will be generated')
      );
    });

    it('should return empty array for unsupported content types', () => {
      const recommendations = mediaValidationService.getOptimizationRecommendations('unknown');
      expect(recommendations).toHaveLength(0);
    });
  });
});