import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Delete } from 'react-iconly';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onToggleSelectionMode: () => void;
  isSelectionMode: boolean;
  bulkOperationInProgress: boolean;
}

export default function BulkOperationsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onToggleSelectionMode,
  isSelectionMode,
  bulkOperationInProgress
}: BulkOperationsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
      {/* Section gauche - Boutons de sélection */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={isSelectionMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleSelectionMode}
          className="flex items-center gap-2"
        >
          {isSelectionMode ? (
            <>
              ✓ Annuler sélection
            </>
          ) : (
            <>
              ☐ Sélectionner
            </>
          )}
        </Button>
        
        {isSelectionMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={selectedCount === totalCount}
              className="flex items-center gap-2"
            >
              ☑ Tout sélectionner
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              ☐ Tout désélectionner
            </Button>
          </>
        )}
      </div>
      
      {/* Section droite - Compteur et actions */}
      {isSelectionMode && (
        <div className="flex items-center gap-3">
          {/* Compteur de médias sélectionnés */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} / {totalCount}
            </Badge>
            <span className="text-sm text-gray-600">
              {selectedCount === 0 
                ? 'Aucun média sélectionné'
                : selectedCount === 1 
                  ? '1 média sélectionné'
                  : `${selectedCount} médias sélectionnés`
              }
            </span>
          </div>
          
          {/* Bouton de suppression */}
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              disabled={bulkOperationInProgress}
              onClick={onBulkDelete}
              className="flex items-center gap-2"
            >
              <Delete size="small" primaryColor="#ffffff" />
              <span>
                {bulkOperationInProgress 
                  ? 'Suppression...' 
                  : `Supprimer la sélection (${selectedCount})`
                }
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}