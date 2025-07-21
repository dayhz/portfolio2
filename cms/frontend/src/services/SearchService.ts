import { SearchResult, SearchFilters } from '../contexts/SearchContext';

export interface SearchServiceInterface {
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  getSuggestions(query: string): Promise<string[]>;
  getPopularSearches(): Promise<string[]>;
  saveSearchHistory(query: string): Promise<void>;
  getSearchHistory(): Promise<string[]>;
  clearSearchHistory(): Promise<void>;
}

// Service de recherche avec données simulées
class SearchService implements SearchServiceInterface {
  private readonly SEARCH_HISTORY_KEY = 'portfolio-cms-search-history';
  private readonly POPULAR_SEARCHES_KEY = 'portfolio-cms-popular-searches';

  // Données simulées pour la recherche
  private mockData = {
    projects: [
      {
        id: '1',
        title: 'Zesty - Site Web Moderne',
        description: 'Redesign complet du site Zesty avec une approche moderne et responsive',
        category: 'website',
        status: 'published',
        createdAt: '2024-01-15',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
      },
      {
        id: '2',
        title: 'Booksprout - Plateforme de Lecture',
        description: 'Application web pour les amateurs de lecture avec système de recommandations',
        category: 'website',
        status: 'published',
        createdAt: '2024-02-20',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'
      },
      {
        id: '3',
        title: 'FinanceBank - App Mobile',
        description: 'Application mobile de banque avec authentification biométrique',
        category: 'mobile',
        status: 'draft',
        createdAt: '2024-03-10',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
      },
      {
        id: '4',
        title: 'E-commerce Platform',
        description: 'Plateforme e-commerce complète avec gestion des stocks et paiements',
        category: 'website',
        status: 'published',
        createdAt: '2024-01-05',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'
      },
      {
        id: '5',
        title: 'Portfolio Photographe',
        description: 'Site portfolio pour photographe professionnel avec galerie interactive',
        category: 'website',
        status: 'published',
        createdAt: '2024-02-28',
        thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400'
      }
    ],
    media: [
      {
        id: '6',
        title: 'hero-image.jpg',
        description: 'Image principale pour le projet Zesty',
        category: 'image',
        createdAt: '2024-01-16',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
      },
      {
        id: '7',
        title: 'demo-video.mp4',
        description: 'Vidéo de démonstration de l\'application Booksprout',
        category: 'video',
        createdAt: '2024-02-21',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'
      },
      {
        id: '8',
        title: 'logo-design.svg',
        description: 'Logo vectoriel pour le projet FinanceBank',
        category: 'image',
        createdAt: '2024-03-11',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
      },
      {
        id: '9',
        title: 'mockup-mobile.png',
        description: 'Mockup de l\'interface mobile pour l\'application',
        category: 'image',
        createdAt: '2024-02-15',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400'
      }
    ],
    testimonials: [
      {
        id: '10',
        title: 'Témoignage de Chris Leippi',
        description: 'Excellent travail sur le projet Booksprout, très professionnel et à l\'écoute',
        category: 'client',
        status: 'published',
        createdAt: '2024-01-20'
      },
      {
        id: '11',
        title: 'Témoignage de Sarah Johnson',
        description: 'Design moderne et interface intuitive pour notre application mobile',
        category: 'client',
        status: 'published',
        createdAt: '2024-03-15'
      },
      {
        id: '12',
        title: 'Témoignage de Marc Dubois',
        description: 'Livraison dans les temps et qualité exceptionnelle du code',
        category: 'client',
        status: 'published',
        createdAt: '2024-02-10'
      }
    ]
  };

  async search(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    // Simuler un délai de recherche
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!query.trim()) return [];

    // Normaliser la requête pour la recherche
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
    
    const allItems = [
      ...this.mockData.projects.map(item => ({ ...item, type: 'project' as const })),
      ...this.mockData.media.map(item => ({ ...item, type: 'media' as const })),
      ...this.mockData.testimonials.map(item => ({ ...item, type: 'testimonial' as const }))
    ];

    // Appliquer les filtres
    let filteredItems = this.applyFilters(allItems, filters);
    
    // Recherche textuelle avec score de pertinence
    const searchResults = this.performTextSearch(filteredItems, normalizedQuery, queryTerms);
    
    // Trier les résultats
    const sortedResults = this.sortResults(searchResults, filters);
    
    // Sauvegarder dans l'historique
    await this.saveSearchHistory(query);
    
