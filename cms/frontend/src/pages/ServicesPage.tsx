import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'react-iconly';

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      name: 'Website',
      description: 'Clear and engaging websites that actually do their job, whether it\'s starting fresh or giving an old one a makeover.',
      color: '#3b82f6'
    },
    {
      id: 2,
      name: 'Product',
      description: 'Scalable and intuitive interfaces for B2B and B2C SaaS products that truly work. From user flows to design systems.',
      color: '#10b981'
    },
    {
      id: 3,
      name: 'Mobile',
      description: 'Seamless and fluid mobile experiences designed to fit how people use apps in the real world and actually loved by users.',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos services et votre processus de travail
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: service.color }}
                  />
                  {service.name}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit size="small" primaryColor="#6b7280" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                {service.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processus de Travail</CardTitle>
            <Button variant="outline">
              <Edit size="small" primaryColor="#6b7280" />
              <span className="ml-2">Modifier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Discovery', description: 'Learn about your project and understand the end goal' },
              { step: '2', title: 'Wireframe', description: 'Organize information and address UX problems' },
              { step: '3', title: 'Mood Board', description: 'Discuss design direction and visual preferences' },
              { step: '4', title: 'Design', description: 'Create the final UI using approved wireframe and mood board' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compétences</CardTitle>
            <Button variant="outline">
              <Edit size="small" primaryColor="#6b7280" />
              <span className="ml-2">Modifier</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'User Interface', 'Prototyping', 'User Research', 'User Journey',
              'Design System', 'Interface Animation', 'User Flow', 'UX Audit',
              'Icon Design', 'Creative & Art Direction', 'User Persona', 'Wireframe'
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}