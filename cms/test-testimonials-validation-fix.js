#!/usr/bin/env node

/**
 * Test de diagnostic pour identifier pourquoi les changements ne se répercutent pas
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔍 DIAGNOSTIC - Pourquoi les changements ne se répercutent pas ?');
console.log('='.repeat(70));

async function diagnosticPublication() {
  try {
    console.log('\n📋 1. VÉRIFICATION DU BACKEND...\n');

    // Lire le servicesService après autofix
    const servicesServicePath = path.join(__dirname, 'backend/src/services/servicesService.ts');
    const servicesServiceContent = await fs.readFile(servicesServicePath, 'utf8');

    console.log('🔧 Contenu de publishContent():');
    
    // Extraire la fonction publishContent
    const publishContentMatch = servicesServiceContent.match(/async publishContent\(\)[\s\S]*?(?=\n  [a-zA-Z]|\n})/);
    
    if (publishContentMatch) {
      console.log('✅ Fonction publishContent trouvée');
      const publishContentCode = publishContentMatch[0];
      
      // Vérifier si elle contient notre code de génération HTML
      const checks = [
        { name: 'Import testimonialsHtmlGenerator', check: servicesServiceContent.includes('testimonialsHtmlGenerator') },
        { name: 'Appel getTestimonialsData', check: publishContentCode.includes('getTestimonialsData') },
        { name: 'Appel updateServicesHtml', check: publishContentCode.includes('updateServicesHtml') },
        { name: 'Path vers services.html', check: publishContentCode.includes('services.html') }
      ];

      checks.forEach(check => {
        if (check.check) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name} - MANQUANT !`);
        }
      });

      console.log('\n📄 Code actuel de publishContent:');
      console.log('-'.repeat(50));
      console.log(publishContentCode.substring(0, 500) + '...');
      console.log('-'.repeat(50));

    } else {
      console.log('❌ Fonction publishContent non trouvée !');
    }

    console.log('\n📋 2. VÉRIFICATION DU GÉNÉRATEUR HTML...\n');

    // Vérifier le générateur HTML
    const generatorPath = path.join(__dirname, 'backend/src/services/testimonialsHtmlGenerator.ts');
    
    try {
      await fs.access(generatorPath);
      console.log('✅ TestimonialsHtmlGenerator existe');
      
      const generatorContent = await fs.readFile(generatorPath, 'utf8');
      
      if (generatorContent.includes('updateServicesHtml')) {
        console.log('✅ Fonction updateServicesHtml présente');
      } else {
        console.log('❌ Fonction updateServicesHtml manquante');
      }

    } catch (error) {
      console.log('❌ TestimonialsHtmlGenerator manquant !');
    }

    console.log('\n📋 3. TEST DE LA CHAÎNE COMPLÈTE...\n');

    // Simuler un appel à l'API
    console.log('🔄 Simulation d\'un appel API...');

    // Vérifier si l'API routes inclut testimonials
    const routesPath = path.join(__dirname, 'backend/src/routes/services.ts');
    const routesContent = await fs.readFile(routesPath, 'utf8');

    if (routesContent.includes('testimonials')) {
      console.log('✅ Route testimonials présente dans l\'API');
    } else {
      console.log('❌ Route testimonials manquante dans l\'API');
    }

    // Vérifier la fonction publish dans les routes
    if (routesContent.includes('publish')) {
      console.log('✅ Route publish présente');
    } else {
      console.log('❌ Route publish manquante');
    }

    console.log('\n📋 4. VÉRIFICATION DU FRONTEND...\n');

    // Vérifier ServicesPage
    const servicesPagePath = path.join(__dirname, 'frontend/src/pages/ServicesPage.tsx');
    const servicesPageContent = await fs.readFile(servicesPagePath, 'utf8');

    const frontendChecks = [
      { name: 'handleTestimonialsSave existe', check: servicesPageContent.includes('handleTestimonialsSave') },
      { name: 'Appel servicesAPI.publish', check: servicesPageContent.includes('servicesAPI.publish') },
      { name: 'Section testimonials dans le rendu', check: servicesPageContent.includes('activeSection === \'testimonials\'') }
    ];

    frontendChecks.forEach(check => {
      if (check.check) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name} - PROBLÈME !`);
      }
    });

    console.log('\n📋 5. DIAGNOSTIC DU PROBLÈME...\n');

    // Analyser les problèmes potentiels
    const problems = [];

    if (!servicesServiceContent.includes('testimonialsHtmlGenerator')) {
      problems.push('Le servicesService n\'importe pas le testimonialsHtmlGenerator');
    }

    if (!servicesServiceContent.includes('updateServicesHtml')) {
      problems.push('La fonction publishContent n\'appelle pas updateServicesHtml');
    }

    if (problems.length > 0) {
      console.log('🚨 PROBLÈMES IDENTIFIÉS:');
      problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem}`);
      });

      console.log('\n🔧 SOLUTION:');
      console.log('   Il faut corriger la fonction publishContent dans servicesService.ts');
      console.log('   L\'autofix de Kiro a probablement supprimé nos modifications.');
      
      return false;
    } else {
      console.log('✅ Tous les composants semblent en place');
      console.log('   Le problème pourrait être ailleurs...');
      
      return true;
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return false;
  }
}

// Exécuter le diagnostic
diagnosticPublication()
  .then(success => {
    console.log('\n🏁 Diagnostic terminé');
    if (!success) {
      console.log('\n💡 PROCHAINE ÉTAPE: Corriger la fonction publishContent');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });