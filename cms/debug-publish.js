#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier le problème de publication
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api/services';

async function debugPublish() {
  console.log('🔍 Diagnostic de la publication des services\n');

  try {
    // 1. Test de santé
    console.log('1. Test de santé de l\'API...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    console.log('✅ API accessible\n');

    // 2. Test de l'endpoint de test
    console.log('2. Test de l\'endpoint de test...');
    try {
      const testResponse = await fetch(`${API_BASE}/test-publish`);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ Endpoint de test fonctionne');
        console.log('   Sections disponibles:', testData.contentSections);
      } else {
        console.log('⚠️  Endpoint de test échoue:', testResponse.status);
      }
    } catch (testError) {
      console.log('❌ Erreur endpoint de test:', testError.message);
    }

    // 3. Test de récupération des données
    console.log('\n3. Test de récupération des données...');
    const dataResponse = await fetch(`${API_BASE}`);
    if (!dataResponse.ok) {
      throw new Error(`Data fetch failed: ${dataResponse.status}`);
    }
    const data = await dataResponse.json();
    console.log('✅ Données récupérées');
    console.log('   Hero title:', data.data.hero.title);
    console.log('   Services count:', data.data.services.services.length);

    // 4. Test de publication avec gestion d'erreur détaillée
    console.log('\n4. Test de publication...');
    try {
      const publishResponse = await fetch(`${API_BASE}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createBackup: false,
          versionName: 'Debug test - ' + new Date().toISOString()
        }),
      });

      console.log('   Status:', publishResponse.status);
      console.log('   Status Text:', publishResponse.statusText);

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        console.log('❌ Publication échouée');
        console.log('   Error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('   Error details:', errorJson);
        } catch (parseError) {
          console.log('   Raw error text:', errorText);
        }
      } else {
        const publishResult = await publishResponse.json();
        console.log('✅ Publication réussie');
        console.log('   Result:', publishResult);
      }
    } catch (publishError) {
      console.log('❌ Erreur de publication:', publishError.message);
      console.log('   Stack:', publishError.stack);
    }

    // 5. Vérification des chemins de fichiers
    console.log('\n5. Vérification des chemins de fichiers...');
    const fs = require('fs');
    const path = require('path');
    
    const possiblePaths = [
      path.join(__dirname, '..', 'portfolio2', 'www.victorberbel.work', 'services.html'),
      path.join(__dirname, 'portfolio2', 'www.victorberbel.work', 'services.html'),
      path.join(process.cwd(), '..', 'portfolio2', 'www.victorberbel.work', 'services.html'),
      path.join(process.cwd(), 'portfolio2', 'www.victorberbel.work', 'services.html')
    ];

    for (const testPath of possiblePaths) {
      const exists = fs.existsSync(testPath);
      console.log(`   ${exists ? '✅' : '❌'} ${testPath}`);
    }

  } catch (error) {
    console.error('\n❌ Diagnostic échoué:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le diagnostic
debugPublish();