# Design Document - Homepage CMS

## Overview

Ce document décrit l'architecture technique et l'interface utilisateur du système CMS pour la gestion complète du contenu de la homepage du portfolio. Le système permettra la modification en temps réel de toutes les sections via une interface d'administration intuitive.

## Architecture

### Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CMS Frontend  │    │   CMS Backend   │    │  Portfolio Site │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Static HTML) │
│                 │    │                 │    │                 │
│ - Interface     │    │ - API Routes    │    │ - Injection     │
│ - Formulaires   │    │ - Database      │    │ - Rendu final   │
│ - Prévisualisation│  │ - Validation    │    │ - Utilisateurs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Base de Données

**Table: `homepage_content`**
```sql
CREATE TABLE homepage_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  field_type VARCHAR(20) DEFAULT 'text',
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `homepage_versions`**
```sql
CREATE TABLE homepage_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_name VARCHAR(100),
  content_snapshot TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE
);
```

### Structure des Données par Section

#### 1. Section Hero
```json
{
  "section": "hero",
  "fields": {
    "title": "Product Designer & Manager",
    "description": "Hey, Je suis Lawson Sydney...",
    "video_url": "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/vbreel2025.mp4"
  }
}
```

#### 2. Section Brands
```json
{
  "section": "brands",
  "fields": {
    "title": "Je travaille avec des clients fabuleux",
    "logos": [
      {
        "id": 1,
        "name": "Client 1",
        "logo_url": "/images/logo-01.svg",
        "order": 1
      }
    ]
  }
}
```

#### 3. Section Services
```json
{
  "section": "services",
  "fields": {
    "title": "Services",
    "description": "Je me focalise sur 3 services...",
    "services": [
      {
        "id": 1,
        "number": "1.",
        "title": "Produits",
        "description": "Des produits qui répondent...",
        "link": "work@filter=website.html#options",
        "color_class": "services_bg_colored"
      }
    ]
  }
}
```

#### 4. Section Offre
```json
{
  "section": "offer",
  "fields": {
    "title": "M'engager c'est...",
    "points": [
      {
        "id": 1,
        "text": "Trouver un partenaire qui a coeur votre développement.",
        "order": 1
      }
    ]
  }
}
```

#### 5. Section Témoignages
```json
{
  "section": "testimonials",
  "fields": {
    "testimonials": [
      {
        "id": 1,
        "text": "J'ai eu le privilège de travailler...",
        "client_name": "Jasen Dowell",
        "client_title": "CEO, Savills Stacker",
        "client_photo": "/images/img-jasen.png",
        "project_link": "https://apps.apple.com/...",
        "project_image": "/images/img-case-stacker.png",
        "order": 1
      }
    ]
  }
}
```

#### 6. Section Footer
```json
{
  "section": "footer",
  "fields": {
    "title": "Construisons Ensemble",
    "email": "s.lawson@killingiants.com",
    "copyright": "© 2025 Lawson Sydney — Comme Betsaleel...",
    "links": {
      "site": [
        {"text": "Accueil", "url": "index.html"},
        {"text": "Services", "url": "services.html"}
      ],
      "professional": [
        {"text": "LinkedIn", "url": "https://linkedin.com/..."}
      ],
      "social": [
        {"text": "Facebook", "url": "https://facebook.com/..."}
      ]
    }
  }
}
```

## Components et Interfaces

### Interface CMS Frontend

#### 1. Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Homepage CMS                                    [Preview] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │   📝 Hero   │ │ 🏢 Brands   │ │ 💼 Portfolio│            │
│ │   Section   │ │   Section   │ │   Section   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 🛠️ Services │ │ 🎯 Offre    │ │ 💬 Témoign. │            │
│ │   Section   │ │   Section   │ │   Section   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐                            │
│ │ 📞 Footer   │ │ 📋 Versions │                            │
│ │   Section   │ │   & Backup  │                            │
│ └─────────────┘ └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Éditeur de Section (Exemple: Hero)
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour au Dashboard    📝 Section Hero        [Sauvegarder]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Titre Principal:                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Product Designer & Manager                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Description:                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Hey, Je suis Lawson Sydney,                             │ │
│ │ Je transforme vos idées en applications...              │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Vidéo de fond:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://vbportfolio.nyc3.cdn.digitaloceanspaces.com... │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [📁 Choisir un fichier] [🎬 Prévisualiser]                 │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │   💾 Sauvegarder │ │   👁️ Prévisualiser │                    │
│ └─────────────────┘ └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Éditeur de Liste (Exemple: Services)
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour au Dashboard   🛠️ Section Services    [Sauvegarder] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Titre de la section:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Services                                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Description:                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Je me focalise sur 3 services de design...             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Services: [+ Ajouter un service]                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔢 1. │ Produits                              [↑] [↓] [×]│ │
│ │ Des produits qui répondent aux vrais besoins...        │ │
│ │ Lien: work@filter=website.html#options                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔢 2. │ Apps                                  [↑] [↓] [×]│ │
│ │ Je crée des apps mobiles fluides...                    │ │
│ │ Lien: work@filter=product.html#options                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints

#### Routes Backend
```javascript
// Routes principales
GET    /api/homepage                    // Récupérer tout le contenu
GET    /api/homepage/:section           // Récupérer une section
PUT    /api/homepage/:section           // Mettre à jour une section
POST   /api/homepage/media              // Upload de médias
GET    /api/homepage/versions           // Lister les versions
POST   /api/homepage/versions           // Créer une version
PUT    /api/homepage/versions/:id/restore // Restaurer une version

