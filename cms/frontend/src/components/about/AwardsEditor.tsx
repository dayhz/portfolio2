import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, Trash2, ExternalLink } from 'lucide-react';
// import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Award {
  id: string;
  name: string;
  description: string;
  link: string;
}

interface AwardsEditorProps {
  initialAwards: Award[];
  onSave: (awards: Award[]) => Promise<void>;
}

export default function AwardsEditor({ initialAwards, onSave }: AwardsEditorProps) {
  const [awards, setAwards] = useState<Award[]>(initialAwards);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAward, setCurrentAward] = useState<Award | null>(null);
  const [newAward, setNewAward] = useState<Omit<Award, 'id'>>({
    name: '',
    description: '',
    link: '',
  });
//   const notificationSystem = useNotificationSystem();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(awards);
      notificationSystem.success('Récompenses mises à jour', 'Vos récompenses ont été enregistrées avec succès.');
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les récompenses.');
    } finally {
      setIsSaving(false);
    }
  };

  const addAward = () => {
    if (!newAward.name || !newAward.description) {
      notificationSystem.warning('Champs requis', 'Le nom et la description sont requis.');
      return;
    }

    const id = `award-${Date.now()}`;
    setAwards([...awards, { ...newAward, id }]);
    setNewAward({ name: '', description: '', link: '' });
    setIsAddDialogOpen(false);
    handleSave();
  };

  const updateAward = () => {
    if (!currentAward) return;
    
    setAwards(
      awards.map((award) => (award.id === currentAward.id ? currentAward : award))
    );
    setIsEditDialogOpen(false);
    handleSave();
  };

  const deleteAward = () => {
    if (!currentAward) return;
    
    setAwards(awards.filter((award) => award.id !== currentAward.id));
    setIsDeleteDialogOpen(false);
    setCurrentAward(null);
    handleSave();
  };

  const openEditDialog = (award: Award) => {
    setCurrentAward(award);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (award: Award) => {
    setCurrentAward(award);
    setIsDeleteDialogOpen(true);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Récompenses & Reconnaissances</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Ajouter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {awards.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucune récompense
              </h3>
              <p className="mt-2 text-gray-600">
                Ajoutez vos récompenses et reconnaissances pour les afficher sur votre page À Propos.
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <span>Ajouter votre première récompense</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {awards.map((award) => (
                <div key={award.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{award.name}</h3>
                      <p className="text-sm text-gray-600">{award.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(award)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openDeleteDialog(award)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {award.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={award.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visiter
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Award Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une récompense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                value={newAward.name}
                onChange={(e) => setNewAward({ ...newAward, name: e.target.value })}
                placeholder="ex: Awwwards"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Input
                value={newAward.description}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                placeholder="ex: Site du jour — 4 juin 2023"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lien (optionnel)</label>
              <Input
                value={newAward.link}
                onChange={(e) => setNewAward({ ...newAward, link: e.target.value })}
                placeholder="https://..."
                className={!validateUrl(newAward.link) ? 'border-red-500' : ''}
              />
              {!validateUrl(newAward.link) && (
                <p className="text-xs text-red-500">URL invalide</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={addAward} 
              disabled={!newAward.name || !newAward.description || !validateUrl(newAward.link)}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Award Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la récompense</DialogTitle>
          </DialogHeader>
          {currentAward && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={currentAward.name}
                  onChange={(e) => setCurrentAward({ ...currentAward, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Input
                  value={currentAward.description}
                  onChange={(e) => setCurrentAward({ ...currentAward, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien (optionnel)</label>
                <Input
                  value={currentAward.link}
                  onChange={(e) => setCurrentAward({ ...currentAward, link: e.target.value })}
                  className={!validateUrl(currentAward.link) ? 'border-red-500' : ''}
                />
                {!validateUrl(currentAward.link) && (
                  <p className="text-xs text-red-500">URL invalide</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={updateAward} 
              disabled={!currentAward?.name || !currentAward?.description || !validateUrl(currentAward?.link || '')}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Award Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement la récompense
              "{currentAward?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAward} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}