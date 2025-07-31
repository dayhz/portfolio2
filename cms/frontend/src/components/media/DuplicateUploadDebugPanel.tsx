/**
 * Debug panel component for monitoring duplicate upload events
 * Provides real-time debugging information and troubleshooting tools
 * Requirements: 1.4, 3.4
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { duplicateUploadDebugger, DuplicateUploadEvent, DuplicateUploadError, DuplicateUploadMetrics } from '@/services/DuplicateUploadDebugger';
import { toast } from 'sonner';

interface DuplicateUploadDebugPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function DuplicateUploadDebugPanel({ 
  isVisible = false, 
  onClose 
}: DuplicateUploadDebugPanelProps) {
  const [events, setEvents] = useState<DuplicateUploadEvent[]>([]);
  const [errors, setErrors] = useState<DuplicateUploadError[]>([]);
  const [metrics, setMetrics] = useState<DuplicateUploadMetrics | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DuplicateUploadEvent | null>(null);
  const [selectedError, setSelectedError] = useState<DuplicateUploadError | null>(null);

  // Refresh data
  const refreshData = () => {
    setEvents(duplicateUploadDebugger.getRecentEvents(100));
    setErrors(duplicateUploadDebugger.getRecentErrors(50));
    setMetrics(duplicateUploadDebugger.getMetrics());
  };

  // Auto-refresh effect
  useEffect(() => {
    if (isAutoRefresh && isVisible) {
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, isVisible]);

  // Initial data load
  useEffect(() => {
    if (isVisible) {
      refreshData();
    }
  }, [isVisible]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getEventBadgeVariant = (type: DuplicateUploadEvent['type']) => {
    switch (type) {
      case 'detection': return 'destructive';
      case 'error': return 'destructive';
      case 'dialog_open': return 'default';
      case 'dialog_close': return 'secondary';
      case 'action_taken': return 'default';
      case 'validation': return 'outline';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const getErrorBadgeVariant = (severity: DuplicateUploadError['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const exportDebugData = () => {
    const data = duplicateUploadDebugger.exportDebugData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duplicate-upload-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Données de débogage exportées');
  };

  const clearDebugData = () => {
    duplicateUploadDebugger.clearDebugData();
    refreshData();
    toast.success('Données de débogage effacées');
  };

  const simulateEvent = (type: 'duplicate' | 'error') => {
    const debugTools = (window as any).debugDuplicateUpload;
    if (debugTools) {
      if (type === 'duplicate') {
        debugTools.simulateDuplicate(`test-file-${Date.now()}.jpg`);
      } else {
        debugTools.forceError('unknown_error');
      }
      setTimeout(refreshData, 500);
      toast.success(`Événement ${type} simulé`);
    }
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>🔍 Panneau de débogage - Upload de doublons</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                {isAutoRefresh ? '⏸️ Pause' : '▶️ Auto'}
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData}>
                🔄 Actualiser
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="errors">Erreurs</TabsTrigger>
            <TabsTrigger value="tools">Outils</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Détections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalDetections}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Actions réussies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{metrics.successfulActions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Actions échouées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{metrics.failedActions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Taux d'erreur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 overflow-y-auto">
                  {events.slice(-10).reverse().map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventBadgeVariant(event.type)}>
                          {event.type}
                        </Badge>
                        <span className="text-sm">{formatTimestamp(event.timestamp)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        Détails
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Événements récents ({events.length})</h3>
              <div className="flex gap-2">
                {['detection', 'dialog_open', 'action_taken', 'validation'].map((type) => (
                  <Badge key={type} variant="outline">
                    {type}: {events.filter(e => e.type === type).length}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="h-96 overflow-y-auto">
              {events.reverse().map((event) => (
                <Card key={event.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventBadgeVariant(event.type)}>
                          {event.type}
                        </Badge>
                        <span className="text-sm font-mono">{formatTimestamp(event.timestamp)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        Voir détails
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {event.id}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Erreurs récentes ({errors.length})</h3>
              <div className="flex gap-2">
                {['critical', 'high', 'medium', 'low'].map((severity) => (
                  <Badge key={severity} variant="outline">
                    {severity}: {errors.filter(e => e.severity === severity).length}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="h-96 overflow-y-auto">
              {errors.reverse().map((error) => (
                <Card key={error.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getErrorBadgeVariant(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge variant="outline">{error.type}</Badge>
                        <span className="text-sm font-mono">{formatTimestamp(error.timestamp)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedError(error)}
                      >
                        Voir détails
                      </Button>
                    </div>
                    <div className="text-sm text-red-600 mb-1">
                      {error.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {error.id}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outils de test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => simulateEvent('duplicate')}>
                    🔄 Simuler doublon
                  </Button>
                  <Button onClick={() => simulateEvent('error')} variant="destructive">
                    ⚠️ Simuler erreur
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Ces boutons permettent de tester le système de débogage en simulant des événements.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Console de débogage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                  <div>// Outils disponibles dans la console :</div>
                  <div>window.debugDuplicateUpload.simulateDuplicate('test.jpg')</div>
                  <div>window.debugDuplicateUpload.forceError('render_error')</div>
                  <div>window.debugDuplicateUpload.getSummary()</div>
                  <div>window.debugDuplicateUpload.export()</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={exportDebugData}>
                    📥 Exporter les données
                  </Button>
                  <Button onClick={clearDebugData} variant="destructive">
                    🗑️ Effacer les données
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  L'export génère un fichier JSON avec tous les événements et erreurs pour analyse.
                  L'effacement supprime toutes les données de débogage stockées.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de l'événement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Type:</strong> {selectedEvent.type}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {selectedEvent.timestamp}
                  </div>
                  <div>
                    <strong>ID:</strong> {selectedEvent.id}
                  </div>
                  <div>
                    <strong>Session:</strong> {selectedEvent.sessionId}
                  </div>
                </div>
                <div>
                  <strong>Données:</strong>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Error Details Modal */}
        {selectedError && (
          <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de l'erreur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Type:</strong> {selectedError.type}
                  </div>
                  <div>
                    <strong>Sévérité:</strong> {selectedError.severity}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {selectedError.timestamp}
                  </div>
                  <div>
                    <strong>ID:</strong> {selectedError.id}
                  </div>
                </div>
                <div>
                  <strong>Message:</strong>
                  <div className="bg-red-50 p-3 rounded text-red-800">
                    {selectedError.message}
                  </div>
                </div>
                {selectedError.stack && (
                  <div>
                    <strong>Stack trace:</strong>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
                <div>
                  <strong>Contexte:</strong>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}