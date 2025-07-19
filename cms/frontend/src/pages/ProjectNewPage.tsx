import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Upload, ArrowLeft } from 'react-iconly';


// Validation schema pour l'étape 1
const projectStep1Schema = z.object({
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
  testimonialQuote: z.string().optional(),
  testimonialClientName: z.string().optional(),
  testimonialClientRole: z.string().optional(),
});

type ProjectStep1Data = z.infer<typeof projectStep1Schema>;

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

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');

  const form = useForm<ProjectStep1Data>({
    resolver: zodResolver(projectStep1Schema),
    defaultValues: {
      title: '',
      subtitle: '',
      category: 'website',
      status: 'draft',
      client: '',
      year: new Date().getFullYear(),
      duration: '',
      industry: '',
      scope: [],
      projectUrl: '',
      challenge: '',
      approach: '',
      testimonialQuote: '',
      testimonialClientName: '',
      testimonialClientRole: '',
    },
  });

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

  const handleScopeToggle = (scopeItem: string) => {
    const currentScope = form.getValues('scope');
    if (currentScope.includes(scopeItem)) {
      form.setValue('scope', currentScope.filter(item => item !== scopeItem));
    } else {
      form.setValue('scope', [...currentScope, scopeItem]);
    }
  };

  const handleNext = (data: ProjectStep1Data) => {
    // Reconstruire l'objet testimonial s'il y a des données
    const testimonial = (data.testimonialQuote || data.testimonialClientName || data.testimonialClientRole) ? {
      quote: data.testimonialQuote || '',
      clientName: data.testimonialClientName || '',
      clientRole: data.testimonialClientRole || '',
    } : undefined;

    // Sauvegarder les données dans le localStorage pour les récupérer dans la page suivante
    const projectData = {
      ...data,
      testimonial,
      heroImageFile: heroImageFile ? {
        name: heroImageFile.name,
        type: heroImageFile.type,
        size: heroImageFile.size,
        // On ne peut pas sérialiser le File, on garde juste les métadonnées
      } : null,
      heroImagePreview,
    };
    
    localStorage.setItem('projectDraft', JSON.stringify(projectData));
    
    // Naviguer vers la page de contenu
    navigate('/projects/new/content');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size="small" />
          <span>Retour aux projets</span>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau projet</h1>
        <p className="text-gray-600 mt-2">Étape 1/2 - Informations de base</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
          
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

          {/* Section: Témoignage client (optionnel) */}
          <Card>
            <CardHeader>
              <CardTitle>Témoignage client (optionnel)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="testimonialQuote"
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
                  name="testimonialClientName"
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
                  name="testimonialClientRole"
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Annuler
            </Button>
            <Button type="submit">
              Suivant - Contenu →
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}