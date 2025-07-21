import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface ServicesPreviewProps {
  services: Service[];
  processSteps: ProcessStep[];
  skills: Skill[];
}

export function ServicesPreview({ services, processSteps, skills }: ServicesPreviewProps) {
  const sortedServices = [...services].sort((a, b) => a.order - b.order);
  const sortedSteps = [...processSteps].sort((a, b) => a.order - b.order);
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-100 text-blue-800';
      case 'backend': return 'bg-green-100 text-green-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'devops': return 'bg-orange-100 text-orange-800';
      case 'mobile': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const options = [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
      { value: 'devops', label: 'DevOps' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'other', label: 'Autre' },
    ];
    const option = options.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="process">Processus</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      {/* Placeholder for icon */}
                      <div className="h-12 w-12 flex items-center justify-center text-2xl">
                        {service.icon === 'Code' && '💻'}
                        {service.icon === 'Edit' && '🎨'}
                        {service.icon === 'Chat' && '💬'}
                        {service.icon === 'Home' && '🏠'}
                        {service.icon === 'Send' && '📤'}
                        {service.icon === 'Document' && '📄'}
                        {service.icon === 'Graph' && '📊'}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <div className="prose-sm" dangerouslySetInnerHTML={{ __html: service.description }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="process">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedSteps.map((step) => (
                <Card key={step.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center">
                        {/* Placeholder for icon */}
                        <div className="text-xl">
                          {step.icon === 'Search' && '🔍'}
                          {step.icon === 'Edit' && '✏️'}
                          {step.icon === 'Code' && '💻'}
                          {step.icon === 'Send' && '📤'}
                          {step.icon === 'Chat' && '💬'}
                          {step.icon === 'Document' && '📄'}
                          {step.icon === 'Graph' && '📊'}
                          {step.icon === 'Home' && '🏠'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-200 text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                          {step.order}
                        </span>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <div className="prose-sm" dangerouslySetInnerHTML={{ __html: step.description }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                  <div className="flex justify-between relative">
                    {sortedSteps.map((step) => (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className="bg-white p-1 rounded-full z-10">
                          <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-medium">
                            {step.order}
                          </div>
                        </div>
                        <div className="text-xs font-medium mt-1">{step.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="skills">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedSkills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{skill.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(skill.category)}`}>
                        {getCategoryLabel(skill.category)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs font-medium">{skill.level}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}