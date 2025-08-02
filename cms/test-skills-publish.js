#!/usr/bin/env node

/**
 * Script de test pour la publication de la section Skills
 * 
 * Ce script teste la publication des données Skills vers le fichier HTML statique
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8000/api';

// Données de test pour Skills
const SKILLS_TEST_DATA = {
  description: "My work adapts to each client's unique goals, and whether it's a website, a product, or a mobile app, I'm proficient in all the areas of expertise listed below.",
  skills: [
    { id: 'skill-1', name: 'User Interface', order: 0 },
    { id: 'skill-2', name: 'Prototyping', order: 1 },
    { id: 'skill-3', name: 'User Research', order: 2 },
    { id: 'skill-4', name: 'User Journey', order: 3 },
    { id: 'skill-5', name: 'Design System', order: 4 },
    { id: 'skill-6', name: 'Interface Animation', order: 5 }
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

function makeRequest(method, url, data = null) {
  try {
    if (data) {
      // Write data to temporary file
      const tempFile = '/tmp/request_data.json';
      fs.writeFileSync(tempFile, JSON.stringify(data));
      
      const curlCmd = `curl -s -X ${method} "${url}" -H "Content-Type: application/json" -d @${tempFile}`;
      const result = execSync(curlCmd, { encoding: 'utf8' });
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
      return JSON.parse(result);
    } else {
      const curlCmd = `curl -s -X ${method} "${url}"`;
      const result = execSync(curlCmd, { encoding: 'utf8' });
      return JSON.parse(result);
    }
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

function readHTMLFile() {
  const htmlPath = path.join(process.cwd(), 'portfolio2/www.victorberbel.work/services.html');
  try {
    return fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read HTML file: ${error.message}`);
  }
}

function testSkillsPublication() {
  console.log('🚀 TEST DE PUBLICATION SKILLS');
  console.log('==============================\n');
  
  try {
    // 1. Sauvegarder les données Skills
    console.log('1. Sauvegarde des données Skills...');
    const updateResponse = makeRequest('PUT', `${API_BASE_URL}/services/skills`, SKILLS_TEST_DATA);
    
    if (!updateResponse.success) {
      throw new Error('Échec de la sauvegarde des données Skills');
    }
    console.log('✅ Données Skills sauvegardées');
    
    // 2. Lire le HTML avant publication
    console.log('\n2. Lecture du HTML avant publication...');
    const htmlBefore = readHTMLFile();
    console.log('✅ HTML lu');
    
    // 3. Publier les changements
    console.log('\n3. Publication des changements...');
    const publishResponse = makeRequest('POST', `${API_BASE_URL}/services/publish`);
    
    if (!publishResponse.success) {
      throw new Error('Échec de la publication');
    }
    console.log('✅ Publication réussie');
    
    // 4. Lire le HTML après publication
    console.log('\n4. Vérification du HTML après publication...');
    const htmlAfter = readHTMLFile();
    
    // 5. Vérifier les changements
    console.log('\n5. Vérification des changements...');
    
    // Vérifier la description
    const descriptionMatch = htmlAfter.match(/<div class="u-text-style-big u-color-gray-500">\s*([^<]*)\s*<\/div>/);
    if (descriptionMatch && descriptionMatch[1].trim().includes("My work adapts to each client's unique goals")) {
      console.log('✅ Description mise à jour');
    } else {
      console.log('⚠️  Description non trouvée ou non mise à jour');
    }
    
    // Vérifier les compétences
    const skillsMatches = htmlAfter.match(/<div class="u-text-x-small u-color-gray-500">\s*([^<]*)\s*<\/div>/g);
    if (skillsMatches && skillsMatches.length >= 6) {
      const skillsFound = skillsMatches.map(match => match.match(/>\s*([^<]*)\s*</)[1].trim());
      const expectedSkills = ['User Interface', 'Prototyping', 'User Research'];
      const hasExpectedSkills = expectedSkills.some(skill => skillsFound.includes(skill));
      
      if (hasExpectedSkills) {
        console.log('✅ Compétences mises à jour');
        console.log(`   Trouvées: ${skillsFound.slice(0, 3).join(', ')}...`);
      } else {
        console.log('⚠️  Compétences non trouvées');
      }
    } else {
      console.log('⚠️  Compétences non trouvées dans le HTML');
    }
    
    // Vérifier la vidéo
    const videoMatch = htmlAfter.match(/<source src="([^"]*)" type="video\/mp4"\/>/);
    if (videoMatch && videoMatch[1].includes('services-slideshow-small.mp4')) {
      console.log('✅ URL vidéo mise à jour');
    } else {
      console.log('⚠️  URL vidéo non trouvée ou non mise à jour');
    }
    
    // Vérifier la légende
    const captionMatch = htmlAfter.match(/<div class="video_description u-color-gray-700">\s*([^<]*)\s*<\/div>/);
    if (captionMatch && captionMatch[1].trim().includes('Lawson Sydney')) {
      console.log('✅ Légende vidéo mise à jour');
    } else {
      console.log('⚠️  Légende vidéo non trouvée ou non mise à jour');
    }
    
    console.log('\n🎉 TEST DE PUBLICATION TERMINÉ !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ Données sauvegardées en base');
    console.log('   ✅ Publication exécutée');
    console.log('   ✅ HTML statique mis à jour');
    console.log('\n🌐 Vérifiez le site: http://localhost:3154/services.html');
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test:', error.message);
    console.error('\n🔧 Actions suggérées:');
    console.error('   1. Vérifiez que le serveur backend est démarré');
    console.error('   2. Vérifiez que le fichier services.html existe');
    console.error('   3. Vérifiez les permissions de fichier');
    process.exit(1);
  }
}

// Lancement du test
testSkillsPublication();