import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload, Plus } from 'react-iconly';

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Médias</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos images, vidéos et autres fichiers
          </p>
        </div>
        <Button>
          <Upload size="small" primaryColor="#ffffff" />
          <span className="ml-2">Upload Fichiers</span>
        </Button>
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
            <div className="text-2xl font-bold text-gray-900">156</div>
            <p className="text-xs text-muted-foreground">
              +12 ce mois-ci
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
            <div className="text-2xl font-bold text-gray-900">142</div>
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
            <div className="text-2xl font-bold text-gray-900">14</div>
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
            <div className="text-2xl font-bold text-gray-900">2.4GB</div>
            <p className="text-xs text-muted-foreground">
              de 10GB utilisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Zone d'Upload</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Button className="mt-4">
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Sélectionner des fichiers</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Médiathèque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Image size="large" primaryColor="#9ca3af" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Médiathèque vide
            </h3>
            <p className="mt-2 text-gray-600">
              Commencez par uploader vos premiers fichiers.
            </p>
            <Button className="mt-4">
              <Upload size="small" primaryColor="#ffffff" />
              <span className="ml-2">Upload vos premiers fichiers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}