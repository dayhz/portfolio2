import express from 'express';
import { z } from 'zod';
import { homepageService } from '../services/homepageService';
import { HomepageSection, ValidationError } from '../../../shared/types/homepage';
import { uploadMedia, optimizeImage, generateFileUrls } from '../middleware/upload';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Validation schemas
const sectionSchema = z.enum(['hero', 'brands', 'services', 'offer', 'testimonials', 'footer']);

const heroUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  videoUrl: z.string().url('Invalid video URL').optional().or(z.literal(''))
});

const brandsUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  logos: z.array(z.object({
    id: z.number(),
    name: z.string().min(1, 'Logo name is required'),
    logoUrl: z.string().url('Invalid logo URL'),
    order: z.number().min(0)
  }))
});

const servicesUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  services: z.array(z.object({
    id: z.number(),
    number: z.string().min(1, 'Service number is required'),
    title: z.string().min(1, 'Service title is required'),
    description: z.string().min(1, 'Service description is required'),
    link: z.string().min(1, 'Service link is required'),
    colorClass: z.string()
  }))
});

const offerUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  points: z.array(z.object({
    id: z.number(),
    text: z.string().min(1, 'Point text is required'),
    order: z.number().min(0)
  })).max(6, 'Maximum 6 offer points allowed')
});

const testimonialsUpdateSchema = z.object({
  testimonials: z.array(z.object({
    id: z.number(),
    text: z.string().min(1, 'Testimonial text is required'),
    clientName: z.string().min(1, 'Client name is required'),
    clientTitle: z.string().min(1, 'Client title is required'),
    clientPhoto: z.string().url('Invalid client photo URL'),
    projectLink: z.string().url('Invalid project link URL'),
    projectImage: z.string().url('Invalid project image URL'),
    order: z.number().min(0)
  }))
});

const footerUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid email format'),
  copyright: z.string().min(1, 'Copyright is required'),
  links: z.object({
    site: z.array(z.object({
      text: z.string().min(1, 'Link text is required'),
      url: z.string().min(1, 'Link URL is required')
    })),
    professional: z.array(z.object({
      text: z.string().min(1, 'Link text is required'),
      url: z.string().url('Invalid URL format')
    })),
    social: z.array(z.object({
      text: z.string().min(1, 'Link text is required'),
      url: z.string().url('Invalid URL format')
    }))
  })
});

// Middleware for request validation
const validateSection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = sectionSchema.parse(req.params.section);
    req.params.section = section;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid section',
        message: 'Section must be one of: hero, brands, services, offer, testimonials, footer',
        details: error.errors
      });
    }
    next(error);
  }
};

const validateSectionData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as HomepageSection;
    const data = req.body;

    let schema;
    switch (section) {
      case 'hero':
        schema = heroUpdateSchema;
        break;
      case 'brands':
        schema = brandsUpdateSchema;
        break;
      case 'services':
        schema = servicesUpdateSchema;
        break;
      case 'offer':
        schema = offerUpdateSchema;
        break;
      case 'testimonials':
        schema = testimonialsUpdateSchema;
        break;
      case 'footer':
        schema = footerUpdateSchema;
        break;
      default:
        return res.status(400).json({
          error: 'Invalid section',
          message: 'Unknown section type'
        });
    }

    const validatedData = schema.parse(data);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Request data is invalid',
        errors: validationErrors
      });
    }
    next(error);
  }
};

