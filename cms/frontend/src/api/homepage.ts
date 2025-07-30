import { HeroSection, HomepageData, HomepageSection, BrandsSection, BrandLogo, ServicesSection, ServiceItem, WorkSection, OfferSection, OfferPoint, TestimonialsSection, TestimonialItem, FooterSection } from '../../../shared/types/homepage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class HomepageAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/homepage${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  // Get all homepage content
  async getAllContent(): Promise<HomepageData> {
    return this.request<HomepageData>('');
  }

  // Get specific section content
  async getSectionContent<T>(section: HomepageSection): Promise<T> {
    return this.request<T>(`/${section}`);
  }

  // Update specific section content
  async updateSectionContent<T>(section: HomepageSection, data: T): Promise<T> {
    return this.request<T>(`/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Hero section specific methods
  async getHeroContent(): Promise<HeroSection> {
    return this.getSectionContent<HeroSection>('hero');
  }

  async updateHeroContent(data: HeroSection): Promise<HeroSection> {
    return this.updateSectionContent<HeroSection>('hero', data);
  }

  // Brands section specific methods
  async getBrandsContent(): Promise<BrandsSection> {
    return this.getSectionContent<BrandsSection>('brands');
  }

  async updateBrandsContent(data: BrandsSection): Promise<BrandsSection> {
    return this.updateSectionContent<BrandsSection>('brands', data);
  }

  async addBrandLogo(name: string, logoUrl: string): Promise<{ logo: BrandLogo; brands: BrandsSection }> {
    return this.request<{ logo: BrandLogo; brands: BrandsSection }>('/brands/logo', {
      method: 'POST',
      body: JSON.stringify({ name, logoUrl }),
    });
  }

  async removeBrandLogo(logoId: number): Promise<{ removedLogo: BrandLogo; brands: BrandsSection }> {
    return this.request<{ removedLogo: BrandLogo; brands: BrandsSection }>(`/brands/logo/${logoId}`, {
      method: 'DELETE',
    });
  }

  async reorderBrandLogos(logoIds: number[]): Promise<{ brands: BrandsSection; newOrder: number[] }> {
    return this.request<{ brands: BrandsSection; newOrder: number[] }>('/brands/reorder', {
      method: 'PUT',
      body: JSON.stringify({ logoIds }),
    });
  }

  // Services section specific methods
  async getServicesContent(): Promise<ServicesSection> {
    return this.getSectionContent<ServicesSection>('services');
  }

  async updateServicesContent(data: ServicesSection): Promise<ServicesSection> {
    return this.updateSectionContent<ServicesSection>('services', data);
  }

  // Work section specific methods
  async getWorkContent(): Promise<WorkSection> {
    return this.getSectionContent<WorkSection>('work');
  }

  async updateWorkContent(data: WorkSection): Promise<WorkSection> {
    return this.updateSectionContent<WorkSection>('work', data);
  }

  // Offer section specific methods
  async getOfferContent(): Promise<OfferSection> {
    return this.getSectionContent<OfferSection>('offer');
  }

  async updateOfferContent(data: OfferSection): Promise<OfferSection> {
    return this.updateSectionContent<OfferSection>('offer', data);
  }

  // Testimonials section specific methods
  async getTestimonialsContent(): Promise<TestimonialsSection> {
    return this.getSectionContent<TestimonialsSection>('testimonials');
  }

  async updateTestimonialsContent(data: TestimonialsSection): Promise<TestimonialsSection> {
    return this.updateSectionContent<TestimonialsSection>('testimonials', data);
  }

  async addTestimonial(testimonial: Omit<TestimonialItem, 'id' | 'order'>): Promise<{ testimonial: TestimonialItem; testimonials: TestimonialsSection }> {
    return this.request<{ testimonial: TestimonialItem; testimonials: TestimonialsSection }>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonial),
    });
  }

  async removeTestimonial(testimonialId: number): Promise<{ removedTestimonial: TestimonialItem; testimonials: TestimonialsSection }> {
    return this.request<{ removedTestimonial: TestimonialItem; testimonials: TestimonialsSection }>(`/testimonials/${testimonialId}`, {
      method: 'DELETE',
    });
  }

  async reorderTestimonials(testimonialIds: number[]): Promise<{ testimonials: TestimonialsSection; newOrder: number[] }> {
    return this.request<{ testimonials: TestimonialsSection; newOrder: number[] }>('/testimonials/reorder', {
      method: 'PUT',
      body: JSON.stringify({ testimonialIds }),
    });
  }

  // Footer section specific methods
  async getFooterContent(): Promise<FooterSection> {
    return this.getSectionContent<FooterSection>('footer');
  }

  async updateFooterContent(data: FooterSection): Promise<FooterSection> {
    return this.updateSectionContent<FooterSection>('footer', data);
  }

  // Media upload
  async uploadMedia(file: File): Promise<{
    id: number;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/homepage/media`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  // Publish all changes
  async publishAllChanges(): Promise<{
    success: boolean;
    publishedSections: string[];
    timestamp: string;
  }> {
    return this.request<{
      success: boolean;
      publishedSections: string[];
      timestamp: string;
    }>('/publish', {
      method: 'POST',
    });
  }

  // Save all changes (without publishing)
  async saveAllChanges(): Promise<{
    success: boolean;
    savedSections: string[];
    timestamp: string;
  }> {
    return this.request<{
      success: boolean;
      savedSections: string[];
      timestamp: string;
    }>('/save-all', {
      method: 'POST',
    });
  }

  // Version management methods
  async getVersions(limit?: number): Promise<Array<{
    id: string;
    versionName: string | null;
    contentSnapshot: string;
    isActive: boolean;
    createdAt: string;
  }>> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Array<{
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
    }>>(`/versions${query}`);
  }

  async createVersion(versionName?: string): Promise<{
    id: string;
    versionName: string | null;
    contentSnapshot: string;
    isActive: boolean;
    createdAt: string;
  }> {
    return this.request<{
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
    }>('/versions', {
      method: 'POST',
      body: JSON.stringify({ versionName }),
    });
  }

  async getVersion(versionId: string): Promise<{
    id: string;
    versionName: string | null;
    contentSnapshot: string;
    isActive: boolean;
    createdAt: string;
    parsedContent: HomepageData | null;
  }> {
    return this.request<{
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
      parsedContent: HomepageData | null;
    }>(`/versions/${versionId}`);
  }

  async restoreVersion(versionId: string): Promise<{
    restoredVersion: {
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
    };
    currentContent: HomepageData;
  }> {
    return this.request<{
      restoredVersion: {
        id: string;
        versionName: string | null;
        contentSnapshot: string;
        isActive: boolean;
        createdAt: string;
      };
      currentContent: HomepageData;
    }>(`/versions/${versionId}/restore`, {
      method: 'PUT',
    });
  }

  async deleteVersion(versionId: string): Promise<{
    deletedVersion: {
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
    };
  }> {
    return this.request<{
      deletedVersion: {
        id: string;
        versionName: string | null;
        contentSnapshot: string;
        isActive: boolean;
        createdAt: string;
      };
    }>(`/versions/${versionId}`, {
      method: 'DELETE',
    });
  }

  async cleanupOldVersions(keepCount?: number): Promise<void> {
    return this.request<void>('/versions/cleanup', {
      method: 'POST',
      body: JSON.stringify({ keepCount }),
    });
  }

  // Content validation and backup methods
  async validateContent(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    return this.request<{
      isValid: boolean;
      errors: string[];
    }>('/validate', {
      method: 'POST',
    });
  }

  async createEmergencyBackup(): Promise<{
    id: string;
    versionName: string | null;
    contentSnapshot: string;
    isActive: boolean;
    createdAt: string;
  }> {
    return this.request<{
      id: string;
      versionName: string | null;
      contentSnapshot: string;
      isActive: boolean;
      createdAt: string;
    }>('/emergency-backup', {
      method: 'POST',
    });
  }

  async recoverFromError(): Promise<HomepageData> {
    return this.request<HomepageData>('/recover', {
      method: 'POST',
    });
  }
}

export const homepageAPI = new HomepageAPI();