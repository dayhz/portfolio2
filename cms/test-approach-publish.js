#!/usr/bin/env node

/**
 * Test de publication HTML pour la section Approach
 * Valide que les modifications CMS sont correctement appliquées au HTML
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';
const HTML_FILE_PATH = path.join(__dirname, '../portfolio2/www.victorberbel.work/services.html');

// Données de test pour la section Approach
const testApproachData = {
  title: "Mon Processus de Travail",
  description: "L'équilibre idéal entre UX et UI est ce qui fait un produit gagnant. Le sweet spot est la combinaison des deux, et mon processus en quatre étapes vous donne le framework ultime pour le design.",
  video: {
    url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/sweet-spot-60fps-updated.mp4",
    caption: "Animation du sweet spot mise à jour",
    autoplay: true,
    loop: true,
    muted: true
  },
  ctaText: "Travaillons ensemble !",
  ctaUrl: "/contact",
  steps: [
    {
      id: "step-1",
      number: 1,
      title: "Découverte",
      description: "Quand un nouveau contrat commence, je veux tout apprendre sur votre projet et comprendre quel est l'objectif final. Nous collaborerons sur une solution et ce qui est requis pour vous y amener.",
      icon: "",
      order: 1
    },
    {
      id: "step-2", 
      number: 2,
      title: "Wireframe",
      description: "Quand l'objectif est défini, je commencerai à travailler sur un wireframe pour organiser toutes les informations discutées plus tôt et adresser les problèmes UX qui peuvent survenir.",
      icon: "",
      order: 2
    },
    {
      id: "step-3",
      number: 3,
      title: "Mood Board", 
      description: "Nous avons tous des goûts et préférences différents et pour aller avec la meilleure direction de design pour votre projet, je créerai des mood boards pour discuter lequel est le meilleur pour vous.",
      icon: "",
      order: 3
    },
    {
      id: "step-4",
      number: 4,
      title: "Design",
      description: "Maintenant que les étapes précédentes ont été complétées, il est temps de travailler sur l'UI, en utilisant le wireframe approuvé et le mood board comme guide pour créer un design génial.",
      icon: "",
      order: 4
    }
  ]
};

async function testApproachPublish() {
  console.log('🧪 Test de publication HTML - Section Approach');
  console.log('='.repeat(50));

  try {
    // 1. Sauvegarder les données de test
    console.log('\n1️⃣ Sauvegarde des données de test...');
    const updateResponse = await axios.put(`${API_BASE_URL}/services/approach`, testApproachData);
    
    if (updateResponse.status === 200) {
      console.log('✅ Données sauvegardées');
    } else {
      console.log('❌ Échec de la sauvegarde');
      return;
    }

    // 2. Lire le HTML avant publication
    console.log('\n2️⃣ Lecture du HTML avant publication...');
    const htmlBefore = fs.readFileSync(HTML_FILE_PATH, 'utf8');
    
    // Extraire les éléments actuels
    const titleMatch = htmlBefore.match(/<div class="u-text-style-h2"[^>]*>\s*([^<]+)\s*<\/div>/);
    const descriptionMatch = htmlBefore.match(/<div class="u-text-style-big">\s*([^<]+)\s*<\/div>/);
    const videoMatch = htmlBefore.match(/<source src="([^"]+)"/);
    const ctaMatch = htmlBefore.match(/<div class="text-link is-footer">\s*([^<]+)\s*<\/div>/);
    
    console.log('📄 Contenu HTML actuel:');
    console.log(`   - Titre: ${titleMatch ? titleMatch[1].trim() : 'Non trouvé'}`);
    console.log(`   - Description: ${descriptionMatch ? descriptionMatch[1].substring(0, 50) + '...' : 'Non trouvé'}`);
    console.log(`   - Vidéo: ${videoMatch ? videoMatch[1] : 'Non trouvé'}`);
    console.log(`   - CTA: ${ctaMatch ? ctaMatch[1].trim() : 'Non trouvé'}`);

    // 3. Publier les changements
    console.log('\n3️⃣ Publication des changements...');
    const publishResponse = await axios.post(`${API_BASE_URL}/services/publish`);
    
    if (publishResponse.status === 200) {
      console.log('✅ Publication réussie');
    } else {
      console.log('❌ Échec de la publication');
      return;
    }

    // 4. Attendre un peu pour que les changements soient appliqués
    console.log('\n4️⃣ Attente de l\'application des changements...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Lire le HTML après publication
    console.log('\n5️⃣ Vérification du HTML après publication...');
    const htmlAfter = fs.readFileSync(HTML_FILE_PATH, 'utf8');
    
    // Vérifier les changements
    let changesDetected = 0;
    
    // Vérifier le titre
    const newTitleMatch = htmlAfter.match(/<div class="u-text-style-h2"[^>]*>\s*([^<]+)\s*<\/div>/);
    if (newTitleMatch && newTitleMatch[1].trim() === testApproachData.title) {
      console.log('✅ Titre mis à jour correctement');
      changesDetected++;
    } else {
      console.log(`❌ Titre non mis à jour. Attendu: "${testApproachData.title}", Trouvé: "${newTitleMatch ? newTitleMatch[1].trim() : 'Non trouvé'}"`);
    }
    
    // Vérifier la description
    const newDescriptionMatch = htmlAfter.match(/<div class="u-text-style-big">\s*([^<]+)\s*<\/div>/);
    if (newDescriptionMatch && newDescriptionMatch[1].includes(testApproachData.description.substring(0, 30))) {
      console.log('✅ Description mise à jour correctement');
      changesDetected++;
    } else {
      console.log('❌ Description non mise à jour');
    }
    
    // Vérifier la vidéo
    const newVideoMatch = htmlAfter.match(/<source src="([^"]+)"/);
    if (newVideoMatch && newVideoMatch[1] === testApproachData.video.url) {
      console.log('✅ Vidéo mise à jour correctement');
      changesDetected++;
    } else {
      console.log(`❌ Vidéo non mise à jour. Attendu: "${testApproachData.video.url}", Trouvé: "${newVideoMatch ? newVideoMatch[1] : 'Non trouvé'}"`);
    }
    
    // Vérifier le CTA
    const newCtaMatch = htmlAfter.match(/<div class="text-link is-footer">\s*([^<]+)\s*<\/div>/);
    if (newCtaMatch && newCtaMatch[1].trim() === testApproachData.ctaText) {
      console.log('✅ CTA mis à jour correctement');
      changesDetected++;
    } else {
      console.log(`❌ CTA non mis à jour. Attendu: "${testApproachData.ctaText}", Trouvé: "${newCtaMatch ? newCtaMatch[1].trim() : 'Non trouvé'}"`);
    }

    // Vérifier les étapes
    const stepTitles = [...htmlAfter.matchAll(/<div class="u-text-style-big u-color-dark">\s*([^<]+)\s*<\/div>/g)];
    if (stepTitles.length >= testApproachData.steps.length) {
      let stepsUpdated = 0;
      for (let i = 0; i < testApproachData.steps.length; i++) {
        if (stepTitles[i] && stepTitles[i][1].trim() === testApproachData.steps[i].title) {
          stepsUpdated++;
        }
      }
      if (stepsUpdated === testApproachData.steps.length) {
        console.log('✅ Étapes mises à jour correctement');
        changesDetected++;
      } else {
        console.log(`❌ Étapes partiellement mises à jour (${stepsUpdated}/${testApproachData.steps.length})`);
      }
    } else {
      console.log('❌ Étapes non trouvées dans le HTML');
    }

    console.log('\n🎉 Test de publication terminé !');
    console.log(`📊 Résultat: ${changesDetected}/5 éléments mis à jour correctement`);
    
    if (changesDetected === 5) {
      console.log('✅ Publication HTML parfaitement fonctionnelle !');
    } else if (changesDetected >= 3) {
      console.log('⚠️ Publication HTML partiellement fonctionnelle');
    } else {
      console.log('❌ Publication HTML nécessite des corrections');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error(`   - Status: ${error.response.status}`);
      console.error(`   - Message: ${error.response.data?.message || 'Erreur inconnue'}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Assurez-vous que le serveur backend est démarré sur le port 8000');
    }
  }
}

// Exécuter le test
testApproachPublish();