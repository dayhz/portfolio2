import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Home, Code, Pencil, MessageCircle, Send, FileText, BarChart, Eye } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface ServiceEditorProps {
  services?: Service[];
  onUpdate?: (services: Service[]) => void;
}

const iconOptions = [
  { value: 'Home', label: 'Maison', icon: <Home size={20} /> },
  { value: 'Code', label: 'Code', icon: <Code size={20} /> },
  { value: 'Edit', label: 'Design', icon: <Pencil size={20} /> },
  { value: 'Chat', label: 'Chat', icon: <MessageCircle size={20} /> },
  { value: 'Send', label: 'Envoi', icon: <Send size={20} /> },
  { value: 'Document', label: 'Document', icon: <FileText size={20} /> },
  { value: 'Graph', label: 'Graphique', icon: <BarChart size={20} /> },
];

const defaultServices: Service[] = [
  {
    id: '1',
    title: 'Développement Web',
    description: 'Création de sites web modernes et responsives avec les dernières technologies.',
    icon: 'Code',
    order: 1
  },
  {
    id: '2',
    title: 'Design UI/UX',
    description: 'Conception d\'interfaces utilisateur intuitives et expériences utilisateur optimales.',
    icon: 'Edit',
    order: 2
  },
  {
    id: '3',
    title: 'Consultation',
    description: 'Conseils stratégiques pour optimiser votre présence numérique et vos processus.',
    icon: 'Chat',
    order: 3
  }
];

const ServiceEditor: React.FC<ServiceEditorProps> = ({ services: propServices, onUpdate }) => {
  const [services, setServices] = useState<Service[]>(propServices || defaultServices);
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const notificationSystem = useNotificationSystem();
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setServices(updatedItems);
    onUpdate?.(updatedItems);
    
    if (result.source.index !== result.destination.index) {
      notificationSystem.info('Ordre modifié', 'L\'ordre des services a été mis à jour.');
    }
  };

  const handleChange = (id: string, field: keyof Service, value: string) => {
    const updatedServices = services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    );
    setServices(updatedServices);
    if (onUpdate) {
      onUpdate(updatedServices);
    }
  };

  const handlePreviewClick = (service: Service) => {
    setPreviewService(service);
    setIsPreviewOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(option => option.value === iconName);
    return icon ? icon.icon : <Home size={20} />;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Faites glisser les services pour changer leur ordre d'affichage. Vous pouvez modifier le titre, la description et l'icône de chaque service.
      </p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="services">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {services.map((service, index) => (
                <Draggable key={service.id} draggableId={service.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border border-dashed"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-3 cursor-move text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical size={20} />
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`title-${service.id}`}>Titre</Label>
                                <Input
                                  id={`title-${service.id}`}
                                  value={service.title}
                                  onChange={(e) => handleChange(service.id, 'title', e.target.value)}
                                  placeholder="Titre du service"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`icon-${service.id}`}>Icône</Label>
                                <Select
                                  value={service.icon}
                                  onValueChange={(value) => handleChange(service.id, 'icon', value)}
                                >
                                  <SelectTrigger id={`icon-${service.id}`} className="w-full">
                                    <SelectValue placeholder="Sélectionner une icône" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {iconOptions.map((icon) => (
                                      <SelectItem key={icon.value} value={icon.value}>
                                        <div className="flex items-center">
                                          <span className="mr-2">{icon.icon}</span>
                                          {icon.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor={`description-${service.id}`}>Description</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handlePreviewClick(service)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Aperçu
                                </Button>
                              </div>
                              <RichTextEditor
                                content={service.description}
                                onChange={(content) => handleChange(service.id, 'description', content)}
                                placeholder="Description du service"
                                minHeight="120px"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-col items-center space-y-2">
                            <div className="p-2 bg-gray-100 rounded-md">
                              {getIconComponent(service.icon)}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                              Service {service.order}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="pt-4">
        <p className="text-sm text-muted-foreground italic">
          Note: Vous êtes limité à 3 services pour maintenir une présentation claire et concise sur votre portfolio.
        </p>
      </div>

      {/* Dialogue de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Aperçu du service</DialogTitle>
          </DialogHeader>
          {previewService && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  {getIconComponent(previewService.icon)}
                </div>
                <h3 className="text-xl font-semibold">{previewService.title}</h3>
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewService.description }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceEditor;