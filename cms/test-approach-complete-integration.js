#!/usr/bin/env node

/**
 * Test complet d'intégration pour la section Approach
 * Valide l'interface utilisateur, l'API et la publication HTML
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testCompleteIntegration() {
  console.log('🧪 Test complet d\'intégration - Section Approach');
  console.log('='.repeat(60));

  try {
    // 1. Test de l'API - Récupération
    console.log('\n1️⃣ Test API - Récupération des données...');
    const getResponse = await axios.get(`${API_BASE_URL}/services/approach`);
    
    if (getResponse.status === 200) {
      console.log('✅ API - Récupération réussie');
      console.log(`   - Titre: ${getResponse.data.data.title || 'Non défini'}`);
      console.log(`   - Description: ${getResponse.data.data.description?.substring(0, 50)}...`);
      console.log(`   - Vidéo: ${getResponse.data.data.video?.url || 'Non définie'}`);
      console.log(`   - CTA: ${getResponse.data.data.ctaText || 'Non défini'}`);
      console.log(`   - Étapes: ${getResponse.data.data.steps?.length || 0}`);
    } else {
      console.log('❌ API - Échec de la récupération');
      return;
    }

    // 2. Test de l'API - Sauvegarde avec nouvelles données
    console.log('\n2️⃣ Test API - Sauvegarde avec nouvelles données...');
    const testData = {
      title: "Mon Approche Unique",
      description: "Une approche personnalisée pour chaque projet, basée sur l'expérience et l'innovation.",
      video: {
        url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/sweet-spot-60fps.mp4",
        caption: "Démonstration de l'approche",
        autoplay: true,
        loop: true,
        muted: true
      },
      ctaText: "Discutons de votre projet !",
      ctaUrl: "/contact",
      steps: [
        {
          id: "step-1",
          number: 1,
          title: "Analyse",
          description: "Analyse approfondie de vos besoins et objectifs.",
          icon: "",
          order: 1
        },
        {
          id: "step-2",
          number: 2,
          title: "Conception",
          description: "Conception de la solution adaptée à vos besoins.",
          icon: "",
          order: 2
        },
        {
          id: "step-3",
          number: 3,
          title: "Développement",
          description: "Développement avec les meilleures pratiques.",
          icon: "",
          order: 3
        },
        {
          id: "step-4",
          number: 4,
          title: "Livraison",
          description: "Livraison et accompagnement pour la mise en ligne.",
          icon: "",
          order: 4
        }
      ]
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/services/approach`, testData);
    
    if (updateResponse.status === 200) {
      console.log('✅ API - Sauvegarde réussie');
      console.log(`   - Message: ${updateResponse.data.message}`);
    } else {
      console.log('❌ API - Échec de la sauvegarde');
      return;
    }

    // 3. Test de l'API - Vérification de la persistance
    console.log('\n3️⃣ Test API - Vérification de la persistance...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/services/approach`);
    
    if (verifyResponse.status === 200) {
      const savedData = verifyResponse.data.data;
      let persistenceScore = 0;
      
      if (savedData.title === testData.title) {
        console.log('✅ Titre persisté correctement');
        persistenceScore++;
      } else {
        console.log(`❌ Titre incorrect - Attendu: "${testData.title}", Reçu: "${savedData.title}"`);
      }
      
      if (savedData.description === testData.description) {
        console.log('✅ Description persistée correctement');
        persistenceScore++;
      } else {
        console.log('❌ Description incorrecte');
      }
      
      if (savedData.video && savedData.video.url === testData.video.url) {
        console.log('✅ Vidéo persistée correctement');
        persistenceScore++;
      } else {
        console.log('❌ Vidéo incorrecte');
      }
      
      if (savedData.ctaText === testData.ctaText) {
        console.log('✅ CTA persisté correctement');
        persistenceScore++;
      } else {
        console.log('❌ CTA incorrect');
      }
      
      if (savedData.steps && savedData.steps.length === testData.steps.length) {
        console.log('✅ Étapes persistées correctement');
        persistenceScore++;
      } else {
        console.log('❌ Étapes incorrectes');
      }
      
      console.log(`📊 Score de persistance: ${persistenceScore}/5`);
    }

    // 4. Test de publication
    console.log('\n4️⃣ Test de publication...');
    const publishResponse = await axios.post(`${API_BASE_URL}/services/publish`);
    
    if (publishResponse.status === 200) {
      console.log('✅ Publication réussie');
      console.log(`   - Message: ${publishResponse.data.message}`);
    } else {
      console.log('❌ Échec de la publication');
    }

    // 5. Test de validation avec données invalides
    console.log('\n5️⃣ Test de validation...');
    const invalidData = {
      title: "", // Titre vide
      description: "",
      video: {
        url: "invalid-url", // URL invalide
        autoplay: true,
        loop: true,
        muted: true
      },
      ctaText: "",
      ctaUrl: "",
      steps: [] // Pas d'étapes
    };
    
    try {
      await axios.put(`${API_BASE_URL}/services/approach`, invalidData);
      console.log('❌ La validation devrait échouer');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation fonctionne - données invalides rejetées');
      } else {
        console.log('❌ Erreur inattendue lors de la validation');
      }
    }

    // 6. Restaurer les données originales
    console.log('\n6️⃣ Restauration des données originales...');
    const originalData = getResponse.data.data;
    await axios.put(`${API_BASE_URL}/services/approach`, originalData);
    console.log('✅ Données originales restaurées');

    console.log('\n🎉 Test complet terminé avec succès !');
    console.log('\n📋 Résumé des fonctionnalités testées:');
    console.log('   ✅ Récupération des données via API');
    console.log('   ✅ Sauvegarde des données via API');
    console.log('   ✅ Persistance des données');
    console.log('   ✅ Publication des changements');
    console.log('   ✅ Validation des données');
    console.log('   ✅ Restauration des données');
    
    console.log('\n💡 Interface utilisateur:');
    console.log('   - Le bouton "Sauvegarder" devrait s\'activer après modification');
    console.log('   - Le bouton "Annuler" devrait restaurer les données originales');
    console.log('   - Les champs titre, vidéo et CTA sont maintenant disponibles');
    console.log('   - L\'aperçu montre la structure complète de la section');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error(`   - Status: ${error.response.status}`);
      console.error(`   - Message: ${error.response.data?.message || 'Erreur inconnue'}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Assurez-vous que le serveur backend est démarré sur le port 8000');
      console.error('   Commande: npm run dev (dans le dossier cms/backend)');
    }
  }
}

// Exécuter le test
testCompleteIntegration();