// Routes spécifiques par section
GET    /api/homepage/hero               // Section Hero
PUT    /api/homepage/hero
GET    /api/homepage/brands             // Section Brands
PUT    /api/homepage/brands
POST   /api/homepage/brands/logo        // Ajouter un logo
DELETE /api/homepage/brands/logo/:id    // Supprimer un logo
GET    /api/homepage/services           // Section Services
PUT    /api/homepage/services
GET    /api/homepage/testimonials       // Section Témoignages
PUT    /api/homepage/testimonials
POST   /api/homepage/testimonials       // Ajouter un témoignage
DELETE /api/homepage/testimonials/:id   // Supprimer un témoignage
GET    /api/homepage/footer             // Section Footer
PUT    /api/homepage/footer
```

### Injection dans le Portfolio

#### Système d'Injection
```javascript
// Extension du serveur portfolio existant
function injectHomepageContent(html, homepageData) {
  // 1. Injection Hero
  html = injectHeroContent(html, homepageData.hero);
  
  // 2. Injection Brands
  html = injectBrandsContent(html, homepageData.brands);
  
  // 3. Injection Services
  html = injectServicesContent(html, homepageData.services);
  
  // 4. Injection Offre
  html = injectOfferContent(html, homepageData.offer);
  
  // 5. Injection Témoignages
  html = injectTestimonialsContent(html, homepageData.testimonials);
  
  // 6. Injection Footer
  html = injectFooterContent(html, homepageData.footer);
  
  return html;
}
```

#### Placeholders dans le HTML
```html
<!-- Section Hero -->
<h1>{{HERO_TITLE}}</h1>
<p>{{HERO_DESCRIPTION}}</p>
<video src="{{HERO_VIDEO_URL}}"></video>

<!-- Section Services -->
<h2>{{SERVICES_TITLE}}</h2>
<p>{{SERVICES_DESCRIPTION}}</p>
<div class="services_group_link">
  {{SERVICES_LIST}}
</div>

<!-- Section Témoignages -->
<div class="slider">
  {{TESTIMONIALS_LIST}}
