import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Edit, Camera } from 'react-iconly';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Photo de Profil</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size="large" primaryColor="#9ca3af" />
              </div>
              <Button
                size="sm"
                className="absolute bottom-4 right-0 rounded-full w-8 h-8 p-0"
              >
                <Camera size="small" primaryColor="#ffffff" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              JPG, PNG jusqu'à 2MB
            </p>
            <Button variant="outline" className="w-full">
              <Camera size="small" primaryColor="#6b7280" />
              <span className="ml-2">Changer la photo</span>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations Personnelles</CardTitle>
                <Button variant="outline">
                  <Edit size="small" primaryColor="#6b7280" />
                  <span className="ml-2">Modifier</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input defaultValue="Victor Berbel" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input defaultValue="Product Designer & Manager" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="hey@victorberbel.work" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  defaultValue="Hey, I'm Victor, an Independent Product Designer delivering top-tier Websites, SaaS, Mobile experiences, and good vibes for almost two decades."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input placeholder="+33 6 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Localisation</label>
                  <Input defaultValue="Paris, France" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liens Sociaux</CardTitle>
                <Button variant="outline">
                  <Edit size="small" primaryColor="#6b7280" />
                  <span className="ml-2">Modifier</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn</label>
                <Input defaultValue="https://www.linkedin.com/in/victorberbel/" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dribbble</label>
                <Input defaultValue="https://dribbble.com/victorberbel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Behance</label>
                <Input defaultValue="https://www.behance.net/victorberbel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium</label>
                <Input defaultValue="https://medium.com/@victorberbel" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          Sauvegarder les modifications
        </Button>
      </div>
    </div>
  );
}