// Services CMS Type Definitions

export interface ServicesContent {
  id: string;
  section: ServicesSection;
  fieldName: string;
  fieldValue: string | null;
  fieldType: FieldType;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicesVersion {
  id: string;
  versionName: string | null;
  contentSnapshot: string; // JSON string
  isActive: boolean;
  createdAt: Date;
}

export type ServicesSection = 
  | 'hero' 
  | 'services' 
  | 'skills' 
  | 'approach' 
  | 'testimonials' 
  | 'clients';

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'image' 
  | 'json' 
  | 'color' 
  | 'boolean' 
  | 'number'
  | 'array'
  | 'object';

// Section-specific data structures
export interface HeroSectionData {
  title: string;
  description: string;
  highlightText?: string; // For "17+ years"
}

export interface ServiceItem {
  id: string;
  number: number;
  title: string;
  description: string;
  color: string; // Hex color code
  colorClass: string; // CSS class for styling
  order: number;
}

export interface ServicesGridData {
  services: ServiceItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  order: number;
}

export interface VideoData {
  url: string;
  caption: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface SkillsVideoData {
  description: string;
  skills: SkillItem[];
  ctaText: string;
  ctaUrl: string;
  video: VideoData;
}

export interface ApproachStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon?: string; // URL to icon image
  order: number;
}

export interface ApproachData {
  description: string;
  steps: ApproachStep[];
}

export interface TestimonialAuthor {
  name: string;
  title: string;
  company: string;
  avatar: string; // Media URL
}

export interface TestimonialProject {
  name: string;
  image: string; // Media URL
  url?: string; // Link to case study
}

export interface Testimonial {
  id: string;
  text: string;
  author: TestimonialAuthor;
  project: TestimonialProject;
  order: number;
}

export interface TestimonialsData {
  testimonials: Testimonial[];
}

export interface ClientItem {
  id: string;
  name: string;
  logo: string; // Media URL (SVG preferred)
  description: string;
  industry: string;
  order: number;
  isActive: boolean;
}

export interface ClientsData {
  clients: ClientItem[];
}

// Complete services data structure
export interface ServicesData {
  id: string;
  version: number;
  lastModified: Date;
  publishedAt?: Date;
  isPublished: boolean;
  
  hero: HeroSectionData;
  services: ServicesGridData;
  skillsVideo: SkillsVideoData;
  approach: ApproachData;
  testimonials: TestimonialsData;
  clients: ClientsData;
  
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
}

// API request/response types
export interface UpdateSectionRequest<T = any> {
  section: ServicesSection;
  data: T;
}

export interface CreateVersionRequest {
  versionName?: string;
  contentSnapshot: ServicesData;
}

export interface RestoreVersionRequest {
  versionId: string;
}

// Database operation types
export interface CreateServicesContentInput {
  section: ServicesSection;
  fieldName: string;
  fieldValue?: string;
  fieldType?: FieldType;
  displayOrder?: number;
}

export interface UpdateServicesContentInput {
  fieldValue?: string;
  fieldType?: FieldType;
  displayOrder?: number;
}

// Validation types
export interface ValidationError {
  field: string;
  section: ServicesSection;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string; // Error code for programmatic handling
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationRule<T = any> {
  field: string;
  validator: (value: T, data?: any) => ValidationError | null;
  required?: boolean;
}

export interface SectionValidationConfig {
  section: ServicesSection;
  rules: ValidationRule[];
  customValidators?: ((data: any) => ValidationError[])[];
}

// Content transformation types
export interface ContentTransformer<T> {
  fromDatabase(content: ServicesContent[]): T;
  toDatabase(section: ServicesSection, data: T): CreateServicesContentInput[];
}

// API Response types
export interface ServicesApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  timestamp: string;
}

export interface ServicesListResponse {
  success: boolean;
  data: ServicesData;
  timestamp: string;
}

export interface ServicesSectionResponse<T = any> {
  success: boolean;
  data: T;
  section: ServicesSection;
  timestamp: string;
}

// Publishing types
export interface PublishRequest {
  createBackup?: boolean;
  versionName?: string;
}

export interface PublishResponse {
  success: boolean;
  message: string;
  publishedAt: string;
  version: number;
  timestamp: string;
}