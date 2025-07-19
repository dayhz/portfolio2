import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'react-iconly';
import { NotionEditor, EditorBlock } from './NotionEditor';

// Utilisation du type EditorBlock de NotionEditor
export type ContentBlock = EditorBlock;

// Types pour le projet complet
export interface AdvancedProject {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  category: 'website' | 'product' | 'mobile';
  status: 'draft' | 'published' | 'archived';
  
  // Informations de base
  client: string;
  year: number;
  duration: string;
  industry: string;
  scope: string[];
  projectUrl?: string;
  
  // Sections principales
  challenge: string;
  approach: string;
  
  // Contenu par blocs (comme Notion)
  contentBlocks: ContentBlock[];
  
  // Témoignage client (optionnel)
  testimonial?: {
    quote: string;
    clientName: string;
    clientRole: string;
    clientImage?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  subtitle: z.string().min(10, 'Le sous-titre doit contenir au moins 10 caractères').max(200, 'Le sous-titre ne peut pas dépasser 200 caractères'),
  category: z.enum(['website', 'product', 'mobile'], {
    required_error: 'Veuillez sélectionner une catégorie',
  }),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  client: z.string().min(1, 'Le nom du client est requis'),
  year: z.number().min(2000, 'L\'année doit être supérieure à 2000').max(new Date().getFullYear(), 'L\'année ne peut pas être dans le futur'),
  duration: z.string().min(1, 'La durée est requise'),
  industry: z.string().min(1, 'L\'industrie est requise'),
  scope: z.array(z.string()).min(1, 'Au moins un élément de scope est requis'),
  projectUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  challenge: z.string().min(10, 'Le challenge doit contenir au moins 10 caractères'),
  approach: z.string().min(10, 'L\'approche doit contenir au moins 10 caractères'),
  contentBlocks: z.array(z.object({
    id: z.string(),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'image', 'quote']),
    content: z.string(),
    imageFile: z.any().optional(),
  })),
  testimonial: z.object({
    quote: z.string(),
    clientName: z.string(),
    clientRole: z.string(),
  }).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormAdvancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: AdvancedProject;
  onSubmit: (data: ProjectFormData & { heroImageFile?: File; contentBlockFiles: { [key: string]: File } }) => Promise<void>;
}

const scopeOptions = [
  'UI/UX',
  'Wireframe',
  'Digital Design',
  'Icon Design',
  'Branding',
  'Prototyping',
  'User Research',
  'Frontend Development',
  'Backend Development',
  'Mobile Development'
];

export function ProjectFormAdvanced({ open, onOpenChange, project, onSubmit }: ProjectFormAdvancedProps) {
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>(project?.heroImage || '');
  const [contentBlockFiles, setContentBlockFiles] = useState<{ [key: string]: File }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      subtitle: project?.subtitle || '',
      category: project?.category || 'website',
      status: project?.status || 'draft',
      client: project?.client || '',
      year: project?.year || new Date().getFullYear(),
      duration: project?.duration || '',
      industry: project?.industry || '',
      scope: project?.scope || [],
      projectUrl: project?.projectUrl || '',
      challenge: project?.challenge || '',
      approach: project?.approach || '',
      contentBlocks: project?.contentBlocks || [],
      testimonial: project?.testimonial,
    },
  });

  // État pour les blocs de contenu
  const [contentBlocks, setContentBlocks] = useState<EditorBlock[]>(
    project?.contentBlocks || []
  );

  const handleHeroImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  // Mise à jour des blocs de contenu dans le formulaire
  const handleContentBlocksChange = (blocks: EditorBlock[]) => {
    setContentBlocks(blocks);
    form.setValue('contentBlocks', blocks);
  };

  const handleScopeToggle = (scopeItem: string) => {
    const currentScope = form.getValues('scope');
    if (currentScope.includes(scopeItem)) {
      form.setValue('scope', currentScope.filter(item => item !== scopeItem));
    } else {
      form.setValue('scope', [...currentScope, scopeItem]);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        ...data, 
        heroImageFile: heroImageFile || undefined,
        contentBlockFiles 
      });
      onOpenChange(false);
      form.reset();
      setHeroImageFile(null);
      setHeroImagePreview('');
      setContentBlockFiles({});
      setContentBlocks([]);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Modifiez les informations de votre projet portfolio.' 
              : 'Créez un nouveau projet pour votre portfolio avec tous les détails.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            {/* Section: Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du projet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: A growing community of authors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sous-titre *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description courte qui apparaîtra sous le titre principal"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image héro */}
                <div className="space-y-4">
                  <FormLabel>Image héro *</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label htmlFor="hero-image-upload" className="cursor-pointer">
                      {heroImagePreview ? (
                        <img
                          src={heroImagePreview}
                          alt="Aperçu image héro"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <>
                          <div className="mx-auto mb-2 text-gray-400">
                            <Upload size="large" />
                          </div>
                          <p className="text-sm text-gray-600">
                            Cliquez pour sélectionner l'image héro
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section: Détails du projet */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du client" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Année *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2024"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 2 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industrie *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Publishing" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du projet</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Scope avec badges */}
                <div className="space-y-3">
                  <FormLabel>Scope *</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {scopeOptions.map((scopeItem) => (
                      <Badge
                        key={scopeItem}
                        variant={form.watch('scope').includes(scopeItem) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleScopeToggle(scopeItem)}
                      >
                        {scopeItem}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Cliquez sur les badges pour sélectionner les éléments du scope
                  </FormDescription>
                </div>
              </CardContent>
            </Card>

            {/* Section: Challenge & Approach */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge & Approach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="challenge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez le défi ou problème à résoudre..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approach *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez l'approche utilisée pour résoudre le problème..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section: Contenu par blocs (comme Notion) */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu du projet</CardTitle>
                <p className="text-sm text-gray-600">
                  Tapez "/" dans une ligne vide pour ajouter des blocs (titre, paragraphe, image, citation)
                </p>
              </CardHeader>
              <CardContent>
                <NotionEditor
                  blocks={contentBlocks}
                  onChange={handleContentBlocksChange}
                />
              </CardContent>
            </Card>

            {/* Section: Témoignage client (optionnel) */}
            <Card>
              <CardHeader>
                <CardTitle>Témoignage client (optionnel)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="testimonial.quote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Citation</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Citation du client..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="testimonial.clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du client</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Chris Leippi" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testimonial.clientRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle du client</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Founder, Booksprout" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : (project ? 'Modifier' : 'Créer')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}