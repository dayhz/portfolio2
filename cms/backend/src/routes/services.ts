import express from 'express';
import { z } from 'zod';
import { servicesService } from '../services/servicesService';
import { ServicesSection, ValidationError, ServicesData } from '../../../shared/types/services';
import { uploadMedia, optimizeImage, generateFileUrls } from '../middleware/upload';
import path from 'path';
import fs from 'fs/promises';

// Function to publish content to static files
async function publishToStaticFiles(content: ServicesData) {
  try {
    const staticFilePath = path.join(process.cwd(), '../../portfolio2/www.victorberbel.work/services.html');
    
    // Read the current static file
    let htmlContent = await fs.readFile(staticFilePath, 'utf-8');
    
    // Update hero section
    if (content.hero) {
      // Update title
      htmlContent = htmlContent.replace(
        /<h1 class="u-text-style-h2 u-color-white u-align-self-center">\s*([^<]*)\s*<\/h1>/,
        `<h1 class="u-text-style-h2 u-color-white u-align-self-center">
          ${content.hero.title}
         </h1>`
      );
      
      // Update description and highlight text
      const descriptionPattern = /<div class="u-text-style-big text_gray_500 left-mobile"[^>]*>\s*([^<]*)\s*<span class="u-color-white">\s*([^<]*)\s*<\/span>\s*([^<]*)\s*<\/div>/;
      const newDescription = `<div class="u-text-style-big text_gray_500 left-mobile" data-w-id="0fe385c4-c807-0ffe-f6fc-c250bfb174c7" style="opacity:0">
           ${content.hero.description.split(content.hero.highlightText)[0]}
           <span class="u-color-white">
            ${content.hero.highlightText}
           </span>
           ${content.hero.description.split(content.hero.highlightText)[1] || ''}
          </div>`;
      
      htmlContent = htmlContent.replace(descriptionPattern, newDescription);
    }

    // Update services grid section
    if (content.services && content.services.services && content.services.services.length > 0) {
      const services = content.services.services.sort((a, b) => a.order - b.order);
      
      // Update service titles in order (Website, Product, Mobile)
      services.forEach((service, index) => {
        const servicePattern = new RegExp(`(<div class="service_title">)\\s*([^<]*)\\s*(<\/div>)`, 'g');
        let matchCount = 0;
        
        htmlContent = htmlContent.replace(servicePattern, (match, openTag, currentTitle, closeTag) => {
          if (matchCount === index) {
            matchCount++;
            return `${openTag}${service.title}${closeTag}`;
          }
          matchCount++;
          return match;
        });
      });
    }

    // Update skills section - VERY PRECISE targeting to avoid breaking other sections
    if (content.skillsVideo) {
      // Find the skills section specifically (between grid_left and services_video_wrapper)
      const skillsSectionPattern = /(<div class="grid_left">[\s\S]*?)(<div class="services_video_wrapper">)/;
      const skillsSectionMatch = htmlContent.match(skillsSectionPattern);
      
      if (skillsSectionMatch) {
        let skillsSection = skillsSectionMatch[1];
        
        // Update description within skills section only
        if (content.skillsVideo.description) {
          skillsSection = skillsSection.replace(
            /<div class="u-text-style-big u-color-gray-500">\s*([^<]*)\s*<\/div>/,
            `<div class="u-text-style-big u-color-gray-500">
           ${content.skillsVideo.description}
          </div>`
          );
        }

        // Update skills within skills section only - preserve exact structure
        if (content.skillsVideo.skills && content.skillsVideo.skills.length > 0) {
          const skills = content.skillsVideo.skills.sort((a, b) => a.order - b.order);
          
          // Replace ALL skill divs in order - handle both class variations
          let skillIndex = 0;
          
          // Replace all skill divs (both class types) in the order they appear
          skillsSection = skillsSection.replace(
            /<div class="u-text-x-small (u-color-gray-500|text_gray_500)"([^>]*)>\s*([^<]*)\s*<\/div>/g,
            (match, className, attributes, currentSkill) => {
              if (skillIndex < skills.length) {
                const newSkill = skills[skillIndex];
                skillIndex++;
                return `<div class="u-text-x-small ${className}"${attributes}>
            ${newSkill.name}
           </div>`;
              }
              return match;
            }
          );
        }

        // Update CTA text within skills section only
        if (content.skillsVideo.ctaText) {
          skillsSection = skillsSection.replace(
            /<div class="text-link is-footer[^"]*">\s*([^<]*)\s*<\/div>/,
            `<div class="text-link is-footer w-variant-01008168-2897-dfe8-cdb3-65272157938e">
           ${content.skillsVideo.ctaText}
          </div>`
          );
        }

        // Replace the entire skills section back into the HTML
        htmlContent = htmlContent.replace(skillsSectionPattern, skillsSection + '$2');
      }

      // Update video URL (this is safe as it's specific)
      if (content.skillsVideo.video && content.skillsVideo.video.url) {
        htmlContent = htmlContent.replace(
          /<source src="[^"]*" type="video\/mp4"\/>/,
          `<source src="${content.skillsVideo.video.url}" type="video/mp4"/>`
        );
      }

      // Update video caption (this is safe as it's specific)
      if (content.skillsVideo.video && content.skillsVideo.video.caption) {
        htmlContent = htmlContent.replace(
          /<div class="video_description u-color-gray-700">\s*([^<]*)\s*<\/div>/,
          `<div class="video_description u-color-gray-700">
          ${content.skillsVideo.video.caption}
         </div>`
        );
      }
    }

    // Update approach section
    if (content.approach) {
      // Update approach title
      if (content.approach.title) {
        const approachTitlePattern = /(<div class="u-text-style-h2"[^>]*>)\s*([^<]*)\s*(<\/div>)/;
        const approachTitleMatch = htmlContent.match(approachTitlePattern);
        
        if (approachTitleMatch) {
          htmlContent = htmlContent.replace(
            approachTitlePattern,
            `$1
        ${content.approach.title}
       $3`
          );
        }
      }

      // Update approach description
      if (content.approach.description) {
        // Find the approach description section more generically
        const approachDescPattern = /(<div class="approach-left"[^>]*>[\s\S]*?<div class="u-text-style-big">)\s*([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)\s*(<\/div>)/;
        const approachDescMatch = htmlContent.match(approachDescPattern);
        
        if (approachDescMatch) {
          htmlContent = htmlContent.replace(
            approachDescPattern,
            `$1
         ${content.approach.description}
        $3`
          );
        }
      }

      // Update approach video
      if (content.approach.video && content.approach.video.url) {
        const videoPattern = /(<source src=")[^"]*(" type="video\/mp4")/;
        const videoMatch = htmlContent.match(videoPattern);
        
        if (videoMatch) {
          htmlContent = htmlContent.replace(
            videoPattern,
            `$1${content.approach.video.url}$2`
          );
        }
      }

      // Update approach CTA
      if (content.approach.ctaText) {
        const ctaTextPattern = /(<div class="text-link is-footer">\s*)([^<]*)(\s*<\/div>)/;
        const ctaTextMatch = htmlContent.match(ctaTextPattern);
        
        if (ctaTextMatch) {
          htmlContent = htmlContent.replace(
            ctaTextPattern,
            `$1${content.approach.ctaText}$3`
          );
        }
      }

      // Update approach CTA URL
      if (content.approach.ctaUrl) {
        const ctaUrlPattern = /(<a class="c-global-link[^"]*"[^>]*href=")[^"]*(")/;
        const ctaUrlMatch = htmlContent.match(ctaUrlPattern);
        
        if (ctaUrlMatch) {
          htmlContent = htmlContent.replace(
            ctaUrlPattern,
            `$1${content.approach.ctaUrl}$2`
          );
        }
      }

      // Update approach steps
      if (content.approach.steps && content.approach.steps.length > 0) {
        const steps = content.approach.steps.sort((a, b) => a.order - b.order);
        
        // Find the approach steps section
        const approachStepsPattern = /(<div class="approachs_group"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<div class="g_section_space)/;
        const approachMatch = htmlContent.match(approachStepsPattern);
        
        if (approachMatch) {
          let stepsHtml = '';
          
          steps.forEach((step, index) => {
            stepsHtml += `
        <div class="approach-iitem" data-w-id="a1de9ba8-12f0-12ca-6dcc-1d37cc3eee73">
         <div class="approach-check">
          <img alt="" class="icon-check" loading="lazy" src="https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/67eedda55bb860fcb17926f1_check.png"/>
         </div>
         <div class="approach-text-group">
          <div class="approach-header">
           <div class="u-text-style-1rem u-color-gray-500">
            ${step.number}.
           </div>
           <div class="u-text-style-big u-color-dark">
            ${step.title}
           </div>
          </div>
          <div class="u-text-x-small">
           ${step.description}
          </div>
         </div>
        </div>`;
          });
          
          // Replace the entire steps section
          htmlContent = htmlContent.replace(
            approachStepsPattern,
            `$1${stepsHtml}
       $3`
          );
        }
      }
    }

    // Update testimonials section
    if (content.testimonials && content.testimonials.testimonials && content.testimonials.testimonials.length > 0) {
      const testimonials = content.testimonials.testimonials.sort((a, b) => a.order - b.order);
      
      // Generate testimonials HTML using the same generator
      const { testimonialsHtmlGenerator } = await import('../services/testimonialsHtmlGenerator');
      const testimonialsHtml = testimonialsHtmlGenerator.generateTestimonialsSection(content.testimonials);
      
      // Replace the testimonials section in the static file
      const testimonialsPattern = /<div class="mask w-slider-mask">[\s\S]*?<\/div>\s*<\/div>/;
      
      if (testimonialsPattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(testimonialsPattern, testimonialsHtml.trim());
        console.log(`✅ Testimonials section updated with ${testimonials.length} testimonial(s)`);
      } else {
        console.log('⚠️  Testimonials section pattern not found in HTML');
      }
    }
    
    // Write the updated content back to the file
    await fs.writeFile(staticFilePath, htmlContent, 'utf-8');
    
    console.log('✅ Static file updated successfully');
  } catch (error) {
    console.error('❌ Error updating static file:', error);
    throw error;
  }
}

