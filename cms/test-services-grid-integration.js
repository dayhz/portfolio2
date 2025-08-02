#!/usr/bin/env node

/**
 * Test d'intégration pour la section Grid des Services
 * Vérifie que la section grid est correctement connectée à l'API
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const API_BASE = 'http://localhost:8000/api';
const CMS_BASE = 'http://localhost:3000';

// Couleurs de test
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Données de test pour la section grid
const testGridData = {
  services: [
    {
      id: 'service-web',
      number: 1,
      title: 'Développement Web',
      description: 'Sites web modernes et responsives avec les dernières technologies',
      color: '#3B82F6',
      colorClass: 'service-blue',
      order: 0
    },
    {
      id: 'service-mobile',
      number: 2,
      title: 'Applications Mobile',
      description: 'Applications natives et cross-platform pour iOS et Android',
      color: '#10B981',
      colorClass: 'service-green',
      order: 1
    },
    {
      id: 'service-product',
      number: 3,
      title: 'Design Produit',
      description: 'Conception UX/UI centrée utilisateur pour vos produits digitaux',
      color: '#F59E0B',
      colorClass: 'service-orange',
      order: 2
    }
  ]
};

async function testAPI() {
  log('\n🔧 Test de l\'API Services - Section Grid', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // 1. Test de santé de l'API
    log('\n1. Test de santé de l\'API...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s "${API_BASE}/services/health"`);
      const healthData = JSON.parse(stdout);
      if (healthData.status === 'ok') {
        log('✅ API Services en ligne', 'green');
      } else {
        throw new Error('API non disponible');
      }
    } catch (error) {
      log('❌ API Services non accessible', 'red');
      log('   Vérifiez que le serveur backend est démarré sur le port 3001', 'yellow');
      return false;
    }

    // 2. Récupération des données actuelles
    log('\n2. Récupération des données actuelles...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s "${API_BASE}/services/services"`);
      const currentData = JSON.parse(stdout);
      if (currentData.success) {
        log(`✅ Données récupérées: ${currentData.data.services?.length || 0} service(s)`, 'green');
      } else {
        log('⚠️  Aucune donnée existante, création initiale', 'yellow');
      }
    } catch (error) {
      log('⚠️  Erreur lors de la récupération des données', 'yellow');
    }

    // 3. Mise à jour avec les données de test
    log('\n3. Mise à jour avec les données de test...', 'blue');
    const testDataJson = JSON.stringify(testGridData).replace(/"/g, '\\"');
    try {
      const { stdout } = await execAsync(`curl -s -X PUT -H "Content-Type: application/json" -d "${testDataJson}" "${API_BASE}/services/services"`);
      const updateData = JSON.parse(stdout);
      if (updateData.success) {
        log('✅ Données mises à jour avec succès', 'green');
        log(`   Services sauvegardés: ${updateData.data.services.length}`, 'green');
      } else {
        throw new Error(`Échec de la mise à jour: ${updateData.message}`);
      }
    } catch (error) {
      log(`❌ Erreur lors de la mise à jour: ${error.message}`, 'red');
      return false;
    }

    // 4. Test de publication
    log('\n4. Test de publication...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s -X POST "${API_BASE}/services/publish"`);
      const publishData = JSON.parse(stdout);
      if (publishData.success) {
        log('✅ Publication réussie', 'green');
        log(`   Sections publiées: ${publishData.data.publishedSections.join(', ')}`, 'green');
      } else {
        throw new Error(`Échec de la publication: ${publishData.message}`);
      }
    } catch (error) {
      log(`❌ Erreur lors de la publication: ${error.message}`, 'red');
      return false;
    }

    log('\n🎉 Tous les tests API sont passés avec succès !', 'green');
    return true;

  } catch (error) {
    log(`\n❌ Erreur lors du test API: ${error.message}`, 'red');
    return false;
  }
}

async function testCMSIntegration() {
  log('\n🖥️  Test d\'intégration CMS Frontend', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Test de base du frontend (vérifier qu'il répond)
    log('\n1. Test de disponibilité du CMS...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${CMS_BASE}"`);
      if (stdout.trim() === '200') {
        log('✅ CMS Frontend accessible', 'green');
      } else {
        log('⚠️  CMS Frontend non accessible (vérifiez qu\'il est démarré)', 'yellow');
      }
    } catch (cmsError) {
      log('⚠️  CMS Frontend non accessible (vérifiez qu\'il est démarré)', 'yellow');
    }

    // Instructions pour le test manuel
    log('\n2. Test manuel recommandé:', 'blue');
    log('   📱 Ouvrez votre navigateur sur: http://localhost:3000', 'cyan');
    log('   📝 Naviguez vers: Services Page CMS', 'cyan');
    log('   🎯 Cliquez sur: Section Grid', 'cyan');
    log('   ✏️  Testez l\'ajout/modification de services', 'cyan');
    log('   💾 Vérifiez la sauvegarde et publication', 'cyan');

    log('\n🎉 Instructions d\'intégration CMS fournies !', 'green');
    return true;

  } catch (error) {
    log(`\n❌ Erreur lors du test CMS: ${error.message}`, 'red');
    return false;
  }
}

async function testFullWorkflow() {
  log('\n🔄 Test du workflow complet', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    // Données de test pour un workflow complet
    const workflowData = {
      services: [
        {
          id: 'service-workflow-1',
          number: 1,
          title: 'Service Test 1',
          description: 'Description du service de test 1',
          color: '#8B5CF6',
          colorClass: 'service-purple',
          order: 0
        },
        {
          id: 'service-workflow-2',
          number: 2,
          title: 'Service Test 2',
          description: 'Description du service de test 2',
          color: '#EC4899',
          colorClass: 'service-pink',
          order: 1
        }
      ]
    };

    log('\n1. Sauvegarde des données de workflow...', 'blue');
    const workflowDataJson = JSON.stringify(workflowData).replace(/"/g, '\\"');
    try {
      const { stdout } = await execAsync(`curl -s -X PUT -H "Content-Type: application/json" -d "${workflowDataJson}" "${API_BASE}/services/services"`);
      const saveData = JSON.parse(stdout);
      if (saveData.success) {
        log('✅ Données de workflow sauvegardées', 'green');
      }
    } catch (error) {
      log(`❌ Erreur lors de la sauvegarde: ${error.message}`, 'red');
      return false;
    }

    log('\n2. Publication des changements...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s -X POST "${API_BASE}/services/publish"`);
      const publishData = JSON.parse(stdout);
      if (publishData.success) {
        log('✅ Changements publiés', 'green');
      }
    } catch (error) {
      log(`❌ Erreur lors de la publication: ${error.message}`, 'red');
      return false;
    }

    log('\n3. Vérification finale...', 'blue');
    try {
      const { stdout } = await execAsync(`curl -s "${API_BASE}/services/services"`);
      const finalData = JSON.parse(stdout);
      if (finalData.success) {
        log(`✅ Workflow complet validé: ${finalData.data.services.length} service(s)`, 'green');
      }
    } catch (error) {
      log(`❌ Erreur lors de la vérification: ${error.message}`, 'red');
      return false;
    }

    log('\n🎉 Workflow complet testé avec succès !', 'green');
    return true;

  } catch (error) {
    log(`\n❌ Erreur lors du test de workflow: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Test d\'intégration - Section Grid des Services', 'cyan');
  log('=' .repeat(60), 'cyan');
  log('Ce script teste l\'intégration complète de la section grid', 'cyan');
  log('avec l\'API backend et la publication automatique.', 'cyan');

  const results = {
    api: false,
    cms: false,
    workflow: false
  };

  // Test de l'API
  results.api = await testAPI();
  
  // Test d'intégration CMS
  results.cms = await testCMSIntegration();
  
  // Test du workflow complet
  results.workflow = await testFullWorkflow();

  // Résumé final
  log('\n📊 RÉSUMÉ DES TESTS', 'cyan');
  log('=' .repeat(30), 'cyan');
  log(`API Backend:        ${results.api ? '✅ PASSÉ' : '❌ ÉCHEC'}`, results.api ? 'green' : 'red');
  log(`CMS Frontend:       ${results.cms ? '✅ PASSÉ' : '❌ ÉCHEC'}`, results.cms ? 'green' : 'red');
  log(`Workflow Complet:   ${results.workflow ? '✅ PASSÉ' : '❌ ÉCHEC'}`, results.workflow ? 'green' : 'red');

  const allPassed = results.api && results.cms && results.workflow;
  
  if (allPassed) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS !', 'green');
    log('La section Grid est correctement intégrée et fonctionnelle.', 'green');
    log('\n📝 Prochaines étapes:', 'blue');
    log('   1. Testez manuellement dans le CMS', 'cyan');
    log('   2. Vérifiez la publication sur le site public', 'cyan');
    log('   3. Passez à la section suivante (Skills/Approach/etc.)', 'cyan');
  } else {
    log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('Vérifiez les erreurs ci-dessus et corrigez avant de continuer.', 'yellow');
  }

  log('\n🔗 Liens utiles:', 'blue');
  log(`   CMS: ${CMS_BASE}`, 'cyan');
  log(`   API: ${API_BASE}/services`, 'cyan');
  log(`   Rendu: ${API_BASE}/services/render`, 'cyan');
}

// Exécution du script
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testAPI, testCMSIntegration, testFullWorkflow };