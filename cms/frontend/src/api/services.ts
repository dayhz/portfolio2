import { 
  ServicesData, 
  ServicesSection, 
  HeroSectionData,
  ServicesGridData,
  SkillsVideoData,
  ApproachData,
  TestimonialsData,
  ClientsData,
  ServicesApiResponse,
  ServicesListResponse,
  ServicesSectionResponse,
  PublishResponse,
  ServicesVersion
} from '../../../shared/types/services';

const API_BASE_URL = import.meta.env?.VITE_API_URL || '';

class ServicesAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/services${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all services content
  async getAllContent(): Promise<ServicesListResponse> {
    return this.request<ServicesListResponse>('');
  }

  // Get specific section content
  async getSection<T = any>(section: ServicesSection): Promise<ServicesSectionResponse<T>> {
    return this.request<ServicesSectionResponse<T>>(`/${section}`);
  }

  // Update specific section content
  async updateSection<T = any>(section: ServicesSection, data: T): Promise<ServicesSectionResponse<T>> {
    return this.request<ServicesSectionResponse<T>>(`/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Section-specific methods
  async getHero(): Promise<ServicesSectionResponse<HeroSectionData>> {
    return this.getSection<HeroSectionData>('hero');
  }

  async updateHero(data: HeroSectionData): Promise<ServicesSectionResponse<HeroSectionData>> {
    return this.updateSection('hero', data);
  }

  async getServices(): Promise<ServicesSectionResponse<ServicesGridData>> {
    return this.getSection<ServicesGridData>('services');
  }

  async updateServices(data: ServicesGridData): Promise<ServicesSectionResponse<ServicesGridData>> {
    return this.updateSection('services', data);
  }

  async getSkillsVideo(): Promise<ServicesSectionResponse<SkillsVideoData>> {
    return this.getSection<SkillsVideoData>('skills');
  }

  async updateSkillsVideo(data: SkillsVideoData): Promise<ServicesSectionResponse<SkillsVideoData>> {
    return this.updateSection('skills', data);
  }

  async getApproach(): Promise<ServicesSectionResponse<ApproachData>> {
    return this.getSection<ApproachData>('approach');
  }

  async updateApproach(data: ApproachData): Promise<ServicesSectionResponse<ApproachData>> {
    return this.updateSection('approach', data);
  }

  async getTestimonials(): Promise<ServicesSectionResponse<TestimonialsData>> {
    return this.getSection<TestimonialsData>('testimonials');
  }

  async updateTestimonials(data: TestimonialsData): Promise<ServicesSectionResponse<TestimonialsData>> {
    return this.updateSection('testimonials', data);
  }

  async getClients(): Promise<ServicesSectionResponse<ClientsData>> {
    return this.getSection<ClientsData>('clients');
  }

  async updateClients(data: ClientsData): Promise<ServicesSectionResponse<ClientsData>> {
    return this.updateSection('clients', data);
  }

  // Publishing
  async publish(options: { createBackup?: boolean; versionName?: string } = {}): Promise<PublishResponse> {
    return this.request<PublishResponse>('/publish', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // Version management
  async getVersions(limit: number = 10): Promise<ServicesApiResponse<ServicesVersion[]>> {
    return this.request<ServicesApiResponse<ServicesVersion[]>>(`/versions/list?limit=${limit}`);
  }

  async createVersion(versionName?: string): Promise<ServicesApiResponse<ServicesVersion>> {
    return this.request<ServicesApiResponse<ServicesVersion>>('/versions', {
      method: 'POST',
      body: JSON.stringify({ versionName }),
    });
  }

  async restoreVersion(versionId: string): Promise<ServicesApiResponse<void>> {
    return this.request<ServicesApiResponse<void>>(`/versions/${versionId}/restore`, {
      method: 'POST',
    });
  }

  async deleteVersion(versionId: string): Promise<ServicesApiResponse<void>> {
    return this.request<ServicesApiResponse<void>>(`/versions/${versionId}`, {
      method: 'DELETE',
    });
  }

  // Media upload
  async uploadMedia(file: File): Promise<ServicesApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<ServicesApiResponse<any>>('/media', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it with boundary
    });
  }

  // Utility methods
  async validateContent(): Promise<ServicesApiResponse<{ isValid: boolean; errors: any[] }>> {
    // This would be implemented if we add a validation endpoint
    const content = await this.getAllContent();
    return {
      success: true,
      data: { isValid: true, errors: [] },
      timestamp: new Date().toISOString()
    };
  }

  // Export content for backup
  async exportContent(): Promise<ServicesData> {
    const response = await this.getAllContent();
    return response.data;
  }

  // Import content from backup
  async importContent(data: ServicesData): Promise<ServicesApiResponse<void>> {
    // This would require implementing an import endpoint
    throw new Error('Import functionality not yet implemented');
  }
}

// Create and export a singleton instance
export const servicesAPI = new ServicesAPI();

// Export the class for testing purposes
export { ServicesAPI };

// Export types for convenience
export type {
  ServicesData,
  ServicesSection,
  HeroSectionData,
  ServicesGridData,
  SkillsVideoData,
  ApproachData,
  TestimonialsData,
  ClientsData,
  ServicesApiResponse,
  ServicesListResponse,
  ServicesSectionResponse,
  PublishResponse,
  ServicesVersion
};