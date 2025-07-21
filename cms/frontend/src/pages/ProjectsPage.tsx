import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Work, Plus, Search, Edit, Delete } from 'react-iconly';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PreviewButton from '@/components/preview/PreviewButton';
import { AdvancedProject } from '@/components/ProjectFormAdvanced';
import { usePreviewMode } from '@/hooks/usePreviewMode';

// Utilisation du type AdvancedProject
type Project = AdvancedProject;

// Données mock pour les projets (format avancé)
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'A growing community of authors and readers',
    subtitle: 'Complete redesign of Booksprout platform with modern UI/UX principles and improved user experience.',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    category: 'website',
    status: 'published',
    client: 'Booksprout',
    year: 2024,
    duration: '2 months',
    industry: 'Publishing',
    scope: ['UI/UX', 'Wireframe', 'Digital Design', 'Icon Design'],
    projectUrl: 'https://booksprout.co',
    challenge: 'The old Booksprout website felt outdated and didn\'t communicate the right message. With Booksprout SaaS v.2 launching soon, it was the perfect time for a redesign.',
    approach: 'We created a custom design for Booksprout that better aligned with their brand and goals. The team rewrote the entire content, narrowing the scope of the website to focus on the key elements.',
    contentBlocks: [
      {
        id: '1',
        type: 'paragraph' as const,
        content: 'The Booksprout community knew the website well but with the old look, the website was lacking a professional aspect to bring new users to the community.'
      }
    ],
    testimonial: {
      quote: 'Lawson produced some really cool designs and he always made sure I was happy with everything before we finished the project.',
      clientName: 'Chris Leippi',
      clientRole: 'Founder, Booksprout'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Mobile Banking Revolution',
    subtitle: 'Secure and user-friendly mobile banking application with biometric authentication and modern design.',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    category: 'mobile',
    status: 'draft',
    client: 'FinanceBank',
    year: 2024,
    duration: '4 months',
    industry: 'Finance',
    scope: ['UI/UX', 'Prototyping', 'User Research', 'Mobile Development'],
    projectUrl: '',
    challenge: 'Traditional banking apps were complex and intimidating for users. We needed to create a simple, secure, and intuitive mobile banking experience.',
    approach: 'We conducted extensive user research and created a design system focused on simplicity and security. The app features biometric authentication and a clean, modern interface.',
    contentBlocks: [],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  }
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const { showPreview } = usePreviewMode('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // État pour la gestion des projets

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    draft: projects.filter(p => p.status === 'draft').length,
    archived: projects.filter(p => p.status === 'archived').length,
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleEditProject = (_project: Project) => {
    // Pour l'instant, on redirige vers la création
    // Plus tard, on créera une page d'édition dédiée
    toast.info('Édition de projet - En cours de développement');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast.success('Projet supprimé avec succès !');
  };



  const getStatusBadge = (status: Project['status']) => {
    const variants = {
      draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' },
      published: { label: 'Publié', color: 'bg-green-100 text-green-800' },
      archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = variants[status];
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Project['category']) => {
    const variants = {
      website: { label: 'Site Web', color: 'bg-blue-100 text-blue-800' },
      product: { label: 'Produit', color: 'bg-purple-100 text-purple-800' },
      mobile: { label: 'Mobile', color: 'bg-green-100 text-green-800' }
    };
    
    const config = variants[category];
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Work size="large" primaryColor="#3b82f6" />
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center space-x-2">
          <Plus size="small" />
          <span>Nouveau projet</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size="small" />
                </div>
                <Input
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="website">Site Web</SelectItem>
                <SelectItem value="product">Produit</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Année</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={project.heroImage}
                        alt={project.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.subtitle}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(project.category)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {project.client}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {project.year}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const previewData = {
                              ...project,
                              content: project.content || ''
                            };
                            
                            // Utiliser le système de prévisualisation unifié
                            showPreview(previewData);
                          }}
                        >
                          👁️ Prévisualiser
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <div className="mr-2">
                            <Edit size="small" />
                          </div>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600"
                        >
                          <div className="mr-2">
                            <Delete size="small" />
                          </div>
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




    </div>
  );
}