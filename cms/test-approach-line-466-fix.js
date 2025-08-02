#!/usr/bin/env node

/**
 * Test de correction ligne 466 - ApproachEditor
 * Vérifie que la boucle infinie causée par notifyUnsavedChanges est résolue
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test de correction ligne 466 - ApproachEditor');
console.log('================================================');

const approachEditorPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');

if (!fs.existsSync(approachEditorPath)) {
  console.log('❌ Fichier ApproachEditor.tsx non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(approachEditorPath, 'utf8');

console.log('1️⃣ Vérification de la correction...');

// Vérifier que notifyUnsavedChanges n'existe plus
const hasNotifyCallback = /const notifyUnsavedChanges = useCallback/.test(content);
if (hasNotifyCallback) {
  console.log('❌ notifyUnsavedChanges useCallback encore présent');
} else {
  console.log('✅ notifyUnsavedChanges useCallback supprimé');
}

// Vérifier que le useEffect direct est présent
const hasDirectUseEffect = /useEffect\(\(\) => \{[\s\S]*?if \(onUnsavedChanges\)[\s\S]*?\}, \[hasUnsavedChanges\]\);/.test(content);
if (hasDirectUseEffect) {
  console.log('✅ useEffect direct pour onUnsavedChanges présent');
} else {
  console.log('❌ useEffect direct pour onUnsavedChanges manquant');
}

// Vérifier qu'il n'y a pas de useEffect avec notifyUnsavedChanges
const hasNotifyUseEffect = /useEffect\([^}]*notifyUnsavedChanges/.test(content);
if (hasNotifyUseEffect) {
  console.log('❌ useEffect avec notifyUnsavedChanges encore présent');
} else {
  console.log('✅ useEffect avec notifyUnsavedChanges supprimé');
}

console.log('\n2️⃣ Analyse des useEffect...');

const useEffects = content.match(/useEffect\([^}]+\}, \[[^\]]*\]\);/g) || [];
console.log(`📊 Nombre total de useEffect: ${useEffects.length}`);

let hasProblematicEffect = false;

useEffects.forEach((effect, index) => {
  console.log(`\n   useEffect ${index + 1}:`);
  
  // Vérifier les patterns problématiques
  if (/notifyUnsavedChanges/.test(effect)) {
    console.log('   ❌ Contient notifyUnsavedChanges (problématique)');
    hasProblematicEffect = true;
  } else if (/onUnsavedChanges.*hasUnsavedChanges/.test(effect)) {
    console.log('   ✅ Appel direct à onUnsavedChanges avec hasUnsavedChanges');
  } else if (/hasUnsavedChanges/.test(effect)) {
    console.log('   ✅ Dépend de hasUnsavedChanges uniquement');
  } else {
    console.log('   ✅ Pas de dépendance problématique');
  }
  
  // Afficher un extrait
  const excerpt = effect.substring(0, 80).replace(/\s+/g, ' ');
  console.log(`   📝 ${excerpt}...`);
});

console.log('\n3️⃣ Résumé...');

const allGood = !hasNotifyCallback && hasDirectUseEffect && !hasNotifyUseEffect && !hasProblematicEffect;

if (allGood) {
  console.log('🎉 CORRECTION RÉUSSIE !');
  console.log('📝 La boucle infinie ligne 466 est résolue');
  console.log('✅ Plus de callback notifyUnsavedChanges problématique');
  console.log('✅ useEffect direct avec dépendance hasUnsavedChanges uniquement');
  console.log('🚀 ApproachEditor devrait maintenant fonctionner sans erreur');
} else {
  console.log('❌ Des problèmes subsistent');
  console.log('📝 La correction n\'est pas complète');
}

console.log('\n🔍 Test terminé !');
console.log('================');

process.exit(allGood ? 0 : 1);