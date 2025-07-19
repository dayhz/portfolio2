import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Document, Edit, Plus, Award } from 'react-iconly';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">À Propos</h1>
          <p className="text-gray-600 mt-2">
            Gérez votre biographie, statistiques et récompenses
          </p>
        </div>
      </div>

      {/* Biography */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Biographie</CardTitle>
            <Button variant="outline">
              <Edit size="small" primaryColor="#6b7280" />
              <span className="ml-2">Modifier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            defaultValue="I started my professional career at 18 and lost count of how many designs I've created for clients or just for fun.

Being a designer for 17+ years has given me extensive experience working on all sorts of projects, from big corporations to small startups, collaborating with clients, design teams, and development squads.

For the last 7 years, I've been a full-time independent product designer, working with clients from all around the globe. I've also given tons of mentoring sessions to design students.

I love video games, movies, pizza and pasta."
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statistiques</CardTitle>
            <Button variant="outline">
              <Edit size="small" primaryColor="#6b7280" />
              <span className="ml-2">Modifier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Années d'expérience</label>
              <Input defaultValue="17+" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Âge</label>
              <Input defaultValue="35" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sessions de mentorat</label>
              <Input defaultValue="400+" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Burgers dévorés</label>
              <Input defaultValue="80+" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pays visités</label>
              <Input defaultValue="4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Awards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Récompenses & Reconnaissances</CardTitle>
            <Button>
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Ajouter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Awwwards', description: 'Honors — Jun 4th', link: 'https://www.awwwards.com/sites/victor-berbel-portfolio-2025' },
              { name: 'CSS Website Awards', description: 'Website of the day — Jun 1st', link: 'https://www.cssdesignawards.com/sites/victor-berbel-portfolio-2025/47530/' },
              { name: 'Vice Website Awards', description: 'Website of the day — Jun 23rd', link: 'https://www.website-award.com/sotd/victor-berbel-portfolio-2025' },
              { name: '68Design', description: 'Featured in the gallery — May 25th', link: 'https://www.68design.net/cool/?p=3' }
            ].map((award, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award size="medium" primaryColor="#f59e0b" />
                  <div>
                    <h3 className="font-medium text-gray-900">{award.name}</h3>
                    <p className="text-sm text-gray-600">{award.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit size="small" primaryColor="#6b7280" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Visiter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Photos Personnelles</CardTitle>
            <Button>
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Ajouter Photo</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Document size="large" primaryColor="#9ca3af" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Galerie de photos personnelles
            </h3>
            <p className="mt-2 text-gray-600">
              Ajoutez des photos personnelles pour le carousel de la page À Propos.
            </p>
            <Button className="mt-4">
              <Plus size="small" primaryColor="#ffffff" />
              <span className="ml-2">Ajouter vos premières photos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}