const router = express.Router();

// Validation schemas
const sectionSchema = z.enum(['hero', 'services', 'skills', 'approach', 'testimonials', 'clients']);

const heroUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  highlightText: z.string().max(50, 'Highlight text must be less than 50 characters').optional()
});

const servicesUpdateSchema = z.object({
  services: z.array(z.object({
    id: z.string().min(1, 'Service ID is required'),
    number: z.number().min(1, 'Service number is required'),
    title: z.string().min(1, 'Service title is required').max(100, 'Service title must be less than 100 characters'),
    description: z.string().min(1, 'Service description is required').max(200, 'Service description must be less than 200 characters'),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code'),
    colorClass: z.string().min(1, 'Color class is required'),
    order: z.number().min(0, 'Order must be non-negative')
  })).min(1, 'At least one service is required').max(5, 'Maximum 5 services allowed')
});

const skillsVideoUpdateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  skills: z.array(z.object({
    id: z.string().min(1, 'Skill ID is required'),
    name: z.string().min(1, 'Skill name is required'),
    order: z.number().min(0, 'Order must be non-negative')
  })).min(5, 'At least 5 skills are required').max(20, 'Maximum 20 skills allowed'),
  ctaText: z.string().min(1, 'CTA text is required'),
  ctaUrl: z.string().min(1, 'CTA URL is required'),
  video: z.object({
    url: z.string().url('Invalid video URL'),
    caption: z.string().optional(),
    autoplay: z.boolean().default(true),
    loop: z.boolean().default(true),
    muted: z.boolean().default(true)
  })
});

const approachUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  video: z.object({
    url: z.string().url('Video URL must be valid'),
    caption: z.string().optional(),
    autoplay: z.boolean().optional(),
    loop: z.boolean().optional(),
    muted: z.boolean().optional()
  }),
  ctaText: z.string().min(1, 'CTA text is required').max(50, 'CTA text must be less than 50 characters'),
  ctaUrl: z.string().min(1, 'CTA URL is required').max(200, 'CTA URL must be less than 200 characters'),
  steps: z.array(z.object({
    id: z.string().min(1, 'Step ID is required'),
    number: z.number().min(1, 'Step number is required'),
    title: z.string().min(1, 'Step title is required').max(100, 'Step title must be less than 100 characters'),
    description: z.string().min(1, 'Step description is required').max(300, 'Step description must be less than 300 characters'),
    icon: z.string().optional(),
    order: z.number().min(0, 'Order must be non-negative')
  })).min(3, 'At least 3 steps are required').max(6, 'Maximum 6 steps allowed')
});

const testimonialsUpdateSchema = z.object({
  testimonials: z.array(z.object({
    id: z.string().min(1, 'Testimonial ID is required'),
    text: z.string().min(1, 'Testimonial text is required').max(1000, 'Testimonial text must be less than 1000 characters'),
    author: z.object({
      name: z.string().min(1, 'Author name is required').max(100, 'Author name must be less than 100 characters'),
      title: z.string().min(1, 'Author title is required').max(150, 'Author title must be less than 150 characters'),
      company: z.string().max(100, 'Author company must be less than 100 characters').optional().or(z.literal('')),
      avatar: z.string().optional().or(z.literal(''))
    }),
    project: z.object({
      name: z.string().max(100, 'Project name must be less than 100 characters').optional().or(z.literal('')),
      image: z.string().optional().or(z.literal('')),
      url: z.string().optional().or(z.literal(''))
    }),
    order: z.number().min(0, 'Order must be non-negative')
  }))
});

