#!/usr/bin/env node

/**
 * Test de publication pour TestimonialsEditor
 * Vérifie que les modifications se répercutent sur le site public
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Test Publication TestimonialsEditor - Démarrage');

// Vérifier le fichier services.html actuel
const servicesHtmlPath = path.join(__dirname, '../portfolio2/www.victorberbel.work/services.html');

if (!fs.existsSync(servicesHtmlPath)) {
  console.error('❌ Fichier services.html non trouvé');
  process.exit(1);
}

const servicesHtmlContent = fs.readFileSync(servicesHtmlPath, 'utf8');

console.log('\n📄 Analyse du fichier services.html actuel...\n');

// Analyser la structure des témoignages existants
const testimonialMatches = servicesHtmlContent.match(/<div class="testimonials-card"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g);

if (testimonialMatches) {
  console.log(`✅ ${testimonialMatches.length} témoignages trouvés dans le HTML statique`);
  
  testimonialMatches.forEach((testimonial, index) => {
    // Extraire le texte du témoignage
    const textMatch = testimonial.match(/<div class="testimonial-text[^>]*">\s*([^<]+)/);
    const nameMatch = testimonial.match(/<div class="u-text-style-big">\s*([^<]+)/);
    
    if (textMatch && nameMatch) {
      console.log(`   ${index + 1}. ${nameMatch[1].trim()}`);
      console.log(`      "${textMatch[1].trim().substring(0, 50)}..."`);
    }
  });
} else {
  console.log('❌ Aucun témoignage trouvé dans le HTML statique');
}

console.log('\n🔍 Vérification de la structure HTML...\n');

// Tests de structure HTML
const structureTests = [
  {
    name: 'Section testimonials présente',
    test: () => servicesHtmlContent.includes('testimonials-card'),
    description: 'Vérifie que la section testimonials existe'
  },
  {
    name: 'Slider de témoignages',
    test: () => servicesHtmlContent.includes('clientes-slide') && servicesHtmlContent.includes('w-slider-mask'),
    description: 'Vérifie que le slider est présent'
  },
  {
    name: 'Structure des cartes',
    test: () => servicesHtmlContent.includes('testimonials-card-left') && servicesHtmlContent.includes('testimonials-card-right'),
    description: 'Vérifie la structure des cartes de témoignages'
  },
  {
    name: 'Avatars des auteurs',
    test: () => servicesHtmlContent.includes('testimonials-avatar'),
    description: 'Vérifie que les avatars sont présents'
  },
  {
    name: 'Images de projets',
    test: () => servicesHtmlContent.includes('testimonials-person-thumb'),
    description: 'Vérifie que les images de projets sont présentes'
  }
];

let structurePassed = 0;
let structureFailed = 0;

structureTests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${test.name}`);
      console.log(`   ${test.description}`);
      structurePassed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   ${test.description}`);
      structureFailed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} (Erreur: ${error.message})`);
    structureFailed++;
  }
  console.log('');
});

console.log('🔧 Vérification du backend...\n');

// Vérifier le service backend
const servicesServicePath = path.join(__dirname, 'backend/src/services/servicesService.ts');
const servicesServiceContent = fs.readFileSync(servicesServicePath, 'utf8');

const backendTests = [
  {
    name: 'Fonction publishContent existe',
    test: () => servicesServiceContent.includes('publishContent'),
    description: 'Vérifie que la fonction de publication existe'
  },
  {
    name: 'Gestion des testimonials',
    test: () => servicesServiceContent.includes('TestimonialsData') && servicesServiceContent.includes('testimonials'),
    description: 'Vérifie que les testimonials sont gérés'
  },
  {
    name: 'TODO publication identifié',
    test: () => servicesServiceContent.includes('TODO') && servicesServiceContent.includes('publishing'),
    description: 'Vérifie que le TODO pour la publication est identifié'
  }
];

let backendPassed = 0;
let backendFailed = 0;

backendTests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${test.name}`);
      console.log(`   ${test.description}`);
      backendPassed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   ${test.description}`);
      backendFailed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} (Erreur: ${error.message})`);
    backendFailed++;
  }
  console.log('');
});

console.log('💡 Analyse des besoins...\n');

// Analyser ce qui manque pour la publication
console.log('📋 Ce qui est nécessaire pour la publication des testimonials:');
console.log('');
console.log('1. 🔧 Fonction de génération HTML');
console.log('   • Transformer les données testimonials en HTML');
console.log('   • Respecter la structure existante du slider');
console.log('   • Gérer les avatars et images de projets');
console.log('');
console.log('2. 📝 Mise à jour du fichier services.html');
console.log('   • Remplacer la section testimonials existante');
console.log('   • Préserver le reste du HTML');
console.log('   • Maintenir les classes CSS et animations');
console.log('');
console.log('3. 🔄 Intégration dans publishContent()');
console.log('   • Appeler la génération HTML lors de la publication');
console.log('   • Gérer les erreurs de génération');
console.log('   • Invalider les caches appropriés');
console.log('');

// Proposer une solution
console.log('🎯 Solution proposée:');
console.log('');
console.log('1. Créer une fonction generateTestimonialsHTML()');
console.log('2. Intégrer dans servicesService.publishContent()');
console.log('3. Tester avec des données de test');
console.log('4. Valider que les modifications apparaissent sur le site');
console.log('');

// Résultats
const totalTests = structureTests.length + backendTests.length;
const totalPassed = structurePassed + backendPassed;
const totalFailed = structureFailed + backendFailed;

console.log('📊 Résultats de l\'analyse:');
console.log(`📄 Structure HTML: ${structurePassed}/${structureTests.length} OK`);
console.log(`🔧 Backend: ${backendPassed}/${backendTests.length} OK`);
console.log(`✅ Total: ${totalPassed}/${totalTests} OK`);
console.log(`📈 Taux de réussite: ${Math.round((totalPassed / totalTests) * 100)}%`);

if (totalPassed === totalTests) {
  console.log('\n🎉 Structure prête ! Il faut maintenant implémenter la génération HTML');
} else {
  console.log('\n⚠️  Quelques éléments à vérifier avant d\'implémenter la publication');
}

console.log('\n🏁 Analyse terminée');

// Retourner le code de sortie approprié
process.exit(totalFailed > 0 ? 1 : 0);