    return sortedResults;
  }

  private applyFilters(items: any[], filters: SearchFilters) {
    let filteredItems = [...items];

    // Filtrer par type
    if (filters.type && filters.type !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === filters.type);
    }

    // Filtrer par catégorie
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Filtrer par statut
    if (filters.status) {
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    
    // Filtrer par date
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        const startDate = filters.dateRange.start.getTime();
        filteredItems = filteredItems.filter(item => {
          if (!item.createdAt) return true;
          return new Date(item.createdAt).getTime() >= startDate;
        });
      }
      
      if (filters.dateRange.end) {
        const endDate = filters.dateRange.end.getTime();
        filteredItems = filteredItems.filter(item => {
          if (!item.createdAt) return true;
          return new Date(item.createdAt).getTime() <= endDate;
        });
      }
    }

    return filteredItems;
  }

  private performTextSearch(items: any[], normalizedQuery: string, queryTerms: string[]): SearchResult[] {
    return items
      .map(item => {
        const normalizedTitle = item.title.toLowerCase();
        const normalizedDescription = item.description?.toLowerCase() || '';
        
        // Calculer le score de pertinence
        let relevanceScore = 0;
        let matchDetails = {
          titleMatches: [] as string[],
          descriptionMatches: [] as string[]
        };
        
        // Correspondances exactes
        if (normalizedTitle === normalizedQuery) {
          relevanceScore += 50;
          matchDetails.titleMatches.push(item.title);
        }
        
        if (normalizedDescription === normalizedQuery) {
          relevanceScore += 30;
          matchDetails.descriptionMatches.push(item.description || '');
        }
        
        // Titre commence par la requête
        if (normalizedTitle.startsWith(normalizedQuery)) {
          relevanceScore += 25;
          matchDetails.titleMatches.push(item.title);
        }
        
        // Correspondances partielles
        if (normalizedTitle.includes(normalizedQuery)) {
          relevanceScore += 15;
          matchDetails.titleMatches.push(item.title);
        }
        
        if (normalizedDescription.includes(normalizedQuery)) {
          relevanceScore += 10;
          matchDetails.descriptionMatches.push(item.description || '');
        }
        
        // Correspondances de termes individuels
        queryTerms.forEach(term => {
          if (normalizedTitle.includes(term)) {
            relevanceScore += 5;
            if (!matchDetails.titleMatches.includes(item.title)) {
              matchDetails.titleMatches.push(item.title);
            }
          }
          
          if (normalizedDescription.includes(term)) {
            relevanceScore += 3;
            if (!matchDetails.descriptionMatches.includes(item.description || '')) {
              matchDetails.descriptionMatches.push(item.description || '');
            }
          }
        });
        
        // Bonus pour les éléments récents
        if (item.createdAt) {
          const itemDate = new Date(item.createdAt).getTime();
          const now = new Date().getTime();
          const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff < 7) {
            relevanceScore += 5;
          } else if (daysDiff < 30) {
            relevanceScore += 2;
          }
        }
        
        // Bonus pour les projets publiés
        if (item.type === 'project' && item.status === 'published') {
          relevanceScore += 3;
        }
        
        return {
          ...item,
          relevanceScore,
          matchDetails
        } as SearchResult;
      })
      .filter(item => item.relevanceScore > 0);
  }

  private sortResults(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return filters.sortOrder === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'date':
          const dateA = new Date(a.createdAt || '').getTime();
          const dateB = new Date(b.createdAt || '').getTime();
          return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        case 'relevance':
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];

    // Récupérer tous les titres et descriptions
    const allTitles = [
      ...this.mockData.projects.map(p => p.title),
      ...this.mockData.media.map(m => m.title),
      ...this.mockData.testimonials.map(t => t.title)
    ];
    
    const allDescriptions = [
      ...this.mockData.projects.map(p => p.description || ""),
      ...this.mockData.media.map(m => m.description || ""),
      ...this.mockData.testimonials.map(t => t.description || "")
    ].filter(desc => desc.length > 0);
    
    // Extraire des mots-clés
    const keywordsFromDescriptions = allDescriptions
      .flatMap(desc => desc.split(/\s+/).filter(word => word.length > 3))
      .filter((value, index, self) => self.indexOf(value) === index);
    
    // Combiner avec l'historique
    const history = await this.getSearchHistory();
    const allSuggestionSources = [
      ...allTitles,
      ...keywordsFromDescriptions,
      ...history
    ];
    
    // Filtrer les suggestions pertinentes
    const filteredSuggestions = allSuggestionSources
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      });
    
    return [...new Set(filteredSuggestions)].slice(0, 5);
  }

  async getPopularSearches(): Promise<string[]> {
    const stored = localStorage.getItem(this.POPULAR_SEARCHES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Recherches populaires par défaut
    return [
      'Zesty',
      'Mobile',
      'Website',
      'Design',
      'Portfolio'
    ];
  }

  async saveSearchHistory(query: string): Promise<void> {
    const history = await this.getSearchHistory();
    const filtered = history.filter(item => item !== query);
    const newHistory = [query, ...filtered].slice(0, 10);
    
    localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    
    // Mettre à jour les recherches populaires
    await this.updatePopularSearches(query);
  }

  async getSearchHistory(): Promise<string[]> {
    const stored = localStorage.getItem(this.SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async clearSearchHistory(): Promise<void> {
    localStorage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  private async updatePopularSearches(query: string): Promise<void> {
    // Logique simple pour mettre à jour les recherches populaires
    // Dans un vrai système, cela serait géré côté serveur
    const popular = await this.getPopularSearches();
    if (!popular.includes(query)) {
      const newPopular = [query, ...popular].slice(0, 10);
      localStorage.setItem(this.POPULAR_SEARCHES_KEY, JSON.stringify(newPopular));
    }
  }
}

// Instance singleton du service
export const searchService = new SearchService();