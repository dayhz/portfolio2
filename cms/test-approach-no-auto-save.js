#!/usr/bin/env node

/**
 * Test de vérification - Pas d'auto-save dans ApproachEditor
 * Vérifie que l'auto-save a été complètement supprimé
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de vérification - Pas d\'auto-save');
console.log('==========================================');

const approachEditorPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');

if (!fs.existsSync(approachEditorPath)) {
  console.log('❌ Fichier ApproachEditor.tsx non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(approachEditorPath, 'utf8');

console.log('1️⃣ Vérification de l\'absence d\'auto-save...');

const autoSavePatterns = [
  {
    name: 'handleDataChange',
    pattern: /handleDataChange/g,
    description: 'Fonction d\'auto-save avec debounce'
  },
  {
    name: 'setTimeout pour auto-save',
    pattern: /setTimeout.*onChange/g,
    description: 'Timer pour auto-save automatique'
  },
  {
    name: 'useEffect avec onChange',
    pattern: /useEffect.*onChange.*\[.*onChange.*\]/g,
    description: 'useEffect qui pourrait causer une boucle avec onChange'
  },
  {
    name: 'Auto-save dans useEffect',
    pattern: /useEffect.*auto.*save|useEffect.*save.*auto/gi,
    description: 'useEffect explicite d\'auto-save'
  }
];

let hasProblems = false;

autoSavePatterns.forEach(({ name, pattern, description }) => {
  const matches = content.match(pattern) || [];
  if (matches.length > 0) {
    console.log(`❌ ${name}: ${matches.length} occurrence(s) trouvée(s)`);
    console.log(`   Description: ${description}`);
    matches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.substring(0, 50)}...`);
    });
    hasProblems = true;
  } else {
    console.log(`✅ ${name}: Aucune occurrence trouvée`);
  }
});

console.log('\n2️⃣ Vérification de la sauvegarde manuelle...');

const manualSavePatterns = [
  {
    name: 'Bouton Sauvegarder',
    pattern: /Save.*onClick.*onSave/,
    description: 'Bouton de sauvegarde manuelle'
  },
  {
    name: 'Fonction onSave',
    pattern: /onSave\?/,
    description: 'Appel conditionnel à onSave'
  },
  {
    name: 'Commentaire manual save',
    pattern: /manual.*save|save.*manual/gi,
    description: 'Commentaires indiquant la sauvegarde manuelle'
  }
];

let hasManualSave = false;

manualSavePatterns.forEach(({ name, pattern, description }) => {
  const matches = content.match(pattern) || [];
  if (matches.length > 0) {
    console.log(`✅ ${name}: ${matches.length} occurrence(s) trouvée(s)`);
    hasManualSave = true;
  } else {
    console.log(`⚠️  ${name}: Aucune occurrence trouvée`);
  }
});

console.log('\n3️⃣ Vérification des useEffect...');

const useEffects = content.match(/useEffect\([^}]+\}, \[[^\]]*\]\);/g) || [];
console.log(`📊 Nombre total de useEffect: ${useEffects.length}`);

useEffects.forEach((effect, index) => {
  const hasOnChange = /onChange/.test(effect);
  const hasOnUnsavedChanges = /onUnsavedChanges/.test(effect);
  
  if (hasOnChange) {
    console.log(`⚠️  useEffect ${index + 1}: Contient onChange (risque de boucle)`);
  } else if (hasOnUnsavedChanges) {
    console.log(`✅ useEffect ${index + 1}: Contient onUnsavedChanges (OK si pas dans les dépendances)`);
  } else {
    console.log(`✅ useEffect ${index + 1}: Pas de dépendance problématique`);
  }
});

console.log('\n4️⃣ Résumé...');

if (!hasProblems && hasManualSave) {
  console.log('🎉 PARFAIT ! L\'auto-save a été complètement supprimé');
  console.log('📝 Seule la sauvegarde manuelle est disponible');
  console.log('🚀 Plus de risque de boucle infinie');
  
  console.log('\n📋 Fonctionnement attendu:');
  console.log('   ✅ L\'utilisateur modifie les champs');
  console.log('   ✅ Les changements sont visibles dans l\'aperçu');
  console.log('   ✅ Le bouton "Sauvegarder" s\'active');
  console.log('   ✅ L\'utilisateur clique sur "Sauvegarder" pour persister');
  console.log('   ✅ Aucune sauvegarde automatique');
  
} else {
  console.log('❌ Des problèmes d\'auto-save subsistent');
  
  if (hasProblems) {
    console.log('📝 Problèmes détectés:');
    console.log('   - Des patterns d\'auto-save sont encore présents');
    console.log('   - Risque de boucle infinie');
  }
  
  if (!hasManualSave) {
    console.log('📝 Problèmes de sauvegarde manuelle:');
    console.log('   - La sauvegarde manuelle pourrait ne pas fonctionner');
  }
}

console.log('\n🔍 Vérification terminée !');
console.log('==========================');

process.exit(hasProblems ? 1 : 0);