const clientsUpdateSchema = z.object({
  clients: z.array(z.object({
    id: z.string().min(1, 'Client ID is required'),
    name: z.string().min(1, 'Client name is required').max(100, 'Client name must be less than 100 characters'),
    logo: z.string().url('Invalid logo URL'),
    description: z.string().min(1, 'Client description is required').max(300, 'Client description must be less than 300 characters'),
    industry: z.string().min(1, 'Industry is required').max(50, 'Industry must be less than 50 characters'),
    order: z.number().min(0, 'Order must be non-negative'),
    isActive: z.boolean().default(true)
  }))
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
        message: 'Section must be one of: hero, services, skills, approach, testimonials, clients',
        details: error.errors
      });
    }
    next(error);
  }
};

const validateSectionData = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as ServicesSection;
    const data = req.body;

    let schema;
    switch (section) {
      case 'hero':
        schema = heroUpdateSchema;
        break;
      case 'services':
        schema = servicesUpdateSchema;
        break;
      case 'skills':
        schema = skillsVideoUpdateSchema;
        break;
      case 'approach':
        schema = approachUpdateSchema;
        break;
      case 'testimonials':
        schema = testimonialsUpdateSchema;
        break;
      case 'clients':
        schema = clientsUpdateSchema;
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
        section: req.params.section as ServicesSection,
        message: err.message,
        severity: 'error' as const
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

// Error handling middleware specific to services routes
const handleServicesError = (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Services API Error:', error);

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

// GET /api/services/health - Health check endpoint
router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'services-cms'
  });
});

// GET /api/services/test-publish - Test publish endpoint
router.get('/test-publish', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    console.log('Test publish endpoint called');
    
    // Test basic functionality
    const content = await servicesService.getStructuredContent();
    console.log('Content retrieved for test');
    
    res.json({
      success: true,
      message: 'Test publish endpoint working',
      contentSections: Object.keys(content),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test publish error:', error);
    next(error);
  }
});

