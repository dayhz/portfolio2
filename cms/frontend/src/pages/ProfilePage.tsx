import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Camera } from 'react-iconly';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schéma de validation avec Zod
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  phone: z.string().optional(),
  location: z.string().min(2, 'La localisation doit contenir au moins 2 caractères'),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  dribbble: z.string().url('URL Dribbble invalide').optional().or(z.literal('')),
  behance: z.string().url('URL Behance invalide').optional().or(z.literal('')),
  medium: z.string().url('URL Medium invalide').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Victor Berbel',
      title: 'Product Designer & Manager',
      email: 'hey@victorberbel.work',
      description: "Hey, I'm Victor, an Independent Product Designer delivering top-tier Websites, SaaS, Mobile experiences, and good vibes for almost two decades.",
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      linkedin: 'https://www.linkedin.com/in/victorberbel/',
      dribbble: 'https://dribbble.com/victorberbel',
      behance: 'https://www.behance.net/victorberbel',
      medium: 'https://medium.com/@victorberbel'
    }
  });

  // Sauvegarde automatique
  useEffect(() => {
    if (!isEditing) return;

    const subscription = form.watch(() => {
      if (form.formState.isValid) {
        setAutoSaveStatus('saving');
        
        // Simulation de sauvegarde automatique
        const timer = setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 1000);

        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulation d'une sauvegarde API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
      setAutoSaveStatus('idle');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      setAutoSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setProfileImage(url);
    toast.success('Photo de profil mise à jour !');
  };

  const handleImageRemove = () => {
    setProfileImage('');
    toast.success('Photo de profil supprimée !');
  };

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
            <div className="relative inline-block mb-4">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage 
                  src={profileImage} 
                  alt="Photo de profil"
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="text-2xl">
                  <User size="large" primaryColor="#9ca3af" />
                </AvatarFallback>
              </Avatar>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera size="small" primaryColor="#ffffff" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Changer la photo de profil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ImageUpload
                      value={profileImage}
                      onChange={handleImageUpload}
                      onRemove={handleImageRemove}
                      placeholder="Glissez votre photo ici ou cliquez pour parcourir"
                    />
                    <p className="text-sm text-gray-500 text-center">
                      JPG, PNG jusqu'à 2MB
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur l'icône pour changer votre photo
            </p>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Informations Personnelles
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      {autoSaveStatus === 'saving' && (
                        <Badge variant="secondary" className="text-xs">
                          💾 Sauvegarde...
                        </Badge>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          ✓ Sauvegardé
                        </Badge>
                      )}
                      {autoSaveStatus === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          ❌ Erreur
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit size="small" primaryColor="#6b7280" />
                  <span className="ml-2">{isEditing ? 'Annuler' : 'Modifier'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            disabled={!isEditing}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localisation</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving}>
                        💾 <span className="ml-2">
                          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </span>
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Liens Sociaux</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="https://www.linkedin.com/in/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dribbble"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dribbble</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="https://dribbble.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="behance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behance</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="https://www.behance.net/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medium</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="https://medium.com/@..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}