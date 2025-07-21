import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface AboutPreviewProps {
  biography: string;
  statistics: Array<{ id: string; label: string; value: string }>;
  awards: Array<{ id: string; name: string; description: string; link: string }>;
  photos: Array<{ id: string; url: string; alt: string }>;
  socialLinks: Array<{ id: string; platform: string; url: string; icon: string }>;
}

export default function AboutPreview({
  biography,
  statistics,
  awards,
  photos,
  socialLinks,
}: AboutPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prévisualisation</CardTitle>
            <Button onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              <span>Prévisualiser</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Cliquez sur le bouton "Prévisualiser" pour voir à quoi ressemblera votre page À Propos avec les modifications actuelles.
          </p>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation de la page À Propos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            {/* Biography Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Biographie</h2>
              <div className="prose max-w-none">
                {biography.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Statistics Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Statistiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statistics.map((stat) => (
                  <div key={stat.id} className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Section */}
            {photos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Photos</h2>
                <div className="relative h-[300px] border rounded-lg overflow-hidden">
                  {photos.length > 0 && (
                    <img
                      src={photos[currentPhotoIndex].url}
                      alt={photos[currentPhotoIndex].alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {photos.length > 1 && (
                    <div className="absolute inset-0 flex justify-between items-center">
                      <Button variant="outline" className="ml-2" onClick={prevPhoto}>
                        &lt;
                      </Button>
                      <Button variant="outline" className="mr-2" onClick={nextPhoto}>
                        &gt;
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {awards.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Récompenses & Reconnaissances</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {awards.map((award) => (
                    <div key={award.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h3 className="font-medium">{award.name}</h3>
                          <p className="text-sm text-gray-600">{award.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Liens Sociaux</h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
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
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}