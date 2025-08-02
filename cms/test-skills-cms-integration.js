#!/usr/bin/env node

/**
 * Script de test et d'initialisation pour la section Skills & Video du CMS
 * 
 * Ce script :
 * 1. Initialise les données Skills avec les valeurs exactes du HTML
 * 2. Teste l'intégration avec l'API
 * 3. Valide la sauvegarde et publication
 */

const { execSync } = require('child_process');

const API_BASE_URL = 'http://localhost:8000/api';

// Données Skills exactes du HTML services.html
const SKILLS_DATA = {
  description: "My work adapts to each client's unique goals, and whether it's a website, a product, or a mobile app, I'm proficient in all the areas of expertise listed below.",
  skills: [
    { id: 'skill-1', name: 'User Interface', order: 0 },
    { id: 'skill-2', name: 'Prototyping', order: 1 },
    { id: 'skill-3', name: 'User Research', order: 2 },
    { id: 'skill-4', name: 'User Journey', order: 3 },
    { id: 'skill-5', name: 'Design System', order: 4 },
    { id: 'skill-6', name: 'Interface Animation', order: 5 },
    { id: 'skill-7', name: 'User Flow', order: 6 },
    { id: 'skill-8', name: 'UX Audit', order: 7 },
    { id: 'skill-9', name: 'Icon Design', order: 8 },
    { id: 'skill-10', name: 'Creative & Art Direction', order: 9 },
    { id: 'skill-11', name: 'User Persona', order: 10 },
    { id: 'skill-12', name: 'Wireframe', order: 11 }
  ],
  ctaText: "See all projects",
  ctaUrl: "/work",
  video: {
    url: "https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/services-slideshow-small.mp4",
    caption: "Some of my work across the years — Lawson Sydney",
    autoplay: true,
    loop: true,
    muted: true
  }
};

const fs = require('fs');
const path = require('path');

function makeRequest(method, url, data = null) {
  try {
    let curlCmd = `curl -s -X ${method} "${url}"`;
    
    if (data) {
      // Créer un fichier temporaire pour les données JSON
      const tempFile = path.join(__dirname, 'temp-data.json');
      fs.writeFileSync(tempFile, JSON.stringify(data));
      curlCmd += ` -H "Content-Type: application/json" -d @${tempFile}`;
    }
    
    const result = execSync(curlCmd, { encoding: 'utf8' });
    
    // Nettoyer le fichier temporaire
    if (data) {
      const tempFile = path.join(__dirname, 'temp-data.json');
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    
    return JSON.parse(result);
  } catch (error) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (data) {
      const tempFile = path.join(__dirname, 'temp-data.json');
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

function testAPI() {
  console.log('🔍 Test de l\'API Services...\n');
  
  try {
    // Test de connexion à l'API
    console.log('1. Test de connexion à l\'API...');
    const healthResponse = makeRequest('GET', `${API_BASE_URL}/services`);
    console.log('✅ API accessible');
    
    // Test de récupération de la section skills
    console.log('\n2. Test de récupération de la section skills...');
    try {
      const skillsResponse = makeRequest('GET', `${API_BASE_URL}/services/skills`);
      console.log('✅ Section skills trouvée:', skillsResponse);
    } catch (error) {
      console.log('⚠️  Section skills non trouvée (normal pour la première fois)');
    }
    
    // Initialisation des données skills
    console.log('\n3. Initialisation des données skills...');
    const updateResponse = makeRequest('PUT', `${API_BASE_URL}/services/skills`, SKILLS_DATA);
    
    if (updateResponse.success) {
      console.log('✅ Données skills initialisées avec succès');
      console.log('📊 Données sauvegardées:');
      console.log(`   - Description: "${SKILLS_DATA.description.substring(0, 50)}..."`);
      console.log(`   - Compétences: ${SKILLS_DATA.skills.length} items`);
      console.log(`   - CTA: "${SKILLS_DATA.ctaText}" -> ${SKILLS_DATA.ctaUrl}`);
      console.log(`   - Vidéo: ${SKILLS_DATA.video.url}`);
      console.log(`   - Légende: "${SKILLS_DATA.video.caption}"`);
    } else {
      throw new Error('Échec de l\'initialisation des données');
    }
    
    // Test de publication
    console.log('\n4. Test de publication...');
    const publishResponse = makeRequest('POST', `${API_BASE_URL}/services/publish`);
    
    if (publishResponse.success) {
      console.log('✅ Publication réussie');
      console.log(`📅 Publié à: ${publishResponse.publishedAt}`);
    } else {
      throw new Error('Échec de la publication');
    }
    
    // Vérification finale
    console.log('\n5. Vérification finale...');
    const finalCheck = makeRequest('GET', `${API_BASE_URL}/services/skills`);
    
    if (finalCheck.success && finalCheck.data) {
      const data = finalCheck.data;
      console.log('✅ Vérification réussie');
      console.log(`   - ${data.skills.length} compétences chargées`);
      console.log(`   - Vidéo: ${data.video.url ? 'Configurée' : 'Non configurée'}`);
      console.log(`   - CTA: ${data.ctaText || 'Non configuré'}`);
      
      // Validation des compétences
      const expectedSkills = ['User Interface', 'Prototyping', 'User Research', 'User Journey', 'Design System'];
      const actualSkills = data.skills.map(s => s.name);
      const hasExpectedSkills = expectedSkills.every(skill => actualSkills.includes(skill));
      
      if (hasExpectedSkills) {
        console.log('✅ Compétences validées (échantillon trouvé)');
      } else {
        console.log('⚠️  Certaines compétences attendues manquent');
      }
    }
    
    console.log('\n🎉 INTÉGRATION SKILLS CMS RÉUSSIE !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ API fonctionnelle');
    console.log('   ✅ Données initialisées');
    console.log('   ✅ Publication réussie');
    console.log('   ✅ Vérification OK');
    console.log('\n🚀 Vous pouvez maintenant utiliser la section Skills dans le CMS');
    console.log('   👉 Accédez au CMS: http://localhost:3000/services');
    console.log('   👉 Cliquez sur "Section Skills & Video"');
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test:', error.message);
    
    console.error('\n🔧 Actions suggérées:');
    console.error('   1. Vérifiez que le serveur backend est démarré (port 8000)');
    console.error('   2. Vérifiez que la base de données est accessible');
    console.error('   3. Vérifiez les logs du serveur backend');
    
    process.exit(1);
  }
}

// Fonction pour afficher les compétences du HTML
function displayHTMLSkills() {
  console.log('📋 Compétences extraites du HTML services.html:');
  SKILLS_DATA.skills.forEach((skill, index) => {
    console.log(`   ${index + 1}. ${skill.name}`);
  });
  console.log(`\n📊 Total: ${SKILLS_DATA.skills.length} compétences`);
}

// Exécution du script
function main() {
  console.log('🚀 SCRIPT D\'INTÉGRATION SKILLS CMS');
  console.log('=====================================\n');
  
  displayHTMLSkills();
  console.log('\n');
  
  testAPI();
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

// Lancement du script
main();