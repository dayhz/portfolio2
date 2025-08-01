// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  description: string;
  photo?: string;
  email: string;
  phone?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectCategory {
  WEBSITE = 'WEBSITE',
  PRODUCT = 'PRODUCT',
  MOBILE = 'MOBILE',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  thumbnail: string;
  images: string[];
  year: number;
  client: string;
  duration?: string;
  industry?: string;
  scope?: string[];
  challenge?: string;
  approach?: string;
  testimonial?: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  clientPhoto?: string;
  projectImage?: string;
  projectLink?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  features?: string[];
  process?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface About {
  id: string;
  biography: string;
  stats: Record<string, any>;
  awards: Array<{
    name: string;
    description: string;
    link?: string;
    date: string;
  }>;
  socialLinks: Record<string, string>;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteBackup {
  id: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form types
export interface ProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  client: string;
  year: number;
  duration?: string;
  industry?: string;
  scope?: string[];
  challenge?: string;
  approach?: string;
  testimonial?: string;
  images: string[];
}

export interface TestimonialFormData {
  quote: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  projectLink?: string;
}

export interface ProfileFormData {
  name: string;
  title: string;
  description: string;
  email: string;
  phone?: string;
  location?: string;
}

// Export homepage types
export * from './homepage';
export * from './services';