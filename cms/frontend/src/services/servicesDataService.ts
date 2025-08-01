import { HeroSectionData, ServicesGridData, ServiceItem } from '../../../shared/types/services';
import { toast } from 'sonner';

/**
 * Service d'abstraction pour les données des services
 * Peut fonctionner avec ou sans API selon la configuration
 */
class ServicesDataService {
  private useApi: boolean = false;
  private localData: {
    hero: HeroSectionData;
    servicesGrid: ServicesGridData;
  } = {
    hero: {
      title: 'Services de Développement Web',
      description: 'Créateur d\'expériences digitales sur mesure depuis plus de 17 ans. Je transforme vos idées en solutions web performantes et élégantes.',
      highlightText: '17+ ans'
    },
    servicesGrid: {
      services: [
        {
          id: 'service-website',
          number: 1,
          title: 'Sites Web',
          description: 'Création de sites web modernes, responsives et optimisés pour le SEO',
          color: '#3B82F6',
          colorClass: 'service-blue',
          order: 0
        },
        {
          id: 'service-product',
          number: 2,
          title: 'Produits',
          description: 'Développement de produits digitaux innovants et interfaces utilisateur',
          color: '#10B981',
          colorClass: 'service-green',
          order: 1
        },
        {
          id: 'service-mobile',
          number: 3,
          title: 'Applications Mobile',
          description: 'Applications mobiles natives et hybrides pour iOS et Android',
          color: '#F59E0B',
          colorClass: 'service-orange',
          order: 2
        }
      ]
    }
  };

  /**
   * Active ou désactive l'utilisation de l'API
   */
  setApiMode(enabled: boolean) {
    this.useApi = enabled;
    console.log(`Services Data Service: ${enabled ? 'API' : 'Local'} mode activated`);
  }

  /**
   * Récupère les données de la section Hero
   */
  async getHeroData(): Promise<HeroSectionData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/hero');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data; // Extract data from API response wrapper
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.localData.hero;
      }
    }
    
    return this.localData.hero;
  }

  /**
   * Sauvegarde et publie les données de la section Hero
   */
  async saveHeroData(data: HeroSectionData): Promise<void> {
    if (this.useApi) {
      try {
        // 1. Sauvegarder les données
        const saveResponse = await fetch('/api/services/hero', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!saveResponse.ok) {
          throw new Error(`API Save Error: ${saveResponse.status}`);
        }
        
        // 2. Tester l'endpoint de publication
        try {
          const publishResponse = await fetch('/api/services/publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              createBackup: true,
              versionName: `Hero section update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
        toast.success('✅ Section Hero sauvegardée');
            return;
          }
          
          toast.success('✅ Section Hero sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Section Hero sauvegardée (publication en cours de développement)');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    // Sauvegarde locale (fallback ou mode local)
    this.localData.hero = { ...data };
    localStorage.setItem('services_hero_data', JSON.stringify(data));
    toast.success('Section Hero sauvegardée localement');
  }

  /**
   * Récupère les données de la grille des services
   */
  async getServicesGridData(): Promise<ServicesGridData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/services');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data; // Extract data from API response wrapper
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.localData.servicesGrid;
      }
    }
    
    return this.localData.servicesGrid;
  }

  /**
   * Sauvegarde et publie les données de la grille des services
   */
  async saveServicesGridData(data: ServicesGridData): Promise<void> {
    if (this.useApi) {
      try {
        // 1. Sauvegarder les données
        const saveResponse = await fetch('/api/services/services', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!saveResponse.ok) {
          throw new Error(`API Save Error: ${saveResponse.status}`);
        }
        
        // 2. Tester l'endpoint de publication
        try {
          const publishResponse = await fetch('/api/services/publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              createBackup: true,
              versionName: `Services grid update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
        toast.success('✅ Grille des services sauvegardée');
            return;
          }
          
          toast.success('✅ Grille des services sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Grille des services sauvegardée (publication en cours de développement)');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    // Sauvegarde locale (fallback ou mode local)
    this.localData.servicesGrid = { ...data };
    localStorage.setItem('services_grid_data', JSON.stringify(data));
    toast.success('Grille des services sauvegardée localement');
  }

  /**
   * Charge les données locales depuis localStorage si disponibles
   */
  loadLocalData() {
    try {
      const savedHero = localStorage.getItem('services_hero_data');
      if (savedHero) {
        this.localData.hero = JSON.parse(savedHero);
      }

      const savedServicesGrid = localStorage.getItem('services_grid_data');
      if (savedServicesGrid) {
        this.localData.servicesGrid = JSON.parse(savedServicesGrid);
      }
    } catch (error) {
      console.warn('Failed to load local data:', error);
    }
  }

  /**
   * Teste la connexion API
   */
  async testApiConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/services/health', {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.warn('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Teste la publication en appelant l'endpoint publish
   */
  async testPublish(): Promise<boolean> {
    if (!this.useApi) {
      console.log('Test publish: API mode disabled');
      return false;
    }

    try {
      const response = await fetch('/api/services/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createBackup: false,
          versionName: 'Test publication'
        }),
      });
      
      if (response.ok) {
        toast.success('Test de publication réussi');
        return true;
      } else {
        toast.error('Test de publication échoué');
        return false;
      }
    } catch (error) {
      console.warn('Test publish failed:', error);
      toast.error('Erreur lors du test de publication');
      return false;
    }
  }

  /**
   * Initialise le service avec détection automatique de l'API
   */
  async initialize(): Promise<void> {
    // Charge les données locales d'abord
    this.loadLocalData();
    
    // Teste la connexion API
    const apiAvailable = await this.testApiConnection();
    this.setApiMode(apiAvailable);
    
    if (apiAvailable) {
      toast.success('Services CMS: Mode API activé');
    } else {
      toast.info('Services CMS: Mode local activé');
    }
  }
}

// Instance singleton
export const servicesDataService = new ServicesDataService();
export default servicesDataService;