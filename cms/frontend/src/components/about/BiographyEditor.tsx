import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface BiographyEditorProps {
  initialBiography: string;
  onSave: (biography: string) => Promise<void>;
}

export default function BiographyEditor({ initialBiography, onSave }: BiographyEditorProps) {
  const [biography, setBiography] = useState(initialBiography);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const notificationSystem = useNotificationSystem();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(biography);
      setIsEditing(false);
      notificationSystem.success('Biographie mise à jour', 'Votre biographie a été enregistrée avec succès.');
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder la biographie.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Biographie</CardTitle>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              <span>Modifier</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            disabled={isSaving}
          />
        ) : (
          <div className="prose max-w-none">
            {biography.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}