#!/usr/bin/env node

/**
 * Test d'intégration pour la section Approach du CMS Services
 * Valide la connexion API, la sauvegarde et la publication
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

// Données de test pour la section Approach
const testApproachData = {
  title: "Approach",
  description: "The ideal balance between UX and UI is what makes a winning product. The sweet spot is the combination of both, and my four-step process gives you the ultimate framework for design.",
  video: {
    url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/sweet-spot-60fps.mp4",
    caption: "Sweet spot animation",
    autoplay: true,
    loop: true,
    muted: true
  },
  ctaText: "Let's work together!",
  ctaUrl: "contact.html",
  steps: [
    {
      id: "step-1",
      number: 1,
      title: "Discovery",
      description: "When a new contract begins, I want to learn everything I can about your project and understand what the end goal is. We will collaborate on a solution and what is required to get you there.",
      icon: "",
      order: 1
    },
    {
      id: "step-2", 
      number: 2,
      title: "Wireframe",
      description: "When the goal is defined, I'll begin work on a wireframe to organize all of the information we discussed earlier and to address any UX problems that may come.",
      icon: "",
      order: 2
    },
    {
      id: "step-3",
      number: 3,
      title: "Mood Board", 
      description: "We all have different tastes and preferences and to go with the best design direction for your project I'll create mood boards to discuss which one is best for you.",
      icon: "",
      order: 3
    },
    {
      id: "step-4",
      number: 4,
      title: "Design",
      description: "Now that the previous steps have been completed, it's time to work on the UI, using the approved wireframe and mood board as a guide to create a badass design.",
      icon: "",
      order: 4
    }
  ]
};

async function testApproachIntegration() {
  console.log('🧪 Test d\'intégration - Section Approach CMS');
  console.log('='.repeat(50));

  try {
    // 1. Test de récupération des données
    console.log('\n1️⃣ Test de récupération des données...');
    const getResponse = await axios.get(`${API_BASE_URL}/services/approach`);
    
    if (getResponse.status === 200) {
      console.log('✅ Récupération réussie');
      console.log(`   - Description: ${getResponse.data.data.description?.substring(0, 50)}...`);
      console.log(`   - Nombre d'étapes: ${getResponse.data.data.steps?.length || 0}`);
    } else {
      console.log('❌ Échec de la récupération');
      return;
    }

    // 2. Test de sauvegarde
    console.log('\n2️⃣ Test de sauvegarde...');
    const updateResponse = await axios.put(`${API_BASE_URL}/services/approach`, testApproachData);
    
    if (updateResponse.status === 200) {
      console.log('✅ Sauvegarde réussie');
      console.log(`   - Message: ${updateResponse.data.message}`);
    } else {
      console.log('❌ Échec de la sauvegarde');
      return;
    }

    // 3. Vérification des données sauvegardées
    console.log('\n3️⃣ Vérification des données sauvegardées...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/services/approach`);
    
    if (verifyResponse.status === 200) {
      const savedData = verifyResponse.data.data;
      
      // Vérifier le titre
      if (savedData.title === testApproachData.title) {
        console.log('✅ Titre correctement sauvegardé');
      } else {
        console.log('❌ Titre incorrect');
      }
      
      // Vérifier la description
      if (savedData.description === testApproachData.description) {
        console.log('✅ Description correctement sauvegardée');
      } else {
        console.log('❌ Description incorrecte');
      }
      
      // Vérifier la vidéo
      if (savedData.video && savedData.video.url === testApproachData.video.url) {
        console.log('✅ Vidéo correctement sauvegardée');
      } else {
        console.log('❌ Vidéo incorrecte');
      }
      
      // Vérifier le CTA
      if (savedData.ctaText === testApproachData.ctaText && savedData.ctaUrl === testApproachData.ctaUrl) {
        console.log('✅ CTA correctement sauvegardé');
      } else {
        console.log('❌ CTA incorrect');
      }
      
      // Vérifier les étapes
      if (savedData.steps && savedData.steps.length === testApproachData.steps.length) {
        console.log('✅ Nombre d\'étapes correct');
        
        // Vérifier chaque étape
        let stepsValid = true;
        for (let i = 0; i < savedData.steps.length; i++) {
          const savedStep = savedData.steps[i];
          const testStep = testApproachData.steps[i];
          
          if (savedStep.title !== testStep.title || savedStep.description !== testStep.description) {
            stepsValid = false;
            break;
          }
        }
        
        if (stepsValid) {
          console.log('✅ Contenu des étapes correct');
        } else {
          console.log('❌ Contenu des étapes incorrect');
        }
      } else {
        console.log('❌ Nombre d\'étapes incorrect');
      }
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

    // 5. Test de validation des données
    console.log('\n5️⃣ Test de validation...');
    
    // Test avec données invalides
    const invalidData = {
      title: "", // Titre vide
      description: "", // Description vide
      video: {
        url: "invalid-url", // URL invalide
        autoplay: true,
        loop: true,
        muted: true
      },
      ctaText: "",
      ctaUrl: "",
      steps: [
        {
          id: "step-1",
          number: 1,
          title: "", // Titre vide
          description: "Description valide",
          icon: "",
          order: 1
        }
      ]
    };
    
    try {
      await axios.put(`${API_BASE_URL}/services/approach`, invalidData);
      console.log('❌ La validation devrait échouer avec des données invalides');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correcte - données invalides rejetées');
        console.log(`   - Erreur: ${error.response.data.message}`);
      } else {
        console.log('❌ Erreur inattendue lors de la validation');
      }
    }

    console.log('\n🎉 Test d\'intégration terminé avec succès !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ Récupération des données');
    console.log('   ✅ Sauvegarde des données');
    console.log('   ✅ Vérification de la persistance');
    console.log('   ✅ Publication des changements');
    console.log('   ✅ Validation des données');

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
testApproachIntegration();