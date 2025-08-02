#!/usr/bin/env node

/**
 * Test de correction de la boucle infinie dans ApproachEditor
 * Vérifie que le composant ne cause plus de "Maximum update depth exceeded"
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test de correction de la boucle infinie - ApproachEditor');
console.log('===========================================================');

// Vérifier les corrections apportées
const approachEditorPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');

if (!fs.existsSync(approachEditorPath)) {
  console.log('❌ Fichier ApproachEditor.tsx non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(approachEditorPath, 'utf8');

console.log('1️⃣ Vérification des corrections appliquées...');

// Vérifier que onUnsavedChanges a été retiré des dépendances
const useEffectPattern = /useEffect\(\(\) => \{[\s\S]*?if \(onUnsavedChanges\)[\s\S]*?\}, \[hasUnsavedChanges\]\);/;
const hasCorrectUseEffect = useEffectPattern.test(content);

if (hasCorrectUseEffect) {
  console.log('✅ useEffect corrigé - onUnsavedChanges retiré des dépendances');
} else {
  console.log('❌ useEffect non corrigé - risque de boucle infinie');
}

// Vérifier que handleIconUpload n'a plus de dépendance problématique
const iconUploadPattern = /const handleIconUpload = useCallback\([\s\S]*?\}, \[\]\);/;
const hasCorrectIconUpload = iconUploadPattern.test(content);

if (hasCorrectIconUpload) {
  console.log('✅ handleIconUpload corrigé - dépendances vides');
} else {
  console.log('❌ handleIconUpload non corrigé - risque de re-render');
}

// Vérifier qu'il n'y a pas d'autres useEffect sans dépendances
const allUseEffects = content.match(/useEffect\([^}]+\}, \[[^\]]*\]\);/g) || [];
console.log(`📊 Nombre total de useEffect trouvés: ${allUseEffects.length}`);

allUseEffects.forEach((effect, index) => {
  console.log(`   ${index + 1}. ${effect.substring(0, 50)}...`);
});

console.log('\n2️⃣ Analyse des patterns problématiques...');

// Vérifier les patterns qui peuvent causer des boucles infinies
const problematicPatterns = [
  {
    name: 'useEffect sans dépendances',
    pattern: /useEffect\([^}]+\}\);/g,
    description: 'useEffect sans tableau de dépendances'
  },
  {
    name: 'setState dans useEffect sans condition',
    pattern: /useEffect\([^}]*set[A-Z][^}]*\}, \[[^\]]*\]\);/g,
    description: 'setState direct dans useEffect'
  }
];

let hasProblems = false;

problematicPatterns.forEach(({ name, pattern, description }) => {
  const matches = content.match(pattern) || [];
  if (matches.length > 0) {
    console.log(`⚠️  ${name}: ${matches.length} occurrence(s) trouvée(s)`);
    console.log(`   Description: ${description}`);
    hasProblems = true;
  } else {
    console.log(`✅ ${name}: Aucun problème détecté`);
  }
});

console.log('\n3️⃣ Recommandations...');

if (!hasProblems && hasCorrectUseEffect && hasCorrectIconUpload) {
  console.log('🎉 Toutes les corrections ont été appliquées avec succès !');
  console.log('📝 Le composant ApproachEditor devrait maintenant fonctionner sans boucle infinie.');
  console.log('\n📋 Actions recommandées:');
  console.log('   1. Redémarrer le serveur de développement');
  console.log('   2. Vider le cache du navigateur (Ctrl+Shift+R)');
  console.log('   3. Tester l\'édition de la section Approach');
  console.log('   4. Vérifier qu\'il n\'y a plus d\'erreur "Maximum update depth exceeded"');
} else {
  console.log('❌ Des problèmes subsistent dans le code');
  console.log('📝 Corrections nécessaires:');
  
  if (!hasCorrectUseEffect) {
    console.log('   - Corriger le useEffect pour onUnsavedChanges');
  }
  
  if (!hasCorrectIconUpload) {
    console.log('   - Corriger handleIconUpload pour éviter les dépendances circulaires');
  }
  
  if (hasProblems) {
    console.log('   - Résoudre les patterns problématiques identifiés');
  }
}

console.log('\n🔍 Test terminé !');
console.log('================');

process.exit(hasProblems || !hasCorrectUseEffect || !hasCorrectIconUpload ? 1 : 0);