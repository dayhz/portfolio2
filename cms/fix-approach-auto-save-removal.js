#!/usr/bin/env node

/**
 * Script pour supprimer l'auto-save de l'ApproachEditor
 * Kiro IDE a réintroduit l'auto-save qui cause des boucles infinies
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Suppression de l\'auto-save - ApproachEditor');
console.log('===============================================');

const approachEditorPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');

if (!fs.existsSync(approachEditorPath)) {
  console.log('❌ Fichier ApproachEditor.tsx non trouvé');
  process.exit(1);
}

let content = fs.readFileSync(approachEditorPath, 'utf8');

console.log('1️⃣ Suppression du handleDataChange...');

// Supprimer la définition de handleDataChange
const handleDataChangePattern = /\/\/ Safe data change handler with debounce[\s\S]*?}, \[onChange\]\);/;
content = content.replace(handleDataChangePattern, '// Manual save only - no auto-save');

console.log('✅ Définition handleDataChange supprimée');

console.log('2️⃣ Suppression des appels à handleDataChange...');

// Supprimer tous les appels à handleDataChange
const callsToRemove = [
  /handleDataChange\(newData\);\s*/g,
  /handleDataChange\(newData\);\n\s*/g
];

let removedCalls = 0;
callsToRemove.forEach(pattern => {
  const matches = content.match(pattern) || [];
  removedCalls += matches.length;
  content = content.replace(pattern, '');
});

console.log(`✅ ${removedCalls} appels à handleDataChange supprimés`);

console.log('3️⃣ Nettoyage des dépendances useCallback...');

// Nettoyer les dépendances handleDataChange dans les useCallback
content = content.replace(/\[formData, handleDataChange\]/g, '[formData]');
content = content.replace(/\[handleDataChange\]/g, '[]');

console.log('✅ Dépendances nettoyées');

console.log('4️⃣ Sauvegarde du fichier corrigé...');

fs.writeFileSync(approachEditorPath, content, 'utf8');

console.log('✅ Fichier sauvegardé');

console.log('\n📋 Résumé des corrections:');
console.log('   ✅ handleDataChange supprimé');
console.log(`   ✅ ${removedCalls} appels automatiques supprimés`);
console.log('   ✅ Dépendances useCallback nettoyées');
console.log('   ✅ Retour à la sauvegarde manuelle uniquement');

console.log('\n🎯 L\'ApproachEditor utilise maintenant uniquement la sauvegarde manuelle');
console.log('📝 Plus de risque de boucle infinie avec l\'auto-save');

console.log('\n🔍 Correction terminée !');
console.log('======================');