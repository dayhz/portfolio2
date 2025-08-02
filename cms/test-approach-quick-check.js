#!/usr/bin/env node

/**
 * Test rapide - Vérification ApproachEditor
 * Vérifie que les corrections de debug sont en place
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ Test rapide - ApproachEditor avec debug');
console.log('==========================================');

// Vérifier que les logs de debug sont en place
const approachPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');
const servicesPath = path.join(__dirname, 'frontend/src/pages/ServicesPage.tsx');

console.log('1️⃣ Vérification des logs de debug...');

if (fs.existsSync(approachPath)) {
  const content = fs.readFileSync(approachPath, 'utf8');
  const hasDebugLog = content.includes('🔧 DEBUG handleSave appelé');
  console.log(`✅ ApproachEditor debug: ${hasDebugLog ? 'AJOUTÉ' : 'MANQUANT'}`);
} else {
  console.log('❌ ApproachEditor.tsx non trouvé');
}

if (fs.existsSync(servicesPath)) {
  const content = fs.readFileSync(servicesPath, 'utf8');
  const hasDebugLog = content.includes('🔧 DEBUG handleApproachSave appelé');
  console.log(`✅ ServicesPage debug: ${hasDebugLog ? 'AJOUTÉ' : 'MANQUANT'}`);
} else {
  console.log('❌ ServicesPage.tsx non trouvé');
}

console.log('\n2️⃣ Instructions de test...');

console.log('🌐 Maintenant, testez dans le navigateur:');
console.log('   1. Ouvrez http://localhost:3000');
console.log('   2. Ouvrez la console (F12)');
console.log('   3. Allez sur Services > Section Approach');
console.log('   4. Modifiez le titre ou la description');
console.log('   5. Cliquez sur "Sauvegarder"');
console.log('   6. Regardez les messages de debug dans la console');
console.log('');

console.log('🔍 Messages de debug attendus:');
console.log('   - "🔧 DEBUG handleSave appelé" avec les détails');
console.log('   - "🔧 DEBUG handleApproachSave appelé" avec les données');
console.log('   - Si erreur: "🔧 DEBUG Erreur handleSave:" avec détails');
console.log('');

console.log('📋 Selon les messages de debug:');
console.log('');

console.log('✅ Si vous voyez les deux messages:');
console.log('   → Le bouton fonctionne, le problème est ailleurs');
console.log('   → Vérifiez les erreurs réseau ou API');
console.log('');

console.log('❌ Si vous ne voyez que le premier message:');
console.log('   → Problème dans handleApproachSave');
console.log('   → Vérifiez la prop onSave');
console.log('');

console.log('❌ Si vous ne voyez aucun message:');
console.log('   → Le bouton ne déclenche pas handleSave');
console.log('   → Problème d\'événement click ou état disabled');
console.log('');

console.log('🚀 Actions selon les résultats:');
console.log('   - Messages OK + API OK = Problème résolu !');
console.log('   - Messages OK + API KO = Problème serveur backend');
console.log('   - Pas de messages = Problème frontend (bouton/état)');
console.log('');

console.log('⚡ Test rapide terminé !');
console.log('========================');
console.log('');
console.log('💡 N\'oubliez pas de supprimer les logs de debug après résolution !');