import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { templateProjectService, type SavedProject } from '@/services/templateProjectService';
import { Plus, Edit, Trash2, Copy, Download, Upload, Eye } from 'lucide-react';

export const TemplateProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setIsLoading(true);
    try {
      const allProjects = templateProjectService.getAllProjects();
      setProjects(allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    navigate('/template-editor/new');
  };

  const handleEditProject = (id: string) => {
    navigate(`/template-editor/${id}`);
  };

  const handlePreviewProject = (id: string) => {
    navigate(`/template-preview/${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const success = templateProjectService.deleteProject(id);
      if (success) {
        loadProjects();
        alert('Projet supprimé avec succès !');
      } else {
        alert('Erreur lors de la suppression du projet.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erreur lors de la suppression du projet.');
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const duplicatedProject = templateProjectService.duplicateProject(id);
      if (duplicatedProject) {
        loadProjects();
        alert(`Projet "${duplicatedProject.title}" dupliqué avec succès !`);
      } else {
        alert('Erreur lors de la duplication du projet.');
      }
    } catch (error) {
      console.error('Error duplicating project:', error);
      alert('Erreur lors de la duplication du projet.');
    }
  };

  const handleExportProject = (id: string, title: string) => {
    try {
      const jsonData = templateProjectService.exportProject(id);
      if (jsonData) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Erreur lors de l\'export du projet.');
    }
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = e.target?.result as string;
            const importedProject = templateProjectService.importProject(jsonData);
            loadProjects();
            alert(`Projet "${importedProject.title}" importé avec succès !`);
          } catch (error) {
            console.error('Error importing project:', error);
            alert('Erreur lors de l\'import du projet. Vérifiez le format du fichier.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projets Template</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos projets basés sur le template Zesty
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportProject}>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button onClick={handleNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm text-gray-600">Projets totaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {projects.filter(p => p.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
            </div>
            <div className="text-sm text-gray-600">Modifiés cette semaine</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(projects.map(p => p.client)).size}
            </div>
            <div className="text-sm text-gray-600">Clients uniques</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucun projet</h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier projet template.
            </p>
            <Button onClick={handleNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {project.title || 'Projet sans titre'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{project.client || 'Client'}</Badge>
                      <Badge variant="outline">{project.year}</Badge>
                    </div>
                  </div>
                  {project.heroImage && (
                    <div className="w-16 h-16 ml-4 flex-shrink-0">
                      <img
                        src={project.heroImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.challenge && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.challenge}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <div>Créé : {formatDate(project.createdAt)}</div>
                    <div>Modifié : {formatDate(project.updatedAt)}</div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditProject(project.id)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewProject(project.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateProject(project.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportProject(project.id, project.title)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{project.title}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};