</div>
```

## Data Models

### HomepageContent Model
```typescript
interface HomepageContent {
  id: number;
  section: 'hero' | 'brands' | 'services' | 'offer' | 'testimonials' | 'footer';
  fieldName: string;
  fieldValue: string;
  fieldType: 'text' | 'textarea' | 'url' | 'image' | 'json';
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Section-Specific Models
```typescript
interface HeroSection {
  title: string;
  description: string;
  videoUrl: string;
}

interface BrandsSection {
  title: string;
  logos: Array<{
    id: number;
    name: string;
    logoUrl: string;
    order: number;
  }>;
}

interface ServicesSection {
  title: string;
  description: string;
  services: Array<{
    id: number;
    number: string;
    title: string;
    description: string;
    link: string;
    colorClass: string;
  }>;
}

interface TestimonialsSection {
  testimonials: Array<{
    id: number;
    text: string;
    clientName: string;
    clientTitle: string;
    clientPhoto: string;
    projectLink: string;
    projectImage: string;
    order: number;
  }>;
}
```

## Error Handling

### Validation des Données
```javascript
// Validation côté backend
const validateHeroSection = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length < 1) {
    errors.push('Le titre est requis');
  }
  
  if (!data.description || data.description.length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  }
  
  if (data.videoUrl && !isValidUrl(data.videoUrl)) {
    errors.push('L\'URL de la vidéo n\'est pas valide');
  }
  
  return errors;
};
```

### Gestion des Erreurs Frontend
```typescript
// Gestion des erreurs dans React
const [errors, setErrors] = useState<string[]>([]);
const [loading, setLoading] = useState(false);

const handleSave = async (data: HeroSection) => {
  setLoading(true);
  setErrors([]);
  
  try {
    await api.updateHeroSection(data);
    showSuccessMessage('Section Hero mise à jour avec succès');
  } catch (error) {
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrors(['Une erreur inattendue s\'est produite']);
    }
  } finally {
    setLoading(false);
  }
};
```

## Testing Strategy

### Tests Backend
```javascript
// Tests API
describe('Homepage API', () => {
  test('GET /api/homepage should return all sections', async () => {
    const response = await request(app).get('/api/homepage');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('hero');
    expect(response.body).toHaveProperty('services');
  });
  
  test('PUT /api/homepage/hero should update hero section', async () => {
    const heroData = {
      title: 'New Title',
      description: 'New Description',
      videoUrl: 'https://example.com/video.mp4'
    };
    
    const response = await request(app)
      .put('/api/homepage/hero')
      .send(heroData);
      
    expect(response.status).toBe(200);
  });
});
```

### Tests Frontend
```typescript
// Tests composants React
describe('HeroEditor', () => {
  test('should render hero editor form', () => {
    render(<HeroEditor />);
    expect(screen.getByLabelText('Titre Principal')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
  
  test('should save hero data on form submit', async () => {
    const mockSave = jest.fn();
    render(<HeroEditor onSave={mockSave} />);
    
    fireEvent.change(screen.getByLabelText('Titre Principal'), {
      target: { value: 'New Title' }
    });
    
    fireEvent.click(screen.getByText('Sauvegarder'));
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        title: 'New Title',
        // ...
      });
    });
  });
});
```

### Tests d'Intégration
```javascript
// Tests end-to-end
describe('Homepage CMS Integration', () => {
  test('should update homepage content and reflect changes on portfolio site', async () => {
    // 1. Mettre à jour le contenu via CMS
    await updateHeroSection({
      title: 'Updated Title'
    });
    
    // 2. Vérifier que le portfolio site reflète les changements
    const portfolioResponse = await fetch('http://localhost:3001');
    const html = await portfolioResponse.text();
    
    expect(html).toContain('Updated Title');
  });
});
```

## Performance Considerations

### Optimisations
1. **Cache Redis** pour les données fréquemment accédées
2. **Compression d'images** automatique lors de l'upload
3. **Lazy loading** des sections dans l'interface CMS
4. **Debouncing** des sauvegardes automatiques
5. **Optimisation des requêtes** base de données

### Monitoring
1. **Temps de réponse** des API
2. **Taille des payloads** JSON
3. **Utilisation mémoire** du serveur portfolio
4. **Temps de génération** des pages

Cette architecture garantit une solution robuste, maintenable et performante pour la gestion complète du contenu de la homepage.