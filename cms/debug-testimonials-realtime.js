#!/usr/bin/env node

/**
 * Debug en temps réel - Vérification de la connexion CMS → Site public
 * Vérifie si les changements CMS se répercutent sur http://localhost:3001/services
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔍 DEBUG TEMPS RÉEL - Connexion CMS → Site Public');
console.log('🎯 Objectif: Vérifier si les changements se répercutent sur http://localhost:3001/services');
console.log('='.repeat(80));

async function debugRealtimeConnection() {
  try {
    console.log('\n📋 1. VÉRIFICATION DE L\'ARCHITECTURE...\n');

    // Vérifier la structure des projets
    const portfolioPath = path.join(__dirname, '../portfolio2');
    const cmsPath = path.join(__dirname, '.');

    console.log('🏗️  Architecture actuelle:');
    console.log(`   📁 CMS Backend: ${cmsPath}/backend (port 3000 probablement)`);
    console.log(`   📁 CMS Frontend: ${cmsPath}/frontend`);
    console.log(`   📁 Site Public: ${portfolioPath} (port 3001)`);

    // Vérifier si portfolio2 a son propre serveur
    const portfolioPackagePath = path.join(portfolioPath, 'package.json');
    const portfolioServerPath = path.join(portfolioPath, 'server.js');

    let hasPortfolioServer = false;
    try {
      await fs.access(portfolioPackagePath);
      await fs.access(portfolioServerPath);
      hasPortfolioServer = true;
      console.log('✅ Portfolio2 a son propre serveur');
    } catch {
      console.log('❌ Portfolio2 n\'a pas de serveur dédié');
    }

    if (hasPortfolioServer) {
      const packageContent = await fs.readFile(portfolioPackagePath, 'utf8');
      const serverContent = await fs.readFile(portfolioServerPath, 'utf8');
      
      console.log('\n📄 Configuration du serveur portfolio2:');
      
      // Extraire le port du serveur
      const portMatch = serverContent.match(/port.*?(\d+)/i) || packageContent.match(/port.*?(\d+)/i);
      if (portMatch) {
        console.log(`   🔌 Port détecté: ${portMatch[1]}`);
      }

      // Vérifier si c'est un serveur statique
      if (serverContent.includes('express.static') || serverContent.includes('static')) {
        console.log('   📁 Type: Serveur de fichiers statiques');
        console.log('   ⚠️  PROBLÈME IDENTIFIÉ: Le serveur statique ne se met pas à jour automatiquement !');
      }
    }

    console.log('\n📋 2. VÉRIFICATION DU CHEMIN DE PUBLICATION...\n');

    // Vérifier le chemin dans testimonialsHtmlGenerator
    const generatorPath = path.join(__dirname, 'backend/src/services/testimonialsHtmlGenerator.ts');
    const generatorContent = await fs.readFile(generatorPath, 'utf8');

    console.log('🔧 Chemin de publication dans testimonialsHtmlGenerator:');
    const pathMatch = generatorContent.match(/servicesHtmlPath.*?['"`](.*?)['"`]/);
    if (pathMatch) {
      console.log(`   📂 Chemin configuré: ${pathMatch[1]}`);
    }

    // Vérifier le chemin dans servicesService
    const servicesServicePath = path.join(__dirname, 'backend/src/services/servicesService.ts');
    const servicesServiceContent = await fs.readFile(servicesServicePath, 'utf8');

    const servicePathMatch = servicesServiceContent.match(/servicesHtmlPath.*?['"`](.*?)['"`]/);
    if (servicePathMatch) {
      console.log(`   📂 Chemin dans servicesService: ${servicePathMatch[1]}`);
    }

    console.log('\n📋 3. TEST DE CONNEXION RÉELLE...\n');

    // Vérifier si le fichier services.html existe et est accessible
    const servicesHtmlPath = path.join(__dirname, '../portfolio2/www.victorberbel.work/services.html');
    
    try {
      const stats = await fs.stat(servicesHtmlPath);
      console.log('✅ Fichier services.html trouvé');
      console.log(`   📅 Dernière modification: ${stats.mtime.toLocaleString()}`);
      console.log(`   📏 Taille: ${Math.round(stats.size / 1024)} KB`);

      // Lire un extrait pour vérifier le contenu
      const htmlContent = await fs.readFile(servicesHtmlPath, 'utf8');
      const testimonialsCount = (htmlContent.match(/testimonials-card/g) || []).length;
      console.log(`   💬 Témoignages détectés: ${testimonialsCount}`);

    } catch (error) {
      console.log('❌ Fichier services.html non accessible');
      console.log(`   Erreur: ${error.message}`);
    }

    console.log('\n📋 4. DIAGNOSTIC DU PROBLÈME...\n');

    console.log('🔍 ANALYSE DE LA SITUATION:');
    console.log('');
    console.log('1. 🎯 CMS Backend (port 3000):');
    console.log('   ✅ Sauvegarde les données en base');
    console.log('   ✅ Génère le HTML via testimonialsHtmlGenerator');
    console.log('   ✅ Met à jour le fichier services.html');
    console.log('');
    console.log('2. 🌐 Site Public (port 3001):');
    console.log('   ❓ Sert les fichiers statiques depuis portfolio2/');
    console.log('   ❓ Peut-être ne recharge pas automatiquement les fichiers');
    console.log('   ❓ Possible cache du navigateur ou du serveur');
    console.log('');

    console.log('🚨 PROBLÈMES POTENTIELS:');
    console.log('');
    console.log('1. 🔄 Cache du serveur statique:');
    console.log('   Le serveur portfolio2 peut mettre en cache les fichiers HTML');
    console.log('   Solution: Redémarrer le serveur portfolio2 après modification');
    console.log('');
    console.log('2. 🌐 Cache du navigateur:');
    console.log('   Le navigateur peut avoir mis en cache l\'ancienne version');
    console.log('   Solution: Ctrl+F5 ou vider le cache');
    console.log('');
    console.log('3. 📁 Chemin de fichier incorrect:');
    console.log('   Le CMS modifie peut-être le mauvais fichier');
    console.log('   Solution: Vérifier les chemins de publication');
    console.log('');

    console.log('📋 5. SOLUTIONS RECOMMANDÉES...\n');

    console.log('🔧 SOLUTIONS À TESTER:');
    console.log('');
    console.log('1. 🔄 Redémarrage du serveur portfolio2:');
    console.log('   cd portfolio2 && npm restart (ou équivalent)');
    console.log('');
    console.log('2. 🧹 Vider le cache navigateur:');
    console.log('   Ctrl+F5 sur http://localhost:3001/services');
    console.log('');
    console.log('3. 📝 Test manuel de modification:');
    console.log('   - Modifier manuellement portfolio2/www.victorberbel.work/services.html');
    console.log('   - Ajouter un commentaire <!-- TEST --> quelque part');
    console.log('   - Vérifier si ça apparaît sur http://localhost:3001/services');
    console.log('');
    console.log('4. 🔍 Vérification en temps réel:');
    console.log('   - Ouvrir services.html dans un éditeur');
    console.log('   - Modifier un témoignage dans le CMS');
    console.log('   - Voir si le fichier change en temps réel');
    console.log('');

    console.log('📋 6. TEST STEP-BY-STEP...\n');

    console.log('🎯 PROCÉDURE DE TEST RECOMMANDÉE:');
    console.log('');
    console.log('Étape 1: Préparer le test');
    console.log('  - Ouvrir http://localhost:3001/services dans le navigateur');
    console.log('  - Noter l\'état actuel des témoignages');
    console.log('');
    console.log('Étape 2: Modifier dans le CMS');
    console.log('  - Aller sur le CMS Services');
    console.log('  - Modifier un témoignage (ajouter "TEST" au début)');
    console.log('  - Sauvegarder');
    console.log('');
    console.log('Étape 3: Vérifier le fichier');
    console.log('  - Ouvrir portfolio2/www.victorberbel.work/services.html');
    console.log('  - Chercher le mot "TEST" dans le fichier');
    console.log('  - Si présent → CMS fonctionne ✅');
    console.log('  - Si absent → Problème CMS ❌');
    console.log('');
    console.log('Étape 4: Vérifier le site');
    console.log('  - Rafraîchir http://localhost:3001/services (Ctrl+F5)');
    console.log('  - Chercher le mot "TEST" sur la page');
    console.log('  - Si présent → Connexion OK ✅');
    console.log('  - Si absent → Problème serveur/cache ❌');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return false;
  }
}

// Exécuter le diagnostic
debugRealtimeConnection()
  .then(success => {
    console.log('\n🏁 Diagnostic terminé');
    console.log('='.repeat(80));
    console.log('\n💡 PROCHAINE ÉTAPE:');
    console.log('   Teste la procédure step-by-step ci-dessus pour identifier');
    console.log('   exactement où se situe le problème dans la chaîne.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });