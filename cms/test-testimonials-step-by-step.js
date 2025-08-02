#!/usr/bin/env node

/**
 * Test step-by-step pour identifier et résoudre le problème de connexion
 * CMS → Site public (http://localhost:3001/services)
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🎯 TEST STEP-BY-STEP - Connexion CMS → Site Public');
console.log('🔥 Objectif: Identifier pourquoi les changements ne se répercutent pas sur localhost:3001');
console.log('='.repeat(80));

async function stepByStepTest() {
  try {
    console.log('\n📋 ÉTAPE 1: PRÉPARATION DU TEST...\n');

    const servicesHtmlPath = path.join(__dirname, '../portfolio2/www.victorberbel.work/services.html');
    
    // Lire l'état actuel du fichier
    const originalContent = await fs.readFile(servicesHtmlPath, 'utf8');
    const originalStats = await fs.stat(servicesHtmlPath);
    
    console.log('📄 État initial du fichier services.html:');
    console.log(`   📅 Dernière modification: ${originalStats.mtime.toLocaleString()}`);
    console.log(`   📏 Taille: ${Math.round(originalStats.size / 1024)} KB`);
    
    // Compter les témoignages actuels
    const currentTestimonials = (originalContent.match(/testimonials-card/g) || []).length;
    console.log(`   💬 Témoignages détectés: ${currentTestimonials}`);

    console.log('\n📋 ÉTAPE 2: TEST MANUEL DE MODIFICATION...\n');

    // Ajouter un marqueur de test unique
    const testMarker = `<!-- TEST MODIFICATION ${new Date().toISOString()} -->`;
    const modifiedContent = originalContent.replace(
      '<div class="mask w-slider-mask">',
      `${testMarker}\n        <div class="mask w-slider-mask">`
    );

    // Sauvegarder la modification
    await fs.writeFile(servicesHtmlPath, modifiedContent, 'utf8');
    
    const modifiedStats = await fs.stat(servicesHtmlPath);
    console.log('✅ Modification manuelle appliquée');
    console.log(`   🔧 Marqueur ajouté: ${testMarker}`);
    console.log(`   📅 Nouvelle modification: ${modifiedStats.mtime.toLocaleString()}`);

    console.log('\n📋 ÉTAPE 3: VÉRIFICATION DE LA MODIFICATION...\n');

    // Relire le fichier pour confirmer
    const verificationContent = await fs.readFile(servicesHtmlPath, 'utf8');
    const hasTestMarker = verificationContent.includes(testMarker);

    if (hasTestMarker) {
      console.log('✅ Modification confirmée dans le fichier');
    } else {
      console.log('❌ Modification non trouvée dans le fichier');
      return false;
    }

    console.log('\n📋 ÉTAPE 4: INSTRUCTIONS POUR TESTER LE SITE...\n');

    console.log('🌐 MAINTENANT, TESTE LE SITE PUBLIC:');
    console.log('');
    console.log('1. 🔗 Ouvre ton navigateur sur:');
    console.log('   http://localhost:3001/services');
    console.log('');
    console.log('2. 🔍 Ouvre les outils de développement (F12)');
    console.log('');
    console.log('3. 🧹 Vide le cache et recharge:');
    console.log('   - Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)');
    console.log('   - Ou clic droit sur le bouton refresh → "Vider le cache et recharger"');
    console.log('');
    console.log('4. 📄 Vérifie le code source:');
    console.log('   - Clic droit → "Afficher le code source"');
    console.log('   - Cherche (Ctrl+F): "TEST MODIFICATION"');
    console.log('');
    console.log('5. 📊 Résultats possibles:');
    console.log('   ✅ Si tu trouves "TEST MODIFICATION" → Le serveur fonctionne !');
    console.log('   ❌ Si tu ne trouves pas → Problème de serveur/cache');
    console.log('');

    console.log('📋 ÉTAPE 5: SOLUTIONS SELON LE RÉSULTAT...\n');

    console.log('🔧 SI LE TEST ÉCHOUE (pas de "TEST MODIFICATION"):');
    console.log('');
    console.log('Solution A - Redémarrer le serveur portfolio2:');
    console.log('   1. Arrête le serveur portfolio2 (Ctrl+C)');
    console.log('   2. cd portfolio2');
    console.log('   3. npm start (ou node server.js)');
    console.log('   4. Reteste http://localhost:3001/services');
    console.log('');
    console.log('Solution B - Vérifier la configuration du serveur:');
    console.log('   1. Ouvre portfolio2/server.js');
    console.log('   2. Cherche des options de cache');
    console.log('   3. Ajoute des headers no-cache si nécessaire');
    console.log('');
    console.log('Solution C - Forcer le rechargement:');
    console.log('   1. Ajoute ?v=' + timestamp à l\'URL');
    console.log('   2. http://localhost:3001/services?v=123456');
    console.log('');

    console.log('🎉 SI LE TEST RÉUSSIT (tu vois "TEST MODIFICATION"):');
    console.log('');
    console.log('   ✅ La connexion fonctionne !');
    console.log('   ✅ Le problème était juste le cache');
    console.log('   ✅ Les modifications CMS se répercutent bien');
    console.log('');
    console.log('   📝 Pour les prochaines fois:');
    console.log('   - Toujours faire Ctrl+Shift+R après une modification CMS');
    console.log('   - Ou configurer le serveur pour désactiver le cache');
    console.log('');

    console.log('📋 ÉTAPE 6: NETTOYAGE...\n');

    // Attendre que l'utilisateur teste
    console.log('⏳ ATTENTE: Teste maintenant le site web...');
    console.log('');
    console.log('Une fois que tu as testé, appuie sur Entrée pour nettoyer le marqueur de test.');
    
    // En mode automatique, on nettoie après 30 secondes
    console.log('🔄 Nettoyage automatique dans 30 secondes...');
    
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Restaurer le fichier original
    await fs.writeFile(servicesHtmlPath, originalContent, 'utf8');
    console.log('✅ Marqueur de test supprimé');
    console.log('✅ Fichier services.html restauré');

    console.log('\n📋 ÉTAPE 7: TEST DU CMS RÉEL...\n');

    console.log('🎯 MAINTENANT, TESTE LE WORKFLOW CMS COMPLET:');
    console.log('');
    console.log('1. 🚀 Assure-toi que le CMS backend tourne:');
    console.log('   cd cms/backend && npm run dev');
    console.log('');
    console.log('2. 🌐 Assure-toi que le CMS frontend tourne:');
    console.log('   cd cms/frontend && npm run dev');
    console.log('');
    console.log('3. 📝 Ouvre le CMS Services:');
    console.log('   http://localhost:3000/services (ou le bon port)');
    console.log('');
    console.log('4. 💬 Va dans "Section Témoignages"');
    console.log('');
    console.log('5. ➕ Ajoute un nouveau témoignage avec:');
    console.log('   - Texte: "TEST CMS - Ce témoignage vient du CMS"');
    console.log('   - Auteur: "Test User"');
    console.log('   - Titre: "Testeur CMS"');
    console.log('');
    console.log('6. 💾 Clique sur "Sauvegarder"');
    console.log('');
    console.log('7. 🔍 Vérifie http://localhost:3001/services (avec Ctrl+Shift+R)');
    console.log('   Tu devrais voir le nouveau témoignage !');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

// Exécuter le test step-by-step
stepByStepTest()
  .then(success => {
    console.log('\n🏁 Test step-by-step terminé');
    console.log('='.repeat(80));
    if (success) {
      console.log('\n🎯 RÉSUMÉ:');
      console.log('   1. ✅ Test manuel effectué');
      console.log('   2. 🔍 Instructions données pour tester le site');
      console.log('   3. 🔧 Solutions proposées selon le résultat');
      console.log('   4. 🎯 Workflow CMS complet à tester');
      console.log('');
      console.log('💡 La clé est probablement le cache du serveur statique !');
      console.log('   Ctrl+Shift+R devrait résoudre le problème.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });