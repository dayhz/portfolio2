// Services CMS Validation Service
import {
  ServicesData,
  HeroSectionData,
  ServicesGridData,
  ServiceItem,
  SkillsVideoData,
  SkillItem,
  VideoData,
  ApproachData,
  ApproachStep,
  TestimonialsData,
  Testimonial,
  TestimonialAuthor,
  TestimonialProject,
  ClientsData,
  ClientItem,
  ValidationError,
  ValidationResult,
  ValidationRule,
  SectionValidationConfig,
  ServicesSection
} from '../../../shared/types/services';

export class ServicesValidationService {
  private validationConfigs: Map<ServicesSection, SectionValidationConfig> = new Map();

  constructor() {
    this.initializeValidationConfigs();
  }

  /**
   * Validate complete services data
   */
  async validateServicesData(data: ServicesData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Validate each section
      const heroResult = await this.validateHeroSection(data.hero);
      errors.push(...heroResult.errors);
      warnings.push(...heroResult.warnings);

      const servicesResult = await this.validateServicesGrid(data.services);
      errors.push(...servicesResult.errors);
      warnings.push(...servicesResult.warnings);

      const skillsVideoResult = await this.validateSkillsVideo(data.skillsVideo);
      errors.push(...skillsVideoResult.errors);
      warnings.push(...skillsVideoResult.warnings);

      const approachResult = await this.validateApproach(data.approach);
      errors.push(...approachResult.errors);
      warnings.push(...approachResult.warnings);

      const testimonialsResult = await this.validateTestimonials(data.testimonials);
      errors.push(...testimonialsResult.errors);
      warnings.push(...testimonialsResult.warnings);

      const clientsResult = await this.validateClients(data.clients);
      errors.push(...clientsResult.errors);
      warnings.push(...clientsResult.warnings);

      // Validate SEO data
      const seoResult = await this.validateSEO(data.seo);
      errors.push(...seoResult.errors);
      warnings.push(...seoResult.warnings);

      // Cross-section validation
      const crossSectionResult = await this.validateCrossSectionConsistency(data);
      errors.push(...crossSectionResult.errors);
      warnings.push(...crossSectionResult.warnings);

    } catch (error) {
      errors.push({
        field: 'general',
        section: 'hero',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'VALIDATION_ERROR'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate hero section
   */
  async validateHeroSection(data: HeroSectionData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check if data exists and is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push({
        field: 'data',
        section: 'hero',
        message: 'Invalid data format - expected object',
        severity: 'error',
        code: 'INVALID_DATA_FORMAT'
      });
      return { isValid: false, errors, warnings };
    }

    try {
      // Title validation
      if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push({
        field: 'title',
        section: 'hero',
        message: 'Title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.title.length > 200) {
      errors.push({
        field: 'title',
        section: 'hero',
        message: 'Title must be less than 200 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    } else if (data.title.length < 10) {
      warnings.push({
        field: 'title',
        section: 'hero',
        message: 'Title is quite short, consider adding more descriptive text',
        severity: 'warning',
        code: 'MIN_LENGTH_WARNING'
      });
    }

    // Description validation
    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push({
        field: 'description',
        section: 'hero',
        message: 'Description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.description.length > 1000) {
      errors.push({
        field: 'description',
        section: 'hero',
        message: 'Description must be less than 1000 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    } else if (data.description.length < 50) {
      warnings.push({
        field: 'description',
        section: 'hero',
        message: 'Description is quite short, consider adding more detail',
        severity: 'warning',
        code: 'MIN_LENGTH_WARNING'
      });
    }

    // Highlight text validation (optional)
    if (data.highlightText) {
      if (typeof data.highlightText !== 'string') {
        errors.push({
          field: 'highlightText',
          section: 'hero',
          message: 'Highlight text must be a string',
          severity: 'error',
          code: 'INVALID_TYPE'
        });
      } else if (data.highlightText.length > 50) {
        errors.push({
          field: 'highlightText',
          section: 'hero',
          message: 'Highlight text must be less than 50 characters',
          severity: 'error',
          code: 'MAX_LENGTH_EXCEEDED'
        });
      }
    }

    } catch (error) {
      errors.push({
        field: 'general',
        section: 'hero',
        message: `Hero section validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'VALIDATION_ERROR'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate services grid
   */
  async validateServicesGrid(data: ServicesGridData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!data.services || !Array.isArray(data.services)) {
      errors.push({
        field: 'services',
        section: 'services',
        message: 'Services must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return { isValid: false, errors, warnings };
    }

    if (data.services.length < 1) {
      errors.push({
        field: 'services',
        section: 'services',
        message: 'At least 1 service is required',
        severity: 'error',
        code: 'MIN_ITEMS_REQUIRED'
      });
    } else if (data.services.length > 5) {
      errors.push({
        field: 'services',
        section: 'services',
        message: 'Maximum 5 services allowed',
        severity: 'error',
        code: 'MAX_ITEMS_EXCEEDED'
      });
    }

    // Validate each service
    const usedColors = new Set<string>();
    const usedNumbers = new Set<number>();

    data.services.forEach((service, index) => {
      const serviceErrors = this.validateServiceItem(service, index);
      errors.push(...serviceErrors.errors);
      warnings.push(...serviceErrors.warnings);

      // Check for duplicate colors
      if (service.color && usedColors.has(service.color)) {
        warnings.push({
          field: `services[${index}].color`,
          section: 'services',
          message: 'Duplicate color detected, consider using unique colors for better visual distinction',
          severity: 'warning',
          code: 'DUPLICATE_VALUE'
        });
      } else if (service.color) {
        usedColors.add(service.color);
      }

      // Check for duplicate numbers
      if (service.number && usedNumbers.has(service.number)) {
        errors.push({
          field: `services[${index}].number`,
          section: 'services',
          message: 'Duplicate service number detected',
          severity: 'error',
          code: 'DUPLICATE_VALUE'
        });
      } else if (service.number) {
        usedNumbers.add(service.number);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate individual service item
   */
  private validateServiceItem(service: ServiceItem, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // ID validation
    if (!service.id || typeof service.id !== 'string') {
      errors.push({
        field: `services[${index}].id`,
        section: 'services',
        message: 'Service ID is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Number validation
    if (typeof service.number !== 'number' || service.number < 1) {
      errors.push({
        field: `services[${index}].number`,
        section: 'services',
        message: 'Service number must be a positive number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    // Title validation
    if (!service.title || typeof service.title !== 'string' || service.title.trim() === '') {
      errors.push({
        field: `services[${index}].title`,
        section: 'services',
        message: 'Service title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (service.title.length > 100) {
      errors.push({
        field: `services[${index}].title`,
        section: 'services',
        message: 'Service title must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Description validation
    if (!service.description || typeof service.description !== 'string' || service.description.trim() === '') {
      errors.push({
        field: `services[${index}].description`,
        section: 'services',
        message: 'Service description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (service.description.length > 200) {
      errors.push({
        field: `services[${index}].description`,
        section: 'services',
        message: 'Service description must be less than 200 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Color validation
    if (!service.color || typeof service.color !== 'string') {
      errors.push({
        field: `services[${index}].color`,
        section: 'services',
        message: 'Service color is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidHexColor(service.color)) {
      errors.push({
        field: `services[${index}].color`,
        section: 'services',
        message: 'Service color must be a valid hex color code',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    // Color class validation
    if (!service.colorClass || typeof service.colorClass !== 'string') {
      errors.push({
        field: `services[${index}].colorClass`,
        section: 'services',
        message: 'Service color class is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Order validation
    if (typeof service.order !== 'number' || service.order < 0) {
      errors.push({
        field: `services[${index}].order`,
        section: 'services',
        message: 'Service order must be a non-negative number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate skills and video section
   */
  async validateSkillsVideo(data: SkillsVideoData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Description validation
    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push({
        field: 'description',
        section: 'skills',
        message: 'Description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (data.description.length > 500) {
      errors.push({
        field: 'description',
        section: 'skills',
        message: 'Description must be less than 500 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Skills validation
    if (!data.skills || !Array.isArray(data.skills)) {
      errors.push({
        field: 'skills',
        section: 'skills',
        message: 'Skills must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else {
      if (data.skills.length < 5) {
        errors.push({
          field: 'skills',
          section: 'skills',
          message: 'Minimum 5 skills required',
          severity: 'error',
          code: 'MIN_ITEMS_REQUIRED'
        });
      } else if (data.skills.length > 20) {
        errors.push({
          field: 'skills',
          section: 'skills',
          message: 'Maximum 20 skills allowed',
          severity: 'error',
          code: 'MAX_ITEMS_EXCEEDED'
        });
      }

      // Validate each skill
      data.skills.forEach((skill, index) => {
        const skillErrors = this.validateSkillItem(skill, index);
        errors.push(...skillErrors.errors);
        warnings.push(...skillErrors.warnings);
      });
    }

    // CTA validation
    if (!data.ctaText || typeof data.ctaText !== 'string' || data.ctaText.trim() === '') {
      errors.push({
        field: 'ctaText',
        section: 'skills',
        message: 'CTA text is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data.ctaUrl || typeof data.ctaUrl !== 'string' || data.ctaUrl.trim() === '') {
      errors.push({
        field: 'ctaUrl',
        section: 'skills',
        message: 'CTA URL is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidUrl(data.ctaUrl)) {
      errors.push({
        field: 'ctaUrl',
        section: 'skills',
        message: 'CTA URL must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    // Video validation
    const videoResult = this.validateVideoData(data.video);
    errors.push(...videoResult.errors);
    warnings.push(...videoResult.warnings);

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate skill item
   */
  private validateSkillItem(skill: SkillItem, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!skill.id || typeof skill.id !== 'string') {
      errors.push({
        field: `skills[${index}].id`,
        section: 'skills',
        message: 'Skill ID is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!skill.name || typeof skill.name !== 'string' || skill.name.trim() === '') {
      errors.push({
        field: `skills[${index}].name`,
        section: 'skills',
        message: 'Skill name is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (skill.name.length > 50) {
      errors.push({
        field: `skills[${index}].name`,
        section: 'skills',
        message: 'Skill name must be less than 50 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (typeof skill.order !== 'number' || skill.order < 0) {
      errors.push({
        field: `skills[${index}].order`,
        section: 'skills',
        message: 'Skill order must be a non-negative number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate video data
   */
  private validateVideoData(video: VideoData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!video.url || typeof video.url !== 'string' || video.url.trim() === '') {
      errors.push({
        field: 'video.url',
        section: 'skills',
        message: 'Video URL is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (!this.isValidUrl(video.url)) {
      errors.push({
        field: 'video.url',
        section: 'skills',
        message: 'Video URL must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    if (!video.caption || typeof video.caption !== 'string' || video.caption.trim() === '') {
      warnings.push({
        field: 'video.caption',
        section: 'skills',
        message: 'Video caption is recommended for accessibility',
        severity: 'warning',
        code: 'ACCESSIBILITY_WARNING'
      });
    } else if (video.caption.length > 200) {
      errors.push({
        field: 'video.caption',
        section: 'skills',
        message: 'Video caption must be less than 200 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (typeof video.autoplay !== 'boolean') {
      errors.push({
        field: 'video.autoplay',
        section: 'skills',
        message: 'Video autoplay must be a boolean',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    }

    if (typeof video.loop !== 'boolean') {
      errors.push({
        field: 'video.loop',
        section: 'skills',
        message: 'Video loop must be a boolean',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    }

    if (typeof video.muted !== 'boolean') {
      errors.push({
        field: 'video.muted',
        section: 'skills',
        message: 'Video muted must be a boolean',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate approach section
   */
  async validateApproach(data: ApproachData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Description validation
    if (data.description && typeof data.description !== 'string') {
      errors.push({
        field: 'description',
        section: 'approach',
        message: 'Description must be a string',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (data.description && data.description.length > 500) {
      errors.push({
        field: 'description',
        section: 'approach',
        message: 'Description must be less than 500 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Steps validation
    if (!data.steps || !Array.isArray(data.steps)) {
      errors.push({
        field: 'steps',
        section: 'approach',
        message: 'Steps must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else {
      if (data.steps.length < 3) {
        errors.push({
          field: 'steps',
          section: 'approach',
          message: 'Minimum 3 steps required',
          severity: 'error',
          code: 'MIN_ITEMS_REQUIRED'
        });
      } else if (data.steps.length > 6) {
        errors.push({
          field: 'steps',
          section: 'approach',
          message: 'Maximum 6 steps allowed',
          severity: 'error',
          code: 'MAX_ITEMS_EXCEEDED'
        });
      }

      // Validate each step
      const usedNumbers = new Set<number>();
      data.steps.forEach((step, index) => {
        const stepErrors = this.validateApproachStep(step, index);
        errors.push(...stepErrors.errors);
        warnings.push(...stepErrors.warnings);

        // Check for duplicate numbers
        if (step.number && usedNumbers.has(step.number)) {
          errors.push({
            field: `steps[${index}].number`,
            section: 'approach',
            message: 'Duplicate step number detected',
            severity: 'error',
            code: 'DUPLICATE_VALUE'
          });
        } else if (step.number) {
          usedNumbers.add(step.number);
        }
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate approach step
   */
  private validateApproachStep(step: ApproachStep, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!step.id || typeof step.id !== 'string') {
      errors.push({
        field: `steps[${index}].id`,
        section: 'approach',
        message: 'Step ID is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    if (typeof step.number !== 'number' || step.number < 1) {
      errors.push({
        field: `steps[${index}].number`,
        section: 'approach',
        message: 'Step number must be a positive number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    if (!step.title || typeof step.title !== 'string' || step.title.trim() === '') {
      errors.push({
        field: `steps[${index}].title`,
        section: 'approach',
        message: 'Step title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (step.title.length > 100) {
      errors.push({
        field: `steps[${index}].title`,
        section: 'approach',
        message: 'Step title must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!step.description || typeof step.description !== 'string' || step.description.trim() === '') {
      errors.push({
        field: `steps[${index}].description`,
        section: 'approach',
        message: 'Step description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (step.description.length > 300) {
      errors.push({
        field: `steps[${index}].description`,
        section: 'approach',
        message: 'Step description must be less than 300 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (step.icon && typeof step.icon !== 'string') {
      errors.push({
        field: `steps[${index}].icon`,
        section: 'approach',
        message: 'Step icon must be a string URL',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (step.icon && !this.isValidUrl(step.icon)) {
      errors.push({
        field: `steps[${index}].icon`,
        section: 'approach',
        message: 'Step icon must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    if (typeof step.order !== 'number' || step.order < 0) {
      errors.push({
        field: `steps[${index}].order`,
        section: 'approach',
        message: 'Step order must be a non-negative number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate testimonials section
   */
  async validateTestimonials(data: TestimonialsData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!data.testimonials || !Array.isArray(data.testimonials)) {
      errors.push({
        field: 'testimonials',
        section: 'testimonials',
        message: 'Testimonials must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else {
      if (data.testimonials.length > 10) {
        errors.push({
          field: 'testimonials',
          section: 'testimonials',
          message: 'Maximum 10 testimonials allowed',
          severity: 'error',
          code: 'MAX_ITEMS_EXCEEDED'
        });
      }

      if (data.testimonials.length === 0) {
        warnings.push({
          field: 'testimonials',
          section: 'testimonials',
          message: 'No testimonials found, consider adding client testimonials',
          severity: 'warning',
          code: 'EMPTY_COLLECTION'
        });
      }

      // Validate each testimonial
      data.testimonials.forEach((testimonial, index) => {
        const testimonialErrors = this.validateTestimonial(testimonial, index);
        errors.push(...testimonialErrors.errors);
        warnings.push(...testimonialErrors.warnings);
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate individual testimonial
   */
  private validateTestimonial(testimonial: Testimonial, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!testimonial.id || typeof testimonial.id !== 'string') {
      errors.push({
        field: `testimonials[${index}].id`,
        section: 'testimonials',
        message: 'Testimonial ID is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!testimonial.text || typeof testimonial.text !== 'string' || testimonial.text.trim() === '') {
      errors.push({
        field: `testimonials[${index}].text`,
        section: 'testimonials',
        message: 'Testimonial text is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (testimonial.text.length > 1000) {
      errors.push({
        field: `testimonials[${index}].text`,
        section: 'testimonials',
        message: 'Testimonial text must be less than 1000 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    } else if (testimonial.text.length < 20) {
      warnings.push({
        field: `testimonials[${index}].text`,
        section: 'testimonials',
        message: 'Testimonial text is quite short, consider adding more detail',
        severity: 'warning',
        code: 'MIN_LENGTH_WARNING'
      });
    }

    // Validate author
    const authorErrors = this.validateTestimonialAuthor(testimonial.author, index);
    errors.push(...authorErrors.errors);
    warnings.push(...authorErrors.warnings);

    // Validate project
    const projectErrors = this.validateTestimonialProject(testimonial.project, index);
    errors.push(...projectErrors.errors);
    warnings.push(...projectErrors.warnings);

    if (typeof testimonial.order !== 'number' || testimonial.order < 0) {
      errors.push({
        field: `testimonials[${index}].order`,
        section: 'testimonials',
        message: 'Testimonial order must be a non-negative number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate testimonial author
   */
  private validateTestimonialAuthor(author: TestimonialAuthor, testimonialIndex: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!author.name || typeof author.name !== 'string' || author.name.trim() === '') {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.name`,
        section: 'testimonials',
        message: 'Author name is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (author.name.length > 100) {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.name`,
        section: 'testimonials',
        message: 'Author name must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!author.title || typeof author.title !== 'string' || author.title.trim() === '') {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.title`,
        section: 'testimonials',
        message: 'Author title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (author.title.length > 150) {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.title`,
        section: 'testimonials',
        message: 'Author title must be less than 150 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!author.company || typeof author.company !== 'string' || author.company.trim() === '') {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.company`,
        section: 'testimonials',
        message: 'Author company is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (author.company.length > 100) {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.company`,
        section: 'testimonials',
        message: 'Author company must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!author.avatar || typeof author.avatar !== 'string' || author.avatar.trim() === '') {
      warnings.push({
        field: `testimonials[${testimonialIndex}].author.avatar`,
        section: 'testimonials',
        message: 'Author avatar is recommended for better visual presentation',
        severity: 'warning',
        code: 'MISSING_MEDIA'
      });
    } else if (!this.isValidUrl(author.avatar)) {
      errors.push({
        field: `testimonials[${testimonialIndex}].author.avatar`,
        section: 'testimonials',
        message: 'Author avatar must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate testimonial project
   */
  private validateTestimonialProject(project: TestimonialProject, testimonialIndex: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!project.name || typeof project.name !== 'string' || project.name.trim() === '') {
      errors.push({
        field: `testimonials[${testimonialIndex}].project.name`,
        section: 'testimonials',
        message: 'Project name is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (project.name.length > 100) {
      errors.push({
        field: `testimonials[${testimonialIndex}].project.name`,
        section: 'testimonials',
        message: 'Project name must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!project.image || typeof project.image !== 'string' || project.image.trim() === '') {
      warnings.push({
        field: `testimonials[${testimonialIndex}].project.image`,
        section: 'testimonials',
        message: 'Project image is recommended for better visual presentation',
        severity: 'warning',
        code: 'MISSING_MEDIA'
      });
    } else if (!this.isValidUrl(project.image)) {
      errors.push({
        field: `testimonials[${testimonialIndex}].project.image`,
        section: 'testimonials',
        message: 'Project image must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    if (project.url && typeof project.url !== 'string') {
      errors.push({
        field: `testimonials[${testimonialIndex}].project.url`,
        section: 'testimonials',
        message: 'Project URL must be a string',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (project.url && !this.isValidUrl(project.url)) {
      errors.push({
        field: `testimonials[${testimonialIndex}].project.url`,
        section: 'testimonials',
        message: 'Project URL must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate clients section
   */
  async validateClients(data: ClientsData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!data.clients || !Array.isArray(data.clients)) {
      errors.push({
        field: 'clients',
        section: 'clients',
        message: 'Clients must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else {
      if (data.clients.length === 0) {
        warnings.push({
          field: 'clients',
          section: 'clients',
          message: 'No clients found, consider adding client information',
          severity: 'warning',
          code: 'EMPTY_COLLECTION'
        });
      }

      // Validate each client
      data.clients.forEach((client, index) => {
        const clientErrors = this.validateClientItem(client, index);
        errors.push(...clientErrors.errors);
        warnings.push(...clientErrors.warnings);
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate individual client item
   */
  private validateClientItem(client: ClientItem, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!client.id || typeof client.id !== 'string') {
      errors.push({
        field: `clients[${index}].id`,
        section: 'clients',
        message: 'Client ID is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!client.name || typeof client.name !== 'string' || client.name.trim() === '') {
      errors.push({
        field: `clients[${index}].name`,
        section: 'clients',
        message: 'Client name is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (client.name.length > 100) {
      errors.push({
        field: `clients[${index}].name`,
        section: 'clients',
        message: 'Client name must be less than 100 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!client.logo || typeof client.logo !== 'string' || client.logo.trim() === '') {
      warnings.push({
        field: `clients[${index}].logo`,
        section: 'clients',
        message: 'Client logo is recommended for better visual presentation',
        severity: 'warning',
        code: 'MISSING_MEDIA'
      });
    } else if (!this.isValidUrl(client.logo)) {
      errors.push({
        field: `clients[${index}].logo`,
        section: 'clients',
        message: 'Client logo must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    if (!client.description || typeof client.description !== 'string' || client.description.trim() === '') {
      errors.push({
        field: `clients[${index}].description`,
        section: 'clients',
        message: 'Client description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (client.description.length > 300) {
      errors.push({
        field: `clients[${index}].description`,
        section: 'clients',
        message: 'Client description must be less than 300 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (!client.industry || typeof client.industry !== 'string' || client.industry.trim() === '') {
      errors.push({
        field: `clients[${index}].industry`,
        section: 'clients',
        message: 'Client industry is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (client.industry.length > 50) {
      errors.push({
        field: `clients[${index}].industry`,
        section: 'clients',
        message: 'Client industry must be less than 50 characters',
        severity: 'error',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    if (typeof client.order !== 'number' || client.order < 0) {
      errors.push({
        field: `clients[${index}].order`,
        section: 'clients',
        message: 'Client order must be a non-negative number',
        severity: 'error',
        code: 'INVALID_VALUE'
      });
    }

    if (typeof client.isActive !== 'boolean') {
      errors.push({
        field: `clients[${index}].isActive`,
        section: 'clients',
        message: 'Client isActive must be a boolean',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate SEO data
   */
  private async validateSEO(seo: ServicesData['seo']): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!seo.title || typeof seo.title !== 'string' || seo.title.trim() === '') {
      errors.push({
        field: 'seo.title',
        section: 'hero',
        message: 'SEO title is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (seo.title.length > 60) {
      warnings.push({
        field: 'seo.title',
        section: 'hero',
        message: 'SEO title is longer than recommended 60 characters',
        severity: 'warning',
        code: 'SEO_LENGTH_WARNING'
      });
    } else if (seo.title.length < 30) {
      warnings.push({
        field: 'seo.title',
        section: 'hero',
        message: 'SEO title is shorter than recommended 30 characters',
        severity: 'warning',
        code: 'SEO_LENGTH_WARNING'
      });
    }

    if (!seo.description || typeof seo.description !== 'string' || seo.description.trim() === '') {
      errors.push({
        field: 'seo.description',
        section: 'hero',
        message: 'SEO description is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    } else if (seo.description.length > 160) {
      warnings.push({
        field: 'seo.description',
        section: 'hero',
        message: 'SEO description is longer than recommended 160 characters',
        severity: 'warning',
        code: 'SEO_LENGTH_WARNING'
      });
    } else if (seo.description.length < 120) {
      warnings.push({
        field: 'seo.description',
        section: 'hero',
        message: 'SEO description is shorter than recommended 120 characters',
        severity: 'warning',
        code: 'SEO_LENGTH_WARNING'
      });
    }

    if (!seo.keywords || !Array.isArray(seo.keywords)) {
      errors.push({
        field: 'seo.keywords',
        section: 'hero',
        message: 'SEO keywords must be an array',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (seo.keywords.length === 0) {
      warnings.push({
        field: 'seo.keywords',
        section: 'hero',
        message: 'SEO keywords are recommended for better search visibility',
        severity: 'warning',
        code: 'EMPTY_COLLECTION'
      });
    } else if (seo.keywords.length > 10) {
      warnings.push({
        field: 'seo.keywords',
        section: 'hero',
        message: 'Too many SEO keywords, consider focusing on 5-10 main keywords',
        severity: 'warning',
        code: 'SEO_OPTIMIZATION_WARNING'
      });
    }

    if (seo.ogImage && typeof seo.ogImage !== 'string') {
      errors.push({
        field: 'seo.ogImage',
        section: 'hero',
        message: 'SEO OG image must be a string URL',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
    } else if (seo.ogImage && !this.isValidUrl(seo.ogImage)) {
      errors.push({
        field: 'seo.ogImage',
        section: 'hero',
        message: 'SEO OG image must be a valid URL',
        severity: 'error',
        code: 'INVALID_FORMAT'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate cross-section consistency
   */
  private async validateCrossSectionConsistency(data: ServicesData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check if testimonials reference valid projects
    if (data.testimonials.testimonials.length > 0 && data.clients.clients.length > 0) {
      data.testimonials.testimonials.forEach((testimonial, index) => {
        const matchingClient = data.clients.clients.find(
          client => client.name.toLowerCase() === testimonial.author.company.toLowerCase()
        );
        
        if (!matchingClient) {
          warnings.push({
            field: `testimonials[${index}].author.company`,
            section: 'testimonials',
            message: `Testimonial company "${testimonial.author.company}" not found in clients list`,
            severity: 'warning',
            code: 'CROSS_REFERENCE_WARNING'
          });
        }
      });
    }

    // Check for consistent color usage across sections
    const heroColors = this.extractColorsFromText(data.hero.description);
    const serviceColors = data.services.services.map(s => s.color);
    
    // Warn if colors are inconsistent
    if (heroColors.length > 0 && serviceColors.length > 0) {
      const hasConsistentColors = heroColors.some(color => 
        serviceColors.some(serviceColor => 
          this.areColorsSimilar(color, serviceColor)
        )
      );
      
      if (!hasConsistentColors) {
        warnings.push({
          field: 'general',
          section: 'hero',
          message: 'Consider using consistent colors across hero and services sections',
          severity: 'warning',
          code: 'DESIGN_CONSISTENCY_WARNING'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Initialize validation configurations
   */
  private initializeValidationConfigs(): void {
    // Hero section validation config
    this.validationConfigs.set('hero', {
      section: 'hero',
      rules: [
        {
          field: 'title',
          validator: (value: string) => {
            if (!value || value.trim() === '') {
              return {
                field: 'title',
                section: 'hero',
                message: 'Title is required',
                severity: 'error',
                code: 'REQUIRED_FIELD'
              };
            }
            return null;
          },
          required: true
        }
      ]
    });

    // Add other section configs as needed...
  }

  /**
   * Real-time validation for a specific field
   */
  async validateField(section: ServicesSection, field: string, value: any, context?: any): Promise<ValidationError | null> {
    try {
      switch (section) {
        case 'hero':
          return this.validateHeroField(field, value, context);
        case 'services':
          return this.validateServicesField(field, value, context);
        case 'skills':
          return this.validateSkillsField(field, value, context);
        case 'approach':
          return this.validateApproachField(field, value, context);
        case 'testimonials':
          return this.validateTestimonialsField(field, value, context);
        case 'clients':
          return this.validateClientsField(field, value, context);
        default:
          return null;
      }
    } catch (error) {
      return {
        field,
        section,
        message: `Field validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Validate hero field in real-time
   */
  private validateHeroField(field: string, value: any, context?: any): ValidationError | null {
    switch (field) {
      case 'title':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return {
            field: 'title',
            section: 'hero',
            message: 'Title is required',
            severity: 'error',
            code: 'REQUIRED_FIELD'
          };
        }
        if (value.length > 200) {
          return {
            field: 'title',
            section: 'hero',
            message: 'Title must be less than 200 characters',
            severity: 'error',
            code: 'MAX_LENGTH_EXCEEDED'
          };
        }
        break;
      case 'description':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return {
            field: 'description',
            section: 'hero',
            message: 'Description is required',
            severity: 'error',
            code: 'REQUIRED_FIELD'
          };
        }
        if (value.length > 1000) {
          return {
            field: 'description',
            section: 'hero',
            message: 'Description must be less than 1000 characters',
            severity: 'error',
            code: 'MAX_LENGTH_EXCEEDED'
          };
        }
        break;
    }
    return null;
  }

  /**
   * Validate services field in real-time
   */
  private validateServicesField(field: string, value: any, context?: any): ValidationError | null {
    // Implementation for services field validation
    return null;
  }

  /**
   * Validate skills field in real-time
   */
  private validateSkillsField(field: string, value: any, context?: any): ValidationError | null {
    // Implementation for skills field validation
    return null;
  }

  /**
   * Validate approach field in real-time
   */
  private validateApproachField(field: string, value: any, context?: any): ValidationError | null {
    // Implementation for approach field validation
    return null;
  }

  /**
   * Validate testimonials field in real-time
   */
  private validateTestimonialsField(field: string, value: any, context?: any): ValidationError | null {
    // Implementation for testimonials field validation
    return null;
  }

  /**
   * Validate clients field in real-time
   */
  private validateClientsField(field: string, value: any, context?: any): ValidationError | null {
    // Implementation for clients field validation
    return null;
  }

  /**
   * Helper method to validate hex color
   */
  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Helper method to validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Check for relative URLs
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
  }

  /**
   * Extract colors from text (basic implementation)
   */
  private extractColorsFromText(text: string): string[] {
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const matches = text.match(colorRegex);
    return matches || [];
  }

  /**
   * Check if two colors are similar (basic implementation)
   */
  private areColorsSimilar(color1: string, color2: string): boolean {
    return color1.toLowerCase() === color2.toLowerCase();
  }
}

// Export singleton instance
export const servicesValidationService = new ServicesValidationService();