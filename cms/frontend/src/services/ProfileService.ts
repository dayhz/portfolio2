import axiosInstance from '../utils/axiosConfig';

export interface Profile {
  id: string;
  name: string;
  title: string;
  description: string;
  photo?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  linkedin?: string;
  dribbble?: string;
  behance?: string;
  medium?: string;
}

export interface ProfileUpdateData {
  name: string;
  title: string;
  description: string;
  email: string;
  phone?: string;
  location?: string;
}

class ProfileService {
  /**
   * Récupère les informations du profil
   */
  async getProfile(): Promise<Profile> {
    try {
      const response = await axiosInstance.get<Profile>('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Met à jour les informations du profil
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<Profile> {
    try {
      const response = await axiosInstance.put<Profile>('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Met à jour la photo de profil
   */
  async updateProfilePhoto(file: File): Promise<{ profile: Profile }> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axiosInstance.post<{ profile: Profile }>('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  }

  /**
   * Supprime la photo de profil
   */
  async deleteProfilePhoto(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>('/profile/photo');
      return response.data;
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  }

  /**
   * Met à jour les liens sociaux
   */
  async updateSocialLinks(socialLinks: SocialLinks): Promise<{ message: string; socialLinks: SocialLinks }> {
    try {
      const response = await axiosInstance.put<{ message: string; socialLinks: SocialLinks }>('/profile/social', socialLinks);
      return response.data;
    } catch (error) {
      console.error('Error updating social links:', error);
      throw error;
    }
  }
}

// Créer une instance unique du service de profil
const profileServiceInstance = new ProfileService();

// Exporter l'instance pour une utilisation dans toute l'application
export default profileServiceInstance;