// Error handling middleware specific to homepage routes
const handleHomepageError = (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Homepage API Error:', error);

  // Handle known error types
  if (error.message === 'Version not found') {
    return res.status(404).json({
      error: 'Version not found',
      message: 'The requested version does not exist'
    });
  }

  if (error.message === 'Section not found') {
    return res.status(404).json({
      error: 'Section not found',
      message: 'The requested section does not exist'
    });
  }

  // Handle database errors
  if (error.code === 'P2002') { // Prisma unique constraint error
    return res.status(409).json({
      error: 'Conflict',
      message: 'A record with this data already exists'
    });
  }

  if (error.code === 'P2025') { // Prisma record not found error
    return res.status(404).json({
      error: 'Not found',
      message: 'The requested resource was not found'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Routes

// GET /api/homepage - Get all homepage content
router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const structuredContent = await homepageService.getStructuredContent();
    res.json({
      success: true,
      data: structuredContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/homepage/:section - Get specific section content
router.get('/:section', validateSection, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as HomepageSection;
    const structuredContent = await homepageService.getStructuredContent();
    
    const sectionData = structuredContent[section];
    if (!sectionData) {
      const error = new Error('Section not found');
      return next(error);
    }

    res.json({
      success: true,
      data: sectionData,
      section: section,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/homepage/:section - Update specific section content
router.put('/:section', validateSection, validateSectionData, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as HomepageSection;
    const data = req.body;

    // Transform the section data to database format
    const contentUpdates = transformSectionDataToDatabase(section, data);
    
    // Update the content in the database
    await homepageService.updateSectionContent(section, contentUpdates);

    // Get the updated structured content
    const updatedContent = await homepageService.getStructuredContent();
    const updatedSectionData = updatedContent[section];

    res.json({
      success: true,
      message: `${section} section updated successfully`,
      data: updatedSectionData,
      section: section,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to transform section data to database format
function transformSectionDataToDatabase(section: HomepageSection, data: any) {
  const updates = [];

  switch (section) {
    case 'hero':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'description', fieldValue: data.description, fieldType: 'textarea' as const, displayOrder: 2 },
        { fieldName: 'videoUrl', fieldValue: data.videoUrl || '', fieldType: 'url' as const, displayOrder: 3 }
      );
      break;

    case 'brands':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'logos', fieldValue: JSON.stringify(data.logos), fieldType: 'json' as const, displayOrder: 2 }
      );
      break;

    case 'services':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'description', fieldValue: data.description, fieldType: 'textarea' as const, displayOrder: 2 },
        { fieldName: 'services', fieldValue: JSON.stringify(data.services), fieldType: 'json' as const, displayOrder: 3 }
      );
      break;

    case 'offer':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'points', fieldValue: JSON.stringify(data.points), fieldType: 'json' as const, displayOrder: 2 }
      );
      break;

    case 'testimonials':
      updates.push(
        { fieldName: 'testimonials', fieldValue: JSON.stringify(data.testimonials), fieldType: 'json' as const, displayOrder: 1 }
      );
      break;

    case 'footer':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'email', fieldValue: data.email, fieldType: 'text' as const, displayOrder: 2 },
        { fieldName: 'copyright', fieldValue: data.copyright, fieldType: 'text' as const, displayOrder: 3 },
        { fieldName: 'links', fieldValue: JSON.stringify(data.links), fieldType: 'json' as const, displayOrder: 4 }
      );
      break;

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return updates;
}

// POST /api/homepage/media - Upload media files for homepage content
router.post('/media', uploadMedia.single('file'), optimizeImage, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up invalid file:', cleanupError);
      }

      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, WebP, GIF, MP4, and WebM files are allowed',
        allowedTypes
      });
    }

    if (req.file.size > maxSize) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up oversized file:', cleanupError);
      }

      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        maxSize: maxSize
      });
    }

    // Generate file URLs
    const { url, thumbnailUrl } = generateFileUrls(
      req, 
      req.file.filename, 
      (req.file as any).thumbnailFilename
    );

    // Prepare response data
    const fileData = {
      id: Date.now(), // Simple ID generation for now
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: url,
      thumbnailUrl: thumbnailUrl,
      uploadedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Clean up file if there was an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        if ((req.file as any).thumbnailPath) {
          await fs.unlink((req.file as any).thumbnailPath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file after error:', cleanupError);
      }
    }
    next(error);
  }
});

