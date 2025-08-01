import { HeroSectionData, ServicesGridData, ServiceItem, SkillsVideoData, ApproachData, ApproachStep, TestimonialsData, ClientsData } from '../../../shared/types/services';
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
    approach: ApproachData;
    testimonials: TestimonialsData;
    clients: ClientsData;
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
    },
    approach: {
      description: 'Mon processus de travail structuré en 4 étapes pour garantir des résultats optimaux.',
      steps: [
        {
          id: 'step-1',
          number: 1,
          title: 'Analyse et Découverte',
          description: 'Compréhension approfondie de vos besoins, objectifs et contraintes pour définir la stratégie optimale.',
          icon: '',
          order: 1
        },
        {
          id: 'step-2',
          number: 2,
          title: 'Conception et Design',
          description: 'Création des maquettes, prototypes et systèmes de design pour valider l\'expérience utilisateur.',
          icon: '',
          order: 2
        },
        {
          id: 'step-3',
          number: 3,
          title: 'Développement',
          description: 'Implémentation technique avec les meilleures pratiques et technologies adaptées à votre projet.',
          icon: '',
          order: 3
        },
        {
          id: 'step-4',
          number: 4,
          title: 'Livraison et Suivi',
          description: 'Déploiement, formation et accompagnement pour assurer le succès de votre projet.',
          icon: '',
          order: 4
        }
      ]
    },
    testimonials: {
      testimonials: []
    },
    clients: {
      clients: []
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

      const savedApproach = localStorage.getItem('services_approach_data');
      if (savedApproach) {
        this.localData.approach = JSON.parse(savedApproach);
      }

      const savedTestimonials = localStorage.getItem('services_testimonials_data');
      if (savedTestimonials) {
        this.localData.testimonials = JSON.parse(savedTestimonials);
      }

      const savedClients = localStorage.getItem('services_clients_data');
      if (savedClients) {
        this.localData.clients = JSON.parse(savedClients);
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
   * Récupère les données de la section Skills & Video
   */
  async getSkillsVideoData(): Promise<SkillsVideoData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/skills');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data; // Extract data from API response wrapper
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.getDefaultSkillsVideoData();
      }
    }
    
    return this.getDefaultSkillsVideoData();
  }

  /**
   * Sauvegarde et publie les données de la section Skills & Video
   */
  async saveSkillsVideoData(data: SkillsVideoData): Promise<void> {
    if (this.useApi) {
      try {
        // 1. Sauvegarder les données
        const saveResponse = await fetch('/api/services/skills', {
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
              versionName: `Skills & Video update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
            toast.success('✅ Section Skills & Video sauvegardée');
            return;
          }
          
          toast.success('✅ Section Skills & Video sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Section Skills & Video sauvegardée');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    // Sauvegarde locale (fallback ou mode local)
    localStorage.setItem('skills_video_data', JSON.stringify(data));
    toast.success('Section Skills & Video sauvegardée localement');
  }

  /**
   * Récupère les données de la section Approach
   */
  async getApproachData(): Promise<ApproachData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/approach');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data; // Extract data from API response wrapper
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.localData.approach;
      }
    }
    
    return this.localData.approach;
  }

  /**
   * Sauvegarde et publie les données de la section Approach
   */
  async saveApproachData(data: ApproachData): Promise<void> {
    if (this.useApi) {
      try {
        // 1. Sauvegarder les données
        const saveResponse = await fetch('/api/services/approach', {
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
              versionName: `Approach section update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
            toast.success('✅ Section Processus sauvegardée');
            return;
          }
          
          toast.success('✅ Section Processus sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Section Processus sauvegardée');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    // Sauvegarde locale (fallback ou mode local)
    this.localData.approach = { ...data };
    localStorage.setItem('services_approach_data', JSON.stringify(data));
    toast.success('Section Processus sauvegardée localement');
  }

  /**
   * Récupère les données de la section Testimonials
   */
  async getTestimonialsData(): Promise<TestimonialsData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/testimonials');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.localData.testimonials;
      }
    }
    
    return this.localData.testimonials;
  }

  /**
   * Sauvegarde et publie les données de la section Testimonials
   */
  async saveTestimonialsData(data: TestimonialsData): Promise<void> {
    if (this.useApi) {
      try {
        const saveResponse = await fetch('/api/services/testimonials', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!saveResponse.ok) {
          throw new Error(`API Save Error: ${saveResponse.status}`);
        }
        
        try {
          const publishResponse = await fetch('/api/services/publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              createBackup: true,
              versionName: `Testimonials update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
            toast.success('✅ Section Témoignages sauvegardée');
            return;
          }
          
          toast.success('✅ Section Témoignages sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Section Témoignages sauvegardée');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    this.localData.testimonials = { ...data };
    localStorage.setItem('services_testimonials_data', JSON.stringify(data));
    toast.success('Section Témoignages sauvegardée localement');
  }

  /**
   * Récupère les données de la section Clients
   */
  async getClientsData(): Promise<ClientsData> {
    if (this.useApi) {
      try {
        const response = await fetch('/api/services/clients');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.warn('API failed, falling back to local data:', error);
        toast.warning('Connexion API échouée, utilisation des données locales');
        return this.localData.clients;
      }
    }
    
    return this.localData.clients;
  }

  /**
   * Sauvegarde et publie les données de la section Clients
   */
  async saveClientsData(data: ClientsData): Promise<void> {
    if (this.useApi) {
      try {
        const saveResponse = await fetch('/api/services/clients', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!saveResponse.ok) {
          throw new Error(`API Save Error: ${saveResponse.status}`);
        }
        
        try {
          const publishResponse = await fetch('/api/services/publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              createBackup: true,
              versionName: `Clients update - ${new Date().toISOString()}`
            }),
          });
          
          if (!publishResponse.ok) {
            const errorData = await publishResponse.text();
            console.warn('Publish failed:', publishResponse.status, errorData);
            toast.success('✅ Section Clients sauvegardée');
            return;
          }
          
          toast.success('✅ Section Clients sauvegardée et publiée');
        } catch (publishError) {
          console.warn('Publish error:', publishError);
          toast.success('✅ Section Clients sauvegardée');
        }
        return;
      } catch (error) {
        console.warn('API save/publish failed, saving locally:', error);
        toast.warning('Sauvegarde API échouée, données sauvées localement');
      }
    }
    
    this.localData.clients = { ...data };
    localStorage.setItem('services_clients_data', JSON.stringify(data));
    toast.success('Section Clients sauvegardée localement');
  }

  /**
   * Données par défaut pour Skills & Video
   */
  private getDefaultSkillsVideoData(): SkillsVideoData {
    return {
      description: 'The ideal balance between UX and UI is what makes a winning product.',
      skills: [
        { id: 'skill-1', name: 'User Experience Design', order: 0 },
        { id: 'skill-2', name: 'User Interface Design', order: 1 },
        { id: 'skill-3', name: 'Prototyping', order: 2 },
        { id: 'skill-4', name: 'Design Systems', order: 3 },
        { id: 'skill-5', name: 'Interaction Design', order: 4 }
      ],
      ctaText: 'See all projects',
      ctaUrl: '/work',
      video: {
        url: '',
        caption: 'Watch my design process in action',
        autoplay: true,
        loop: true,
        muted: true
      }
    };
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