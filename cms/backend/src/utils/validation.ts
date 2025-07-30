// Validation utility functions for homepage sections

export function validateHeroSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Title validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    errors.push('Description is required');
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  // Video URL validation (optional)
  if (data.videoUrl && data.videoUrl.trim() !== '') {
    if (!isValidUrl(data.videoUrl)) {
      errors.push('Invalid video URL format');
    }
  }

  return errors;
}

export function validateBrandsSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Title validation
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  }

  // Logos validation
  if (data.logos) {
    if (!Array.isArray(data.logos)) {
      errors.push('Logos must be an array');
    } else {
      data.logos.forEach((logo: any, index: number) => {
        if (!logo.name || typeof logo.name !== 'string' || logo.name.trim() === '') {
          errors.push(`Logo ${index + 1}: Logo name is required`);
        }

        if (!logo.logoUrl || typeof logo.logoUrl !== 'string' || logo.logoUrl.trim() === '') {
          errors.push(`Logo ${index + 1}: Logo URL is required`);
        }

        if (logo.order !== undefined && (typeof logo.order !== 'number' || logo.order < 1)) {
          errors.push(`Logo ${index + 1}: Logo order must be a positive number`);
        }
      });
    }
  }

  return errors;
}

export function validateServicesSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Title validation
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  }

  // Description validation
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  // Services validation
  if (data.services) {
    if (!Array.isArray(data.services)) {
      errors.push('Services must be an array');
    } else {
      if (data.services.length > 5) {
        errors.push('Maximum 5 services allowed');
      }

      data.services.forEach((service: any, index: number) => {
        if (!service.title || typeof service.title !== 'string' || service.title.trim() === '') {
          errors.push(`Service ${index + 1}: Service title is required`);
        }

        if (!service.description || typeof service.description !== 'string' || service.description.trim() === '') {
          errors.push(`Service ${index + 1}: Service description is required`);
        }

        if (service.link && typeof service.link !== 'string') {
          errors.push(`Service ${index + 1}: Service link must be a string`);
        }

        if (service.colorClass && typeof service.colorClass !== 'string') {
          errors.push(`Service ${index + 1}: Color class must be a string`);
        }
      });
    }
  }

  return errors;
}

export function validateOfferSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Title validation
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  }

  // Points validation
  if (data.points) {
    if (!Array.isArray(data.points)) {
      errors.push('Points must be an array');
    } else {
      if (data.points.length > 6) {
        errors.push('Maximum 6 points allowed');
      }

      data.points.forEach((point: any, index: number) => {
        if (!point.text || typeof point.text !== 'string' || point.text.trim() === '') {
          errors.push(`Point ${index + 1}: Point text is required`);
        }

        if (point.order !== undefined && (typeof point.order !== 'number' || point.order < 1)) {
          errors.push(`Point ${index + 1}: Point order must be a positive number`);
        }
      });
    }
  }

  return errors;
}

export function validateTestimonialsSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Testimonials validation
  if (data.testimonials) {
    if (!Array.isArray(data.testimonials)) {
      errors.push('Testimonials must be an array');
    } else {
      if (data.testimonials.length > 10) {
        errors.push('Maximum 10 testimonials allowed');
      }

      data.testimonials.forEach((testimonial: any, index: number) => {
        if (!testimonial.text || typeof testimonial.text !== 'string' || testimonial.text.trim() === '') {
          errors.push(`Testimonial ${index + 1}: Testimonial text is required`);
        } else if (testimonial.text.length < 20) {
          errors.push(`Testimonial ${index + 1}: Testimonial text must be at least 20 characters`);
        }

        if (!testimonial.clientName || typeof testimonial.clientName !== 'string' || testimonial.clientName.trim() === '') {
          errors.push(`Testimonial ${index + 1}: Client name is required`);
        }

        if (testimonial.clientTitle && typeof testimonial.clientTitle !== 'string') {
          errors.push(`Testimonial ${index + 1}: Client title must be a string`);
        }

        if (testimonial.projectLink && !isValidUrl(testimonial.projectLink)) {
          errors.push(`Testimonial ${index + 1}: Invalid project link format`);
        }

        if (testimonial.order !== undefined && (typeof testimonial.order !== 'number' || testimonial.order < 1)) {
          errors.push(`Testimonial ${index + 1}: Order must be a positive number`);
        }
      });
    }
  }

  return errors;
}

export function validateFooterSection(data: any): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Invalid data format');
    return errors;
  }

  // Email validation
  if (data.email) {
    if (typeof data.email !== 'string' || !isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
  }

  // Copyright validation
  if (!data.copyright || typeof data.copyright !== 'string' || data.copyright.trim() === '') {
    errors.push('Copyright text is required');
  }

  // Links validation
  if (data.links && typeof data.links === 'object') {
    const linkCategories = ['site', 'professional', 'social'];
    
    linkCategories.forEach(category => {
      if (data.links[category] && Array.isArray(data.links[category])) {
        data.links[category].forEach((link: any, index: number) => {
          if (!link.text || typeof link.text !== 'string' || link.text.trim() === '') {
            errors.push(`${category} link ${index + 1}: Link text is required`);
          }

          if (!link.url || typeof link.url !== 'string' || !isValidUrl(link.url)) {
            errors.push(`${category} link ${index + 1}: Invalid link URL format`);
          }
        });
      }
    });
  }

  return errors;
}

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check for relative URLs
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}