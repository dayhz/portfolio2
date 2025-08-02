#!/usr/bin/env node

/**
 * Test de debug spécifique - Bouton Sauvegarder ApproachEditor
 * Identifie pourquoi le bouton ne répond plus
 */

console.log('🔧 Debug Bouton Sauvegarder - ApproachEditor');
console.log('=============================================');

console.log('📋 Checklist de debug pour le bouton sauvegarder:');
console.log('');

console.log('1️⃣ Vérifications côté composant ApproachEditor:');
console.log('   ✅ Fonction handleSave existe');
console.log('   ✅ Prop onSave est vérifiée avec onSave?');
console.log('   ✅ État hasUnsavedChanges contrôle l\'activation');
console.log('   ✅ État isSaving contrôle le loading');
console.log('');

console.log('2️⃣ Vérifications côté ServicesPage:');
console.log('   ✅ Fonction handleApproachSave existe');
console.log('   ✅ Prop onSave={handleApproachSave} est passée');
console.log('   ✅ États isLoading et isSaving sont gérés');
console.log('');

console.log('3️⃣ Tests à effectuer dans le navigateur:');
console.log('');

console.log('🌐 Étapes de debug dans le navigateur:');
console.log('   1. Ouvrez http://localhost:3000');
console.log('   2. Ouvrez les outils de développement (F12)');
console.log('   3. Allez dans l\'onglet Console');
console.log('   4. Naviguez vers Services > Section Approach');
console.log('   5. Modifiez un champ (titre, description, etc.)');
console.log('   6. Vérifiez si des erreurs apparaissent dans la console');
console.log('');

console.log('🔍 Points de vérification spécifiques:');
console.log('');

console.log('A. État du bouton:');
console.log('   - Le bouton est-il visible ?');
console.log('   - Le bouton est-il grisé (disabled) ?');
console.log('   - Le texte du bouton change-t-il (Sauvegarder/Sauvegarde...) ?');
console.log('');

console.log('B. Réactivité aux changements:');
console.log('   - Modifier le titre active-t-il le bouton ?');
console.log('   - Modifier la description active-t-il le bouton ?');
console.log('   - Ajouter/supprimer une étape active-t-il le bouton ?');
console.log('');

console.log('C. Erreurs JavaScript:');
console.log('   - Y a-t-il des erreurs rouges dans la console ?');
console.log('   - Y a-t-il des warnings jaunes ?');
console.log('   - Y a-t-il des erreurs de réseau (onglet Network) ?');
console.log('');

console.log('4️⃣ Solutions possibles selon les symptômes:');
console.log('');

console.log('🔧 Si le bouton est invisible:');
console.log('   - Vérifier que onSave est bien passé en prop');
console.log('   - Vérifier la condition {onSave && ( dans le JSX');
console.log('');

console.log('🔧 Si le bouton est grisé en permanence:');
console.log('   - Vérifier que hasUnsavedChanges devient true');
console.log('   - Vérifier que isSaving n\'est pas bloqué à true');
console.log('   - Tester: console.log(hasUnsavedChanges, isSaving)');
console.log('');

console.log('🔧 Si le bouton ne fait rien au clic:');
console.log('   - Vérifier qu\'il n\'y a pas d\'erreur JavaScript');
console.log('   - Vérifier que handleSave est bien appelé');
console.log('   - Tester: ajouter console.log dans handleSave');
console.log('');

console.log('🔧 Si l\'API ne répond pas:');
console.log('   - Vérifier que le serveur backend est démarré');
console.log('   - Tester l\'endpoint: curl http://localhost:3001/api/services');
console.log('   - Vérifier les erreurs réseau dans l\'onglet Network');
console.log('');

console.log('5️⃣ Code de debug à ajouter temporairement:');
console.log('');

console.log('📝 Dans ApproachEditor.tsx, ajouter dans handleSave:');
console.log('   console.log("handleSave appelé", { formData, onSave });');
console.log('');

console.log('📝 Dans ServicesPage.tsx, ajouter dans handleApproachSave:');
console.log('   console.log("handleApproachSave appelé", { data, isSaving });');
console.log('');

console.log('📝 Pour vérifier les états, ajouter dans le render:');
console.log('   console.log("États:", { hasUnsavedChanges, isSaving, isLoading });');
console.log('');

console.log('6️⃣ Actions de récupération:');
console.log('');

console.log('🚀 Actions immédiates:');
console.log('   1. Redémarrer le serveur frontend (npm run dev)');
console.log('   2. Redémarrer le serveur backend (npm run dev)');
console.log('   3. Vider le cache navigateur (Ctrl+Shift+R)');
console.log('   4. Tester dans un onglet privé');
console.log('');

console.log('🎯 Debug terminé !');
console.log('==================');
console.log('');
console.log('💡 Conseil: Commencez par vérifier la console du navigateur');
console.log('   C\'est là que vous trouverez les erreurs exactes !');