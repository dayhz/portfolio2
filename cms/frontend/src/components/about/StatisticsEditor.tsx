import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
// import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface Statistic {
  id: string;
  label: string;
  value: string;
}

interface StatisticsEditorProps {
  initialStatistics: Statistic[];
  onSave: (statistics: Statistic[]) => Promise<void>;
}

export default function StatisticsEditor({ initialStatistics, onSave }: StatisticsEditorProps) {
  const [statistics, setStatistics] = useState<Statistic[]>(initialStatistics);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
//   const notificationSystem = useNotificationSystem();

  const handleStatisticChange = (id: string, field: 'label' | 'value', newValue: string) => {
    setStatistics(
      statistics.map((stat) => (stat.id === id ? { ...stat, [field]: newValue } : stat))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(statistics);
      setIsEditing(false);
      notificationSystem.success('Statistiques mises à jour', 'Vos statistiques ont été enregistrées avec succès.');
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les statistiques.');
    } finally {
      setIsSaving(false);
    }
  };

  const addStatistic = () => {
    const newId = `stat-${Date.now()}`;
    setStatistics([...statistics, { id: newId, label: 'Nouvelle statistique', value: '0' }]);
  };

  const removeStatistic = (id: string) => {
    setStatistics(statistics.filter((stat) => stat.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Statistiques</CardTitle>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statistics.map((stat) => (
            <div key={stat.id} className="space-y-2">
              {isEditing ? (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Libellé</label>
                    {statistics.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-red-500"
                        onClick={() => removeStatistic(stat.id)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <Input
                    value={stat.label}
                    onChange={(e) => handleStatisticChange(stat.id, 'label', e.target.value)}
                    disabled={isSaving}
                  />
                  <label className="text-sm font-medium">Valeur</label>
                  <Input
                    value={stat.value}
                    onChange={(e) => handleStatisticChange(stat.id, 'value', e.target.value)}
                    disabled={isSaving}
                  />
                </>
              ) : (
                <>
                  <label className="text-sm font-medium">{stat.label}</label>
                  <div className="text-xl font-bold">{stat.value}</div>
                </>
              )}
            </div>
          ))}
          
          {isEditing && (
            <div className="flex items-center justify-center h-full">
              <Button variant="outline" onClick={addStatistic} className="w-full h-full min-h-[100px]" disabled={isSaving}>
                + Ajouter une statistique
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}