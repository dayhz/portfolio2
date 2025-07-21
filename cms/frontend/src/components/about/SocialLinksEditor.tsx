import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, Trash2, Check } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface SocialLinksEditorProps {
  initialLinks: SocialLink[];
  onSave: (links: SocialLink[]) => Promise<void>;
}

const PLATFORMS = [
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'Twitter', icon: 'twitter' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'GitHub', icon: 'github' },
  { name: 'Dribbble', icon: 'dribbble' },
  { name: 'Behance', icon: 'behance' },
  { name: 'Medium', icon: 'medium' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'TikTok', icon: 'tiktok' },
  { name: 'Website', icon: 'globe' },
  { name: 'Email', icon: 'mail' },
  { name: 'Autre', icon: 'link' },
];

export default function SocialLinksEditor({ initialLinks, onSave }: SocialLinksEditorProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<SocialLink | null>(null);
  const [newLink, setNewLink] = useState<Omit<SocialLink, 'id'>>({
    platform: '',
    url: '',
    icon: '',
  });
  const notificationSystem = useNotificationSystem();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(links);
      notificationSystem.success('Liens sociaux mis à jour', 'Vos liens sociaux ont été enregistrés avec succès.');
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les liens sociaux.');
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    if (!newLink.platform || !newLink.url) {
      notificationSystem.warning('Champs requis', 'La plateforme et l\'URL sont requises.');
      return;
    }

    if (!validateUrl(newLink.url)) {
      notificationSystem.warning('URL invalide', 'Veuillez entrer une URL valide.');
      return;
    }

    const id = `link-${Date.now()}`;
    const icon = PLATFORMS.find(p => p.name === newLink.platform)?.icon || 'link';
    
    setLinks([...links, { ...newLink, id, icon }]);
    setNewLink({ platform: '', url: '', icon: '' });
    setIsAddDialogOpen(false);
    handleSave();
  };

  const updateLink = () => {
    if (!currentLink) return;
    
    if (!validateUrl(currentLink.url)) {
      notificationSystem.warning('URL invalide', 'Veuillez entrer une URL valide.');
      return;
    }
    
    setLinks(
      links.map((link) => (link.id === currentLink.id ? currentLink : link))
    );
    setIsEditDialogOpen(false);
    handleSave();
  };

  const deleteLink = () => {
    if (!currentLink) return;
    
    setLinks(links.filter((link) => link.id !== currentLink.id));
    setIsDeleteDialogOpen(false);
    setCurrentLink(null);
    handleSave();
  };

  const openEditDialog = (link: SocialLink) => {
    setCurrentLink(link);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (link: SocialLink) => {
    setCurrentLink(link);
    setIsDeleteDialogOpen(true);
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    
    // Handle email links
    if (url.startsWith('mailto:')) {
      const email = url.replace('mailto:', '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handlePlatformChange = (platform: string, isNew = true) => {
    const selectedPlatform = PLATFORMS.find(p => p.name === platform);
    
    if (isNew) {
      setNewLink({
        ...newLink,
        platform,
        icon: selectedPlatform?.icon || 'link'
      });
    } else if (currentLink) {
      setCurrentLink({
        ...currentLink,
        platform,
        icon: selectedPlatform?.icon || 'link'
      });
    }
  };

  const getUrlPlaceholder = (platform: string) => {
    switch (platform) {
      case 'LinkedIn':
        return 'https://www.linkedin.com/in/username';
      case 'Twitter':
        return 'https://twitter.com/username';
      case 'Instagram':
        return 'https://www.instagram.com/username';
      case 'Facebook':
        return 'https://www.facebook.com/username';
      case 'GitHub':
        return 'https://github.com/username';
      case 'Dribbble':
        return 'https://dribbble.com/username';
      case 'Behance':
        return 'https://www.behance.net/username';
      case 'Medium':
        return 'https://medium.com/@username';
      case 'YouTube':
        return 'https://www.youtube.com/c/channelname';
      case 'TikTok':
        return 'https://www.tiktok.com/@username';
      case 'Email':
        return 'mailto:email@example.com';
      default:
        return 'https://example.com';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liens Sociaux</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Ajouter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucun lien social
              </h3>
              <p className="mt-2 text-gray-600">
                Ajoutez vos liens vers les réseaux sociaux pour les afficher sur votre page À Propos.
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <span>Ajouter votre premier lien</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {link.platform === 'LinkedIn' && '🔗'}
                      {link.platform === 'Twitter' && '🐦'}
                      {link.platform === 'Instagram' && '📸'}
                      {link.platform === 'Facebook' && '👍'}
                      {link.platform === 'GitHub' && '💻'}
                      {link.platform === 'Dribbble' && '🏀'}
                      {link.platform === 'Behance' && '🎨'}
                      {link.platform === 'Medium' && '📝'}
                      {link.platform === 'YouTube' && '📺'}
                      {link.platform === 'TikTok' && '🎵'}
                      {link.platform === 'Email' && '✉️'}
                      {link.platform === 'Website' && '🌐'}
                      {link.platform === 'Autre' && '🔗'}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{link.platform}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-[300px]">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(link)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openDeleteDialog(link)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        Visiter
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lien social</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plateforme *</label>
              <Select onValueChange={(value) => handlePlatformChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL *</label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder={getUrlPlaceholder(newLink.platform)}
                className={!validateUrl(newLink.url) && newLink.url ? 'border-red-500' : ''}
              />
              {!validateUrl(newLink.url) && newLink.url && (
                <p className="text-xs text-red-500">URL invalide</p>
              )}
              {newLink.platform === 'Email' && (
                <p className="text-xs text-gray-500">Format: mailto:email@example.com</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={addLink} 
              disabled={!newLink.platform || !newLink.url || !validateUrl(newLink.url)}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le lien social</DialogTitle>
          </DialogHeader>
          {currentLink && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plateforme *</label>
                <Select 
                  defaultValue={currentLink.platform} 
                  onValueChange={(value) => handlePlatformChange(value, false)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.name} value={platform.name}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL *</label>
                <Input
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder={getUrlPlaceholder(currentLink.platform)}
                  className={!validateUrl(currentLink.url) ? 'border-red-500' : ''}
                />
                {!validateUrl(currentLink.url) && (
                  <p className="text-xs text-red-500">URL invalide</p>
                )}
                {currentLink.platform === 'Email' && (
                  <p className="text-xs text-gray-500">Format: mailto:email@example.com</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={updateLink} 
              disabled={!currentLink?.platform || !currentLink?.url || !validateUrl(currentLink?.url)}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Link Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le lien vers
              {currentLink?.platform}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLink} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}