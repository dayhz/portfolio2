import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, Search, Filter } from 'react-iconly';
import { toast } from 'sonner';

// Mock data pour les médias
const mockMedia = [
  { id: 1, name: 'project-hero.jpg', type: 'image', size: '2.4MB', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', uploadedAt: '2024-01-15' },
  { id: 2, name: 'team-photo.png', type: 'image', size: '1.8MB', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', uploadedAt: '2024-01-14' },
  { id: 3, name: 'demo-video.mp4', type: 'video', size: '15.2MB', url: '', uploadedAt: '2024-01-13' },
  { id: 4, name: 'logo-design.svg', type: 'image', size: '0.5MB', url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', uploadedAt: '2024-01-12' },
];

export default function MediaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<typeof mockMedia[0] | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulation d'upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.success('Fichier uploadé avec succès !');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papiers');
  };

  const filteredMedia = mockMedia.filter(media =>
    media.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos images, vidéos et autres fichiers
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload size="small" primaryColor="#ffffff" />
              <span className="ml-2">Upload Fichiers</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload de fichiers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload size="large" primaryColor="#9ca3af" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Glissez vos fichiers ici
                </h3>
                <p className="mt-2 text-gray-600">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  PNG, JPG, WebP, MP4 jusqu'à 10MB
                </p>
                <Button className="mt-4" onClick={handleUpload}>
                  Sélectionner des fichiers
                </Button>
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Fichiers
            </CardTitle>
            <Image size="medium" primaryColor="#8b5cf6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockMedia.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois-ci
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Images
            </CardTitle>
            <Image size="medium" primaryColor="#3b82f6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockMedia.filter(m => m.type === 'image').length}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vidéos
            </CardTitle>
            <Image size="medium" primaryColor="#10b981" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockMedia.filter(m => m.type === 'video').length}
            </div>
            <p className="text-xs text-muted-foreground">
              MP4, WebM
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stockage
            </CardTitle>
            <Image size="medium" primaryColor="#f59e0b" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">19.9MB</div>
            <p className="text-xs text-muted-foreground">
              de 10GB utilisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Médiathèque</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search size="small" primaryColor="#6b7280" />
                </div>
                <Input
                  placeholder="Rechercher des fichiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter size="small" primaryColor="#6b7280" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredMedia.map((media) => (
              <div key={media.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  {media.type === 'image' && media.url ? (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => setSelectedMedia(media)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size="large" primaryColor="#9ca3af" />
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSelectedMedia(media)}
                    >
                      Voir
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleCopyUrl(media.url)}
                    >
                      📋
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium truncate">{media.name}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {media.type}
                    </Badge>
                    <span className="text-xs text-gray-500">{media.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMedia.type === 'image' && selectedMedia.url && (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Taille: {selectedMedia.size}</p>
                  <p className="text-sm text-gray-600">Uploadé le: {selectedMedia.uploadedAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCopyUrl(selectedMedia.url)}>
                    📋 <span className="ml-2">Copier l'URL</span>
                  </Button>
                  <Button>
                    💾 <span className="ml-2">Télécharger</span>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}