// POST /api/homepage/media/bulk - Upload multiple media files
router.post('/media/bulk', uploadMedia.array('files', 10), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const uploadedFiles = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        // Validate each file
        if (!allowedTypes.includes(file.mimetype)) {
          await fs.unlink(file.path);
          errors.push({
            file: file.originalname,
            error: 'Invalid file type',
            message: 'Only JPEG, PNG, WebP, GIF, MP4, and WebM files are allowed'
          });
          continue;
        }

        if (file.size > maxSize) {
          await fs.unlink(file.path);
          errors.push({
            file: file.originalname,
            error: 'File too large',
            message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
          });
          continue;
        }

        // Optimize image if it's an image file
        if (file.mimetype.startsWith('image/')) {
          // The optimizeImage middleware should have already processed this
          // but we'll handle it manually for bulk uploads
          // This is a simplified version - in production you might want to use the middleware
        }

        // Generate file URLs
        const { url, thumbnailUrl } = generateFileUrls(
          req, 
          file.filename, 
          (file as any).thumbnailFilename
        );

        uploadedFiles.push({
          id: Date.now() + i, // Simple ID generation
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: url,
          thumbnailUrl: thumbnailUrl,
          uploadedAt: new Date().toISOString()
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        errors.push({
          file: file.originalname,
          error: 'Processing failed',
          message: 'An error occurred while processing this file'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        uploaded: uploadedFiles,
        errors: errors,
        summary: {
          total: req.files.length,
          successful: uploadedFiles.length,
          failed: errors.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Clean up all files if there was a general error
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
          if ((file as any).thumbnailPath) {
            await fs.unlink((file as any).thumbnailPath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file after error:', cleanupError);
        }
      }
    }
    next(error);
  }
});

// DELETE /api/homepage/media/:filename - Delete a media file
router.delete('/media/:filename', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const filename = req.params.filename;
    
    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename',
        message: 'Filename parameter is required'
      });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'Invalid filename',
        message: 'Filename contains invalid characters'
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(process.cwd(), uploadDir, filename);
    const thumbnailPath = path.join(process.cwd(), uploadDir, filename.replace(/\.[^/.]+$/, '-thumb.webp'));

    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Delete main file
      await fs.unlink(filePath);
      
      // Try to delete thumbnail if it exists
      try {
        await fs.access(thumbnailPath);
        await fs.unlink(thumbnailPath);
      } catch (thumbError) {
        // Thumbnail might not exist, that's okay
        console.log('Thumbnail not found or already deleted:', thumbnailPath);
      }

      res.json({
        success: true,
        message: 'File deleted successfully',
        filename: filename,
        timestamp: new Date().toISOString()
      });

    } catch (fileError) {
      if ((fileError as any).code === 'ENOENT') {
        return res.status(404).json({
          error: 'File not found',
          message: 'The specified file does not exist'
        });
      }
      throw fileError;
    }

  } catch (error) {
    next(error);
  }
});

// Brands-specific routes

