# Design Document - Portfolio CMS

## Overview

Le Portfolio CMS sera une application web moderne construite avec React, TypeScript, Tailwind CSS et Shadcn/ui pour les composants. L'architecture suivra une approche full-stack avec un backend Node.js/Express et une base de données pour stocker le contenu, tout en générant des fichiers HTML statiques pour le portfolio public.

## Architecture

### Stack Technologique

**Frontend (Dashboard Admin)**
- React 18 avec TypeScript
- Tailwind CSS pour le styling
- Shadcn/ui pour les composants UI
- React Router pour la navigation
- React Hook Form pour la gestion des formulaires
- React Query pour la gestion des données
- Zustand pour l'état global

**Backend (API)**
- Node.js avec Express
- TypeScript
- Prisma ORM avec SQLite/PostgreSQL
- Multer pour l'upload de fichiers
- Sharp pour l'optimisation d'images
- JWT pour l'authentification

**Génération Statique**
- Templates Handlebars pour générer le HTML
- Système de build personnalisé pour mettre à jour les fichiers existants

### Architecture Système

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   API Server    │    │  Static Site    │
│   (React/SPA)   │◄──►│  (Node.js/API)  │◄──►│   (HTML/CSS)    │
│                 │    │                 │    │                 │
│ - Shadcn/ui     │    │ - Express       │    │ - Portfolio     │
│ - Tailwind      │    │ - Prisma ORM    │    │ - Existing CSS  │
│ - React Query   │    │ - File Upload   │    │ - Animations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite/PG)   │
                       │                 │
                       │ - Content       │
                       │ - Media         │
                       │ - Users         │
                       └─────────────────┘
```

## Components and Interfaces

### 1. Authentification

**Login Component**
```typescript
interface LoginForm {
  email: string;
  password: string;
}

// Utilise Shadcn/ui Card, Input, Button
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Portfolio CMS</CardTitle>
  </CardHeader>
  <CardContent>
    <Form>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button type="submit">Se connecter</Button>
    </Form>
  </CardContent>
</Card>
```

### 2. Dashboard Layout

**Sidebar Navigation avec Shadcn/ui**
```typescript
const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: User, label: "Profil", href: "/admin/profile" },
  { icon: Briefcase, label: "Projets", href: "/admin/projects" },
  { icon: MessageSquare, label: "Témoignages", href: "/admin/testimonials" },
  { icon: Settings, label: "Services", href: "/admin/services" },
  { icon: Image, label: "Médias", href: "/admin/media" },
  { icon: FileText, label: "À Propos", href: "/admin/about" }
];

// Layout avec Shadcn/ui
<div className="flex h-screen bg-gray-100">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    <Header />
    <div className="p-6">
      {children}
    </div>
  </main>
</div>
```

### 3. Dashboard Principal

**Stats Cards avec Shadcn/ui**
```typescript
interface DashboardStats {
  totalProjects: number;
  totalTestimonials: number;
  lastModified: Date;
  totalViews?: number;
}

// Composants Shadcn/ui utilisés
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
      <Briefcase className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalProjects}</div>
    </CardContent>
  </Card>
  {/* Autres cards similaires */}
</div>
```

### 4. Gestion des Projets

**Project List avec Shadcn/ui Table**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  category: 'website' | 'product' | 'mobile';
  thumbnail: string;
  images: string[];
  year: number;
  client: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Table avec Shadcn/ui
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <CardTitle>Projets</CardTitle>
      <Button onClick={() => setShowCreateModal(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nouveau Projet
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map(project => (
          <TableRow key={project.id}>
            <TableCell>{project.title}</TableCell>
            <TableCell>
              <Badge variant={getCategoryVariant(project.category)}>
                {project.category}
              </Badge>
            </TableCell>
            <TableCell>{project.client}</TableCell>
            <TableCell>
              <Badge variant={project.isPublished ? "default" : "secondary"}>
                {project.isPublished ? "Publié" : "Brouillon"}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => editProject(project.id)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => togglePublish(project.id)}>
                    {project.isPublished ? "Dépublier" : "Publier"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600"
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

**Project Form avec Shadcn/ui**
```typescript
// Formulaire de création/édition avec Shadcn/ui
<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingProject ? "Modifier le projet" : "Nouveau projet"}
      </DialogTitle>
    </DialogHeader>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du projet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du projet"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload d'images avec drag & drop */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingProject ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### 5. Gestion des Médias

**Media Library avec Shadcn/ui**
```typescript
interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// Grid de médias avec Shadcn/ui
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <Input
      placeholder="Rechercher des médias..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-sm"
    />
    <Button onClick={() => setShowUploadModal(true)}>
      <Upload className="mr-2 h-4 w-4" />
      Upload
    </Button>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {filteredMedia.map(file => (
      <Card key={file.id} className="overflow-hidden">
        <div className="aspect-square relative">
          {file.mimeType.startsWith('image/') ? (
            <img
              src={file.thumbnailUrl || file.url}
              alt={file.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FileIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                Copier l'URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadFile(file)}>
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteFile(file.id)}
                className="text-red-600"
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardContent className="p-2">
          <p className="text-xs truncate" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

### 6. Composant d'Upload d'Images

**ImageUpload Component avec Drag & Drop**
```typescript
interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  multiple = false, 
  maxFiles = 5 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Glissez vos images ici ou{" "}
          <Button variant="link" className="p-0 h-auto" onClick={openFileDialog}>
            parcourez
          </Button>
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, WebP jusqu'à 10MB
        </p>
      </div>

      {/* Prévisualisation des images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Upload en cours...</span>
        </div>
      )}
    </div>
  );
};
```

## Data Models

### Base de Données Schema (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // ou "postgresql" pour la production
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id          String   @id @default(cuid())
  name        String
  title       String
  description String
  photo       String?
  email       String
  phone       String?
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Project {
  id          String    @id @default(cuid())
  title       String
  description String
  category    Category
  thumbnail   String
  images      String[]  // JSON array
  year        Int
  client      String
  duration    String?
  industry    String?
  scope       String[]  // JSON array
  challenge   String?
  approach    String?
  testimonial String?
  isPublished Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Category {
  WEBSITE
  PRODUCT
  MOBILE
}

model Testimonial {
  id           String   @id @default(cuid())
  quote        String
  clientName   String
  clientTitle  String
  clientCompany String
  clientPhoto  String?
  projectImage String?
  projectLink  String?
  isActive     Boolean  @default(true)
  order        Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Service {
  id          String   @id @default(cuid())
  name        String
  description String
  features    String[] // JSON array
  process     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MediaFile {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  thumbnailUrl String?
  alt          String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model About {
  id          String   @id @default(cuid())
  biography   String
  stats       Json     // { yearsExperience: 17, age: 35, mentoringSessions: 400, etc. }
  awards      Json[]   // Array of award objects
  socialLinks Json     // Social media links
  photos      String[] // Personal photos array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteBackup {
  id          String   @id @default(cuid())
  description String
  data        Json     // Full site data snapshot
  createdAt   DateTime @default(now())
}
```

## Error Handling

### Frontend Error Handling
```typescript
// Error Boundary pour React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CMS Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="text-center p-6">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Une erreur est survenue</h2>
            <p className="text-gray-600 mb-4">
              Veuillez rafraîchir la page ou contacter le support.
            </p>
            <Button onClick={() => window.location.reload()}>
              Rafraîchir
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Toast notifications avec Shadcn/ui
import { toast } from "sonner";

const handleError = (error: Error) => {
  toast.error("Erreur", {
    description: error.message || "Une erreur inattendue s'est produite"
  });
};

const handleSuccess = (message: string) => {
  toast.success("Succès", {
    description: message
  });
};
```

### Backend Error Handling
```typescript
// Middleware d'erreur Express
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token invalide ou expiré'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Une erreur serveur s\'est produite'
  });
};
```

## Testing Strategy

### Frontend Testing
```typescript
// Tests avec React Testing Library et Jest
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectList from '../components/ProjectList';

describe('ProjectList', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  test('affiche la liste des projets', async () => {
    renderWithProviders(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Projets')).toBeInTheDocument();
    });
  });

  test('permet de créer un nouveau projet', async () => {
    renderWithProviders(<ProjectList />);
    
    const createButton = screen.getByText('Nouveau Projet');
    fireEvent.click(createButton);
    
    expect(screen.getByText('Nouveau projet')).toBeInTheDocument();
  });
});
```

### Backend Testing
```typescript
// Tests API avec Jest et Supertest
import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Projects API', () => {
  beforeEach(async () => {
    await prisma.project.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/projects retourne la liste des projets', async () => {
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('projects');
    expect(Array.isArray(response.body.projects)).toBe(true);
  });

  test('POST /api/projects crée un nouveau projet', async () => {
    const projectData = {
      title: 'Test Project',
      description: 'Test Description',
      category: 'WEBSITE',
      client: 'Test Client',
      year: 2024
    };

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send(projectData)
      .expect(201);

    expect(response.body.project.title).toBe(projectData.title);
  });
});
```

Cette architecture avec Shadcn/ui va donner un dashboard très professionnel et moderne, parfaitement adapté à ton portfolio. Les composants sont réutilisables, accessibles et suivent les meilleures pratiques de design.