// GET /api/services - Get all services content
router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const structuredContent = await servicesService.getStructuredContent();
    res.json({
      success: true,
      data: structuredContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/services - Update complete services data with validation
router.put('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const servicesData = req.body;

    // Validate the complete services data
    const validation = await servicesService.validateServicesData(servicesData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Services data is invalid',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Create backup before making changes
    await servicesService.createVersion('Auto-backup before bulk update');

    // Update all sections
    const sections: Array<{ section: any, data: any }> = [
      { section: 'hero', data: servicesData.hero },
      { section: 'services', data: { services: servicesData.services.services } },
      { section: 'skills', data: servicesData.skillsVideo },
      { section: 'approach', data: servicesData.approach },
      { section: 'testimonials', data: { testimonials: servicesData.testimonials.testimonials } },
      { section: 'clients', data: { clients: servicesData.clients.clients } }
    ];

    for (const { section, data } of sections) {
      const contentUpdates = transformSectionDataToDatabase(section, data);
      await servicesService.updateSectionContent(section, contentUpdates.map(update => ({ ...update, section })), false);
    }

    // Get the updated content
    const updatedContent = await servicesService.getStructuredContent();

    res.json({
      success: true,
      message: 'Services data updated successfully',
      data: updatedContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:section - Get specific section content
router.get('/:section', validateSection, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as ServicesSection;
    const structuredContent = await servicesService.getStructuredContent();
    
    // Map section names to property names
    const sectionPropertyMap: Record<ServicesSection, keyof typeof structuredContent> = {
      'hero': 'hero',
      'services': 'services',
      'skills': 'skillsVideo',
      'approach': 'approach',
      'testimonials': 'testimonials',
      'clients': 'clients'
    };
    
    const propertyName = sectionPropertyMap[section];
    const sectionData = structuredContent[propertyName];
    
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

// PUT /api/services/:section - Update specific section content
router.put('/:section', validateSection, validateSectionData, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const section = req.params.section as ServicesSection;
    const data = req.body;

    // Validate content integrity before making changes
    const validation = await servicesService.validateContentIntegrity();
    if (!validation.isValid) {
      console.warn('Content integrity issues detected:', validation.errors);
      // Create emergency backup before proceeding
      await servicesService.createEmergencyBackup();
    }

    // Transform the section data to database format
    const contentUpdates = transformSectionDataToDatabase(section, data);
    
    // Update the content in the database (this will create automatic backup)
    await servicesService.updateSectionContent(section, contentUpdates.map(update => ({ ...update, section })), true);

    // Get the updated structured content
    const updatedContent = await servicesService.getStructuredContent();
    
    // Map section names to property names
    const sectionPropertyMap: Record<ServicesSection, keyof typeof updatedContent> = {
      'hero': 'hero',
      'services': 'services',
      'skills': 'skillsVideo',
      'approach': 'approach',
      'testimonials': 'testimonials',
      'clients': 'clients'
    };
    
    const propertyName = sectionPropertyMap[section];
    const updatedSectionData = updatedContent[propertyName];

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
function transformSectionDataToDatabase(section: ServicesSection, data: any) {
  const updates = [];

  switch (section) {
    case 'hero':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'description', fieldValue: data.description, fieldType: 'textarea' as const, displayOrder: 2 },
        { fieldName: 'highlightText', fieldValue: data.highlightText || '', fieldType: 'text' as const, displayOrder: 3 }
      );
      break;

    case 'services':
      updates.push(
        { fieldName: 'services', fieldValue: JSON.stringify(data.services), fieldType: 'json' as const, displayOrder: 1 }
      );
      break;

    case 'skills':
      updates.push(
        { fieldName: 'description', fieldValue: data.description, fieldType: 'textarea' as const, displayOrder: 1 },
        { fieldName: 'skills', fieldValue: JSON.stringify(data.skills), fieldType: 'json' as const, displayOrder: 2 },
        { fieldName: 'ctaText', fieldValue: data.ctaText, fieldType: 'text' as const, displayOrder: 3 },
        { fieldName: 'ctaUrl', fieldValue: data.ctaUrl, fieldType: 'url' as const, displayOrder: 4 },
        { fieldName: 'video', fieldValue: JSON.stringify(data.video), fieldType: 'json' as const, displayOrder: 5 }
      );
      break;

    case 'approach':
      updates.push(
        { fieldName: 'title', fieldValue: data.title, fieldType: 'text' as const, displayOrder: 1 },
        { fieldName: 'description', fieldValue: data.description, fieldType: 'textarea' as const, displayOrder: 2 },
        { fieldName: 'video', fieldValue: JSON.stringify(data.video), fieldType: 'json' as const, displayOrder: 3 },
        { fieldName: 'ctaText', fieldValue: data.ctaText, fieldType: 'text' as const, displayOrder: 4 },
        { fieldName: 'ctaUrl', fieldValue: data.ctaUrl, fieldType: 'text' as const, displayOrder: 5 },
        { fieldName: 'steps', fieldValue: JSON.stringify(data.steps), fieldType: 'json' as const, displayOrder: 6 }
      );
      break;

    case 'testimonials':
      updates.push(
        { fieldName: 'testimonials', fieldValue: JSON.stringify(data.testimonials), fieldType: 'json' as const, displayOrder: 1 }
      );
      break;

    case 'clients':
      updates.push(
        { fieldName: 'clients', fieldValue: JSON.stringify(data.clients), fieldType: 'json' as const, displayOrder: 1 }
      );
      break;

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  return updates;
}

// POST /api/services/publish - Publish services content
router.post('/publish', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Get all current content (like Homepage CMS)
    const allContent = await servicesService.getStructuredContent();
    
    // In a real implementation, this would:
    // 1. Apply all staged changes to the live site
    // 2. Update the portfolio site with new content
    // 3. Clear any staging/draft content
    
    const publishedSections = ['hero', 'services', 'skills', 'approach', 'testimonials', 'clients'];
    
    // Implement actual publishing logic
    await publishToStaticFiles(allContent);
    
    res.json({
      success: true,
      data: {
        success: true,
        publishedSections,
        publishedAt: new Date().toISOString(),
        contentId: allContent.id,
        version: allContent.version
      },
      message: `${publishedSections.length} sections published successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Version management routes

// GET /api/services/versions - Get all versions
router.get('/versions/list', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const versions = await servicesService.getVersions(limit);
    
    res.json({
      success: true,
      data: versions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/services/versions - Create a new version
router.post('/versions', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { versionName } = req.body;
    const version = await servicesService.createVersion(versionName);
    
    res.status(201).json({
      success: true,
      message: 'Version created successfully',
      data: version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/services/versions/:id/restore - Restore a specific version
router.post('/versions/:id/restore', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const versionId = req.params.id;
    await servicesService.restoreVersion(versionId);
    
    res.json({
      success: true,
      message: 'Version restored successfully',
      versionId: versionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/versions/:id - Delete a specific version
router.delete('/versions/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const versionId = req.params.id;
    await servicesService.deleteVersion(versionId);
    
    res.json({
      success: true,
      message: 'Version deleted successfully',
      versionId: versionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Media upload routes (similar to homepage)

// POST /api/services/media - Upload media files for services content
router.post('/media', uploadMedia.single('file'), optimizeImage, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm'];
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
        message: 'Only JPEG, PNG, WebP, GIF, SVG, MP4, and WebM files are allowed',
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

// GET /api/services/render - Render dynamic services page
router.get('/render', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const content = await servicesService.getStructuredContent();
    
    // Generate HTML dynamically
    const html = generateServicesHTML(content);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
});

// Helper function to generate HTML
function generateServicesHTML(content: any): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Services - Victor Berbel Portfolio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .hero { text-align: center; margin-bottom: 60px; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; color: #333; }
        .hero .highlight { background: #3B82F6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; }
        .hero p { font-size: 1.2rem; color: #666; line-height: 1.6; max-width: 800px; margin: 20px auto; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 60px 0; }
        .service-card { padding: 30px; border-radius: 12px; text-align: center; transition: transform 0.3s; }
        .service-card:hover { transform: translateY(-5px); }
        .service-card h3 { font-size: 1.5rem; margin-bottom: 15px; }
        .service-card p { color: #666; line-height: 1.6; }
        .service-blue { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; }
        .service-green { background: linear-gradient(135deg, #10B981, #047857); color: white; }
        .service-orange { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; }
        .service-red { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; }
        .service-purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; }
        .service-cyan { background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; }
        .service-pink { background: linear-gradient(135deg, #EC4899, #DB2777); color: white; }
        .service-gray { background: linear-gradient(135deg, #6B7280, #4B5563); color: white; }
        .update-info { background: #E0F2FE; padding: 15px; border-radius: 8px; margin-top: 40px; text-align: center; color: #0369A1; }
        .cms-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; }
        .cms-link:hover { background: #2563EB; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Hero Section -->
        <section class="hero">
            <h1>${content.hero.title}</h1>
            ${content.hero.highlightText ? `<div class="highlight">${content.hero.highlightText}</div>` : ''}
            <p>${content.hero.description}</p>
        </section>

        <!-- Services Grid -->
        <section class="services-grid">
            ${content.services.services.map((service: any) => `
                <div class="service-card ${service.colorClass}">
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                </div>
            `).join('')}
        </section>

        <!-- Update Info -->
        <div class="update-info">
            <p><strong>🎉 Page générée dynamiquement depuis le CMS</strong></p>
            <p>Dernière mise à jour: ${new Date().toLocaleString('fr-FR')}</p>
            <a href="/cms/services" class="cms-link">✏️ Modifier dans le CMS</a>
        </div>
    </div>
</body>
</html>
  `;
}

// Apply error handling middleware
router.use(handleServicesError);

export default router;