// POST /api/homepage/brands/logo - Add a new logo to brands section
router.post('/brands/logo', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { name, logoUrl } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Logo name is required and must be a non-empty string'
      });
    }

    if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.match(/^https?:\/\/.+/)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Logo URL is required and must be a valid HTTP/HTTPS URL'
      });
    }

    // Get current brands data
    const structuredContent = await homepageService.getStructuredContent();
    const currentBrands = structuredContent.brands;

    // Generate new ID (find max ID and add 1)
    const maxId = currentBrands.logos.length > 0 
      ? Math.max(...currentBrands.logos.map(logo => logo.id))
      : 0;
    const newId = maxId + 1;

    // Generate new order (add to end)
    const newOrder = currentBrands.logos.length > 0
      ? Math.max(...currentBrands.logos.map(logo => logo.order)) + 1
      : 1;

    // Create new logo
    const newLogo = {
      id: newId,
      name: name.trim(),
      logoUrl: logoUrl.trim(),
      order: newOrder
    };

    // Add to existing logos
    const updatedLogos = [...currentBrands.logos, newLogo];

    // Update the brands section
    const contentUpdates = [
      { fieldName: 'title', fieldValue: currentBrands.title, fieldType: 'text' as const, displayOrder: 1 },
      { fieldName: 'logos', fieldValue: JSON.stringify(updatedLogos), fieldType: 'json' as const, displayOrder: 2 }
    ];

    await homepageService.updateSectionContent('brands', contentUpdates);

    // Get updated content
    const updatedContent = await homepageService.getStructuredContent();

    res.status(201).json({
      success: true,
      message: 'Logo added successfully',
      data: {
        logo: newLogo,
        brands: updatedContent.brands
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/homepage/brands/logo/:id - Remove a logo from brands section
router.delete('/brands/logo/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const logoId = parseInt(req.params.id);

    if (isNaN(logoId)) {
      return res.status(400).json({
        error: 'Invalid logo ID',
        message: 'Logo ID must be a valid number'
      });
    }

    // Get current brands data
    const structuredContent = await homepageService.getStructuredContent();
    const currentBrands = structuredContent.brands;

    // Find the logo to remove
    const logoToRemove = currentBrands.logos.find(logo => logo.id === logoId);
    if (!logoToRemove) {
      return res.status(404).json({
        error: 'Logo not found',
        message: `Logo with ID ${logoId} does not exist`
      });
    }

    // Remove the logo and reorder remaining logos
    const updatedLogos = currentBrands.logos
      .filter(logo => logo.id !== logoId)
      .map((logo, index) => ({
        ...logo,
        order: index + 1 // Reorder starting from 1
      }));

    // Update the brands section
    const contentUpdates = [
      { fieldName: 'title', fieldValue: currentBrands.title, fieldType: 'text' as const, displayOrder: 1 },
      { fieldName: 'logos', fieldValue: JSON.stringify(updatedLogos), fieldType: 'json' as const, displayOrder: 2 }
    ];

    await homepageService.updateSectionContent('brands', contentUpdates);

    // Get updated content
    const updatedContent = await homepageService.getStructuredContent();

    res.json({
      success: true,
      message: 'Logo removed successfully',
      data: {
        removedLogo: logoToRemove,
        brands: updatedContent.brands
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/homepage/brands/reorder - Reorder logos in brands section
router.put('/brands/reorder', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { logoIds } = req.body;

    // Validation
    if (!Array.isArray(logoIds) || logoIds.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'logoIds must be a non-empty array of logo IDs'
      });
    }

    // Validate all IDs are numbers
    const invalidIds = logoIds.filter(id => typeof id !== 'number' || isNaN(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'All logo IDs must be valid numbers',
        invalidIds
      });
    }

    // Get current brands data
    const structuredContent = await homepageService.getStructuredContent();
    const currentBrands = structuredContent.brands;

    // Validate all provided IDs exist
    const existingIds = currentBrands.logos.map(logo => logo.id);
    const missingIds = logoIds.filter(id => !existingIds.includes(id));
    if (missingIds.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Some logo IDs do not exist',
        missingIds
      });
    }

    // Check if all existing logos are included
    const extraIds = existingIds.filter(id => !logoIds.includes(id));
    if (extraIds.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'All existing logos must be included in the reorder',
        missingFromRequest: extraIds
      });
    }

    // Create a map of existing logos for quick lookup
    const logoMap = new Map(currentBrands.logos.map(logo => [logo.id, logo]));

    // Reorder logos according to the provided order
    const reorderedLogos = logoIds.map((id, index) => ({
      ...logoMap.get(id)!,
      order: index + 1
    }));

    // Update the brands section
    const contentUpdates = [
      { fieldName: 'title', fieldValue: currentBrands.title, fieldType: 'text' as const, displayOrder: 1 },
      { fieldName: 'logos', fieldValue: JSON.stringify(reorderedLogos), fieldType: 'json' as const, displayOrder: 2 }
    ];

    await homepageService.updateSectionContent('brands', contentUpdates);

    // Get updated content
    const updatedContent = await homepageService.getStructuredContent();

    res.json({
      success: true,
      message: 'Logos reordered successfully',
      data: {
        brands: updatedContent.brands,
        newOrder: logoIds
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware to all routes
router.use(handleHomepageError);

export { router as homepageRouter, validateSection, validateSectionData, handleHomepageError };