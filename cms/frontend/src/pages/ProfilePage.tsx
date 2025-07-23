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
import ProfileService, { Profile, SocialLinks } from '@/services/ProfileService';
import { useApi } from '@/hooks/useApi';

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
  const [isLoading, setIsLoading] = useState(true);
  const { put } = useApi();
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      email: '',
      description: '',
      phone: '',
      location: '',
      linkedin: '',
      dribbble: '',
      behance: '',
      medium: ''
    }
  });
  
  // Charger les données du profil au chargement de la page
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await ProfileService.getProfile();
        
        // Mettre à jour le formulaire avec les données du profil
        form.reset({
          name: profile.name,
          title: profile.title,
          email: profile.email,
          description: profile.description,
          phone: profile.phone || '',
          location: profile.location || '',
          // Note: Dans un cas réel, ces données viendraient d'un champ socialLinks dans le profil
          linkedin: '',
          dribbble: '',
          behance: '',
          medium: ''
        });
        
        // Mettre à jour l'image de profil
        if (profile.photo) {
          setProfileImage(profile.photo);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erreur lors du chargement du profil');
        
        // Utiliser des données par défaut en cas d'erreur
        form.reset({
          name: 'Victor Berbel',
          title: 'Product Designer & Manager',
          email: 'hey@victorberbel.work',
          description: "Hey, I'm Victor, an Independent Product Designer delivering top-tier Websites, SaaS, Mobile experiences, and good vibes for almost two decades.",
          phone: '',
          location: 'Paris, France',
          linkedin: '',
          dribbble: '',
          behance: '',
          medium: ''
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [form]);

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

  const handleSave = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Envoyer les données du profil à l'API
      await ProfileService.updateProfile({
        name: data.name,
        title: data.title,
        email: data.email,
        description: data.description,
        phone: data.phone,
        location: data.location
      });
      
      // Mettre à jour les liens sociaux
      await ProfileService.updateSocialLinks({
        linkedin: data.linkedin,
        dribbble: data.dribbble,
        behance: data.behance,
        medium: data.medium
      });
      
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
      setAutoSaveStatus('idle');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
      setAutoSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Envoyer la photo à l'API
      const response = await ProfileService.updateProfilePhoto(file);
      
      // Mettre à jour l'image de profil
      if (response.profile.photo) {
        setProfileImage(response.profile.photo);
      }
      
      toast.success('Photo de profil mise à jour !');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    }
  };

  const handleImageRemove = async () => {
    try {
      // Supprimer la photo via l'API
      await ProfileService.deleteProfilePhoto();
      
      // Réinitialiser l'image de profil
      setProfileImage('');
      
      toast.success('Photo de profil supprimée !');
    } catch (error) {
      console.error('Error removing profile photo:', error);
      toast.error('Erreur lors de la suppression de la photo de profil');
    }
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
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Chargement du profil...</span>
        </div>
      ) : (
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
                        onChange={(file) => handleImageUpload(file as File)}
                        onRemove={handleImageRemove}
                        placeholder="Glissez votre photo ici ou cliquez pour parcourir"
                        directUpload={true}
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
                  <form onSubmit={form.handleSubmit((data) => handleSave(data))} className="space-y-4">
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
      )}
    </div>
  );
}