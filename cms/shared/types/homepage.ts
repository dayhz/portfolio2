// Homepage CMS Type Definitions

export interface HomepageContent {
  id: string;
  section: HomepageSection;
  fieldName: string;
  fieldValue: string | null;
  fieldType: FieldType;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomepageVersion {
  id: string;
  versionName: string | null;
  contentSnapshot: string; // JSON string
  isActive: boolean;
  createdAt: Date;
}

export type HomepageSection = 
  | 'hero' 
  | 'brands' 
  | 'services' 
  | 'offer' 
  | 'testimonials' 
  | 'footer';

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'image' 
  | 'json';

// Section-specific data structures
export interface HeroSection {
  title: string;
  description: string;
  videoUrl: string;
}

export interface BrandLogo {
  id: number;
  name: string;
  logoUrl: string;
  order: number;
}

export interface BrandsSection {
  title: string;
  logos: BrandLogo[];
}

export interface ServiceItem {
  id: number;
  number: string;
  title: string;
  description: string;
  link: string;
  colorClass: string;
}

export interface ServicesSection {
  title: string;
  description: string;
  services: ServiceItem[];
}

export interface OfferPoint {
  id: number;
  text: string;
  order: number;
}

export interface OfferSection {
  title: string;
  points: OfferPoint[];
}

export interface TestimonialItem {
  id: number;
  text: string;
  clientName: string;
  clientTitle: string;
  clientPhoto: string;
  projectLink: string;
  projectImage: string;
  order: number;
}

export interface TestimonialsSection {
  testimonials: TestimonialItem[];
}

export interface FooterLink {
  text: string;
  url: string;
}

export interface FooterLinks {
  site: FooterLink[];
  professional: FooterLink[];
  social: FooterLink[];
}

export interface FooterSection {
  title: string;
  email: string;
  copyright: string;
  links: FooterLinks;
}

// Complete homepage data structure
export interface HomepageData {
  hero: HeroSection;
  brands: BrandsSection;
  services: ServicesSection;
  offer: OfferSection;
  testimonials: TestimonialsSection;
  footer: FooterSection;
}

// API request/response types
export interface UpdateSectionRequest<T = any> {
  section: HomepageSection;
  data: T;
}

export interface CreateVersionRequest {
  versionName?: string;
  contentSnapshot: HomepageData;
}

export interface RestoreVersionRequest {
  versionId: string;
}

// Database operation types
export interface CreateHomepageContentInput {
  section: HomepageSection;
  fieldName: string;
  fieldValue?: string;
  fieldType?: FieldType;
  displayOrder?: number;
}

export interface UpdateHomepageContentInput {
  fieldValue?: string;
  fieldType?: FieldType;
  displayOrder?: number;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Content transformation types
export interface ContentTransformer<T> {
  fromDatabase(content: HomepageContent[]): T;
  toDatabase(section: HomepageSection, data: T): CreateHomepageContentInput[];
}