import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface ScopeSelectorProps {
  selectedScopes: string[];
  onChange: (scopes: string[]) => void;
}

// Scopes prédéfinis basés sur le template original
const PREDEFINED_SCOPES = [
  'Concept',
  'UI/UX',
  'Digital Design',
  'Icon Design',
  'Motion Prototype',
  'Branding',
  'Web Development',
  'Mobile App',
  'Responsive Design',
  'User Research',
  'Wireframing',
  'Prototyping',
  'Visual Design',
  'Interaction Design',
  'Frontend Development',
  'Backend Development',
  'Full Stack',
  'E-commerce',
  'CMS',
  'API Integration',
  'Database Design',
  'SEO Optimization',
  'Performance Optimization',
  'Accessibility',
  'Testing',
  'Deployment'
];

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({ 
  selectedScopes, 
  onChange 
}) => {
  const [customScope, setCustomScope] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      onChange(selectedScopes.filter(s => s !== scope));
    } else {
      onChange([...selectedScopes, scope]);
    }
  };

  const addCustomScope = () => {
    if (customScope.trim() && !selectedScopes.includes(customScope.trim())) {
      onChange([...selectedScopes, customScope.trim()]);
      setCustomScope('');
      setShowCustomInput(false);
    }
  };

  const removeScope = (scope: string) => {
    onChange(selectedScopes.filter(s => s !== scope));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomScope();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Scopes */}
      {selectedScopes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Scopes sélectionnés</label>
          <div className="flex flex-wrap gap-2">
            {selectedScopes.map((scope) => (
              <Badge 
                key={scope} 
                variant="default" 
                className="flex items-center gap-1 px-3 py-1"
              >
                {scope}
                <button
                  type="button"
                  onClick={() => removeScope(scope)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Scopes */}
      <div>
        <label className="block text-sm font-medium mb-2">Scopes disponibles</label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50">
          {PREDEFINED_SCOPES.map((scope) => {
            const isSelected = selectedScopes.includes(scope);
            return (
              <Badge
                key={scope}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => toggleScope(scope)}
              >
                {scope}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Custom Scope Input */}
      <div>
        {showCustomInput ? (
          <div className="flex gap-2">
            <Input
              value={customScope}
              onChange={(e) => setCustomScope(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajouter un scope personnalisé..."
              className="flex-1"
              autoFocus
            />
            <Button 
              type="button"
              onClick={addCustomScope}
              disabled={!customScope.trim()}
              size="sm"
            >
              Ajouter
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setCustomScope('');
              }}
              size="sm"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un scope personnalisé
          </Button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Cliquez sur les badges pour les sélectionner/désélectionner. 
        Vous pouvez aussi ajouter des scopes personnalisés.
      </p>
    </div>
  );
};