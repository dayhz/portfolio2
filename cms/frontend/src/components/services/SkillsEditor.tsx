import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface SkillsEditorProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
}

const categoryOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Autre' },
];

const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onUpdate }) => {
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'frontend',
    level: 75
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const notificationSystem = useNotificationSystem();

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      notificationSystem.warning('Champ requis', 'Veuillez saisir un nom pour la compétence.');
      return;
    }
    
    const id = `skill-${Date.now()}`;
    const updatedSkills = [...skills, { ...newSkill, id }];
    onUpdate(updatedSkills);
    
    notificationSystem.success('Compétence ajoutée', `La compétence "${newSkill.name}" a été ajoutée avec succès.`);
    
    // Reset form
    setNewSkill({
      name: '',
      category: 'frontend',
      level: 75
    });
  };

  const handleDeleteSkill = (id: string) => {
    const skillToDelete = skills.find(skill => skill.id === id);
    const updatedSkills = skills.filter(skill => skill.id !== id);
    onUpdate(updatedSkills);
    
    if (skillToDelete) {
      notificationSystem.info('Compétence supprimée', `La compétence "${skillToDelete.name}" a été supprimée.`);
    }
  };

  const handleUpdateSkill = (id: string, field: keyof Skill, value: string | number) => {
    const updatedSkills = skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    onUpdate(updatedSkills);
  };

  const filteredSkills = selectedCategory 
    ? skills.filter(skill => skill.category === selectedCategory)
    : skills;

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
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ajouter une compétence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Nom</Label>
            <Input
              id="skill-name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="ex: React, Figma, Node.js"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skill-category">Catégorie</Label>
            <Select
              value={newSkill.category}
              onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
            >
              <SelectTrigger id="skill-category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skill-level">Niveau ({newSkill.level}%)</Label>
            <Slider
              id="skill-level"
              value={[newSkill.level]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => setNewSkill({ ...newSkill, level: value[0] })}
              className="py-4"
            />
          </div>
        </div>
        
        <Button onClick={handleAddSkill} className="mt-2">
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Mes compétences ({skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Toutes
            </Badge>
            {categoryOptions.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{skill.name}</h4>
                    <Badge className={getCategoryColor(skill.category)}>
                      {getCategoryLabel(skill.category)}
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette compétence ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la compétence "{skill.name}" ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Niveau</span>
                    <span className="font-medium">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <Slider
                    value={[skill.level]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleUpdateSkill(skill.id, 'level', value[0])}
                    className="py-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredSkills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {selectedCategory ? (
              <p>Aucune compétence dans cette catégorie. Ajoutez-en une !</p>
            ) : (
              <p>Aucune compétence ajoutée. Commencez par en ajouter une !</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsEditor;