import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Home, Code, Pencil, MessageCircle, Send, Search, FileText, BarChart, Eye } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface ProcessStepsEditorProps {
  steps: ProcessStep[];
  onUpdate: (steps: ProcessStep[]) => void;
}

const iconOptions = [
  { value: 'Search', label: 'Découverte', icon: <Search size={18} /> },
  { value: 'Edit', label: 'Design', icon: <Pencil size={18} /> },
  { value: 'Code', label: 'Code', icon: <Code size={18} /> },
  { value: 'Send', label: 'Envoi', icon: <Send size={18} /> },
  { value: 'Chat', label: 'Discussion', icon: <MessageCircle size={18} /> },
  { value: 'Document', label: 'Document', icon: <FileText size={18} /> },
  { value: 'Graph', label: 'Graphique', icon: <BarChart size={18} /> },
  { value: 'Home', label: 'Maison', icon: <Home size={18} /> },
];

const ProcessStepsEditor: React.FC<ProcessStepsEditorProps> = ({ steps, onUpdate }) => {
  const [previewStep, setPreviewStep] = useState<ProcessStep | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const notificationSystem = useNotificationSystem();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    onUpdate(updatedItems);
    
    if (result.source.index !== result.destination.index) {
      notificationSystem.info('Ordre modifié', 'L\'ordre des étapes a été mis à jour.');
    }
  };

  const handleChange = (id: string, field: keyof ProcessStep, value: string) => {
    const updatedSteps = steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    );
    onUpdate(updatedSteps);
  };

  const handlePreviewClick = (step: ProcessStep) => {
    setPreviewStep(step);
    setIsPreviewOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(option => option.value === iconName);
    return icon ? icon.icon : <Search size={18} />;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Décrivez votre processus de travail en 4 étapes. Vous pouvez modifier l'ordre, le titre, la description et l'icône de chaque étape.
      </p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="process-steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
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
                                <Label htmlFor={`title-${step.id}`}>Titre</Label>
                                <Input
                                  id={`title-${step.id}`}
                                  value={step.title}
                                  onChange={(e) => handleChange(step.id, 'title', e.target.value)}
                                  placeholder="Titre de l'étape"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`icon-${step.id}`}>Icône</Label>
                                <Select
                                  value={step.icon}
                                  onValueChange={(value) => handleChange(step.id, 'icon', value)}
                                >
                                  <SelectTrigger id={`icon-${step.id}`} className="w-full">
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
                                <Label htmlFor={`description-${step.id}`}>Description</Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handlePreviewClick(step)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Aperçu
                                </Button>
                              </div>
                              <RichTextEditor
                                content={step.description}
                                onChange={(content) => handleChange(step.id, 'description', content)}
                                placeholder="Description de l'étape"
                                minHeight="100px"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-col items-center space-y-2">
                            <div className="p-2 bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                              {getIconComponent(step.icon)}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                              Étape {step.order}
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
          Note: Vous êtes limité à 4 étapes pour maintenir un processus clair et facile à comprendre pour vos clients.
        </p>
      </div>

      {/* Dialogue de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Aperçu de l'étape</DialogTitle>
          </DialogHeader>
          {previewStep && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center">
                  {getIconComponent(previewStep.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{previewStep.title}</h3>
                  <p className="text-sm text-gray-500">Étape {previewStep.order}</p>
                </div>
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewStep.description }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessStepsEditor;