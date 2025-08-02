#!/usr/bin/env node

/**
 * Correction simple et calme de l'ApproachEditor
 * Suppression de tous les éléments qui peuvent causer des boucles infinies
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction simple ApproachEditor');
console.log('===================================');

const filePath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');

if (!fs.existsSync(filePath)) {
  console.log('❌ Fichier non trouvé');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

console.log('1️⃣ Suppression des useEffect problématiques...');

// Remplacer le useEffect onUnsavedChanges par une version plus sûre
const problematicUseEffect = /\/\/ Notify parent about unsaved changes[\s\S]*?useEffect\(\(\) => \{[\s\S]*?\}, \[hasUnsavedChanges\]\);/;

const safeUseEffect = `// Notify parent about unsaved changes - safe version
  const notifyUnsavedChanges = useCallback(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    notifyUnsavedChanges();
  }, [notifyUnsavedChanges]);`;

content = content.replace(problematicUseEffect, safeUseEffect);

console.log('✅ useEffect remplacé par une version sûre');

console.log('2️⃣ Sauvegarde...');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fichier sauvegardé');
console.log('🎯 Correction terminée calmement');