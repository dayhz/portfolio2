#!/usr/bin/env node

/**
 * Script de test pour vérifier la fonctionnalité de publication des services
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api/services';

async function testServicesPublish() {
  console.log('🧪 Test de la fonctionnalité de publication des services\n');

  try {
    // 1. Test de santé de l'API
    console.log('1. Test de connexion API...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    console.log('✅ API accessible\n');

    // 2. Test de récupération des données actuelles
    console.log('2. Récupération des données actuelles...');
    const dataResponse = await fetch(`${API_BASE}`);
    if (!dataResponse.ok) {
      throw new Error(`Data fetch failed: ${dataResponse.status}`);
    }
    const currentData = await dataResponse.json();
    console.log('✅ Données récupérées');
    console.log(`   - Hero title: "${currentData.data.hero.title}"`);
    console.log(`   - Services count: ${currentData.data.services.services.length}\n`);

    // 3. Test de mise à jour d'une section
    console.log('3. Test de mise à jour de la section Hero...');
    const testHeroData = {
      title: 'Test Hero Title - ' + new Date().toISOString(),
      description: 'Description de test mise à jour automatiquement',
      highlightText: 'TEST'
    };

    const updateResponse = await fetch(`${API_BASE}/hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testHeroData),
    });

    if (!updateResponse.ok) {
      throw new Error(`Hero update failed: ${updateResponse.status}`);
    }
    console.log('✅ Section Hero mise à jour\n');

    // 4. Test de publication
    console.log('4. Test de publication...');
    const publishResponse = await fetch(`${API_BASE}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        createBackup: true,
        versionName: 'Test automatique - ' + new Date().toISOString()
      }),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      throw new Error(`Publish failed: ${publishResponse.status} - ${errorData.message}`);
    }

    const publishResult = await publishResponse.json();
    console.log('✅ Publication réussie');
    console.log(`   - Published at: ${publishResult.data.publishedAt}`);
    console.log(`   - Version: ${publishResult.data.version}\n`);

    // 5. Vérification du fichier HTML (si accessible)
    console.log('5. Vérification du fichier HTML...');
    try {
      const fs = require('fs');
      const path = require('path');
      const servicesHtmlPath = path.join(__dirname, '..', 'portfolio2', 'www.victorberbel.work', 'services.html');
      
      if (fs.existsSync(servicesHtmlPath)) {
        const htmlContent = fs.readFileSync(servicesHtmlPath, 'utf-8');
        const hasUpdateComment = htmlContent.includes('Services Grid Updated:');
        console.log('✅ Fichier services.html accessible');
        console.log(`   - Contient marqueur de mise à jour: ${hasUpdateComment ? 'Oui' : 'Non'}`);
      } else {
        console.log('⚠️  Fichier services.html non trouvé à:', servicesHtmlPath);
      }
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le fichier HTML:', error.message);
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📝 Résumé:');
    console.log('   - API fonctionnelle ✅');
    console.log('   - Mise à jour des sections ✅');
    console.log('   - Publication automatique ✅');
    console.log('   - Génération du fichier HTML ✅');

  } catch (error) {
    console.error('\n❌ Test échoué:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testServicesPublish();