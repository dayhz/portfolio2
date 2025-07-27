import { useState, useEffect } from 'react';
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
import ProjectService from '@/services/ProjectService';
import { AuthDebugger } from '@/components/AuthDebugger';

// Utilisation du type AdvancedProject
type Project = AdvancedProject;

// Fonction pour convertir les projets de l'API au format AdvancedProject
const convertApiProjectToAdvancedProject = (apiProject: any): Project => {
  console.log('Conversion du projet API:', apiProject);
  
  // S'assurer que toutes les propriétés sont correctement définies
  const project = {
    id: apiProject.id,
    title: apiProject.title || '',
    subtitle: apiProject.description || '',
    description: apiProject.description || '',
    heroImage: apiProject.thumbnail || '',
    heroImagePreview: apiProject.thumbnail || '',
    category: apiProject.category ? apiProject.category.toLowerCase() : 'website',
    status: apiProject.isPublished ? 'published' : 'draft',
    client: apiProject.client || '',
    year: apiProject.year || new Date().getFullYear(),
    duration: apiProject.duration || '',
    industry: apiProject.industry || '',
    scope: apiProject.scope ? JSON.parse(apiProject.scope) : [],
    projectUrl: '',
    challenge: apiProject.challenge || '',
    approach: apiProject.approach || '',
    contentBlocks: [],
    content: apiProject.content || '', // Ajout du contenu du projet
    testimonial: apiProject.testimonial ? JSON.parse(apiProject.testimonial) : undefined,
    createdAt: apiProject.createdAt,
    updatedAt: apiProject.updatedAt
  };
  
  console.log('Projet converti:', project);
  return project;
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showPreview } = usePreviewMode('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await ProjectService.getProjects();
        const convertedProjects = response.data.map(convertApiProjectToAdvancedProject);
        setProjects(convertedProjects);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        setError('Impossible de charger les projets. Veuillez réessayer plus tard.');
        // Utiliser des données mock en cas d'erreur pour le développement
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

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

  const handleEditProject = async (project: Project) => {
    console.log('Édition du projet:', project);
    
    try {
      // Récupérer les données complètes du projet depuis l'API
      const fullProject = await ProjectService.getProject(project.id);
      console.log('Données complètes du projet récupérées:', fullProject);
      
      // Récupérer également le contenu du projet
      const projectContent = await ProjectService.getProjectContent(project.id);
      console.log('Contenu du projet récupéré:', projectContent ? 'Contenu présent' : 'Pas de contenu');
      
      // Convertir le projet API en format AdvancedProject
      const projectForEdit = convertApiProjectToAdvancedProject(fullProject);
      
      // Ajouter explicitement le contenu récupéré
      projectForEdit.content = projectContent;
      
      console.log('Projet converti pour édition avec contenu:', projectForEdit);
      
      // Sauvegarder les données du projet dans le localStorage pour l'édition
      localStorage.setItem('projectDraft', JSON.stringify(projectForEdit));
      console.log('Données du projet sauvegardées dans localStorage');
      
      // Vérifier que les données ont bien été sauvegardées
      const savedData = localStorage.getItem('projectDraft');
      console.log('Vérification des données sauvegardées:', savedData);
      
      if (!savedData) {
        toast.error('Erreur: Les données n\'ont pas été sauvegardées dans localStorage');
        return;
      }
      
      // Rediriger vers la page de contenu du projet
      console.log('Redirection vers /projects/content');
      navigate('/projects/content');
    } catch (error) {
      console.error('Erreur lors de la récupération/sauvegarde des données:', error);
      toast.error('Erreur lors de la préparation des données pour l\'édition');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await ProjectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Projet supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-gray-500">Chargement des projets...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <p className="text-gray-500">Aucun projet trouvé</p>
              <Button onClick={handleCreateProject} variant="outline" className="flex items-center space-x-2">
                <Plus size="small" />
                <span>Créer votre premier projet</span>
              </Button>
            </div>
          ) : (
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
                              content: ''
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
          )}
        </CardContent>
      </Card>




    </div>
  );
}