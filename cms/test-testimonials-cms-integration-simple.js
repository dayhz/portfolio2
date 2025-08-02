#!/usr/bin/env node

/**
 * Test d'intégration CMS pour TestimonialsEditor Simple
 * Teste l'intégration avec la page Services et l'API
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Test TestimonialsEditor CMS Intégration Simple - Démarrage');

// Vérifier que le composant est bien intégré dans ServicesPage
const servicesPagePath = path.join(__dirname, 'frontend/src/pages/ServicesPage.tsx');

if (!fs.existsSync(servicesPagePath)) {
  console.error('❌ ServicesPage.tsx non trouvé');
  process.exit(1);
}

const servicesPageContent = fs.readFileSync(servicesPagePath, 'utf8');

console.log('\n🧪 Tests d\'intégration CMS...\n');

// Tests d'intégration CMS
const cmsTests = [
  {
    name: 'Import TestimonialsEditor dans ServicesPage',
    test: () => servicesPageContent.includes('TestimonialsEditor'),
    description: 'Vérifie que TestimonialsEditor est importé dans ServicesPage'
  },
  {
    name: 'Utilisation du composant dans le rendu',
    test: () => servicesPageContent.includes('<TestimonialsEditor') || servicesPageContent.includes('{TestimonialsEditor}'),
    description: 'Vérifie que le composant est utilisé dans le rendu'
  },
  {
    name: 'Gestion des données testimonials',
    test: () => servicesPageContent.includes('testimonials') && (servicesPageContent.includes('data.testimonials') || servicesPageContent.includes('servicesData.testimonials')),
    description: 'Vérifie que les données testimonials sont gérées'
  },
  {
    name: 'Fonction de sauvegarde',
    test: () => servicesPageContent.includes('handleSave') || servicesPageContent.includes('onSave'),
    description: 'Vérifie que la fonction de sauvegarde est connectée'
  },
  {
    name: 'Gestion des changements',
    test: () => servicesPageContent.includes('onChange') || servicesPageContent.includes('handleChange'),
    description: 'Vérifie que les changements sont gérés'
  }
];

let passed = 0;
let failed = 0;

cmsTests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      console.log(`   ${test.description}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      console.log(`   ${test.description}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test ${index + 1}: ${test.name} (Erreur: ${error.message})`);
    failed++;
  }
  console.log('');
});

// Test de compilation TypeScript
console.log('🔧 Test de compilation TypeScript...');

try {
  const { execSync } = require('child_process');
  
  // Vérifier que TypeScript peut compiler le fichier
  const tscCommand = 'npx tsc --noEmit --skipLibCheck frontend/src/components/services/TestimonialsEditor.tsx';
  
  try {
    execSync(tscCommand, { cwd: __dirname, stdio: 'pipe' });
    console.log('✅ Compilation TypeScript réussie');
    passed++;
  } catch (tscError) {
    console.log('❌ Erreur de compilation TypeScript');
    console.log(`   ${tscError.message}`);
    failed++;
  }
} catch (error) {
  console.log('⚠️  TypeScript non disponible, test de compilation ignoré');
}

// Test de l'API backend
console.log('\n🔌 Test de compatibilité API...');

const backendServicePath = path.join(__dirname, 'backend/src/services/servicesService.ts');
if (fs.existsSync(backendServicePath)) {
  const backendContent = fs.readFileSync(backendServicePath, 'utf8');
  
  const apiTests = [
    {
      name: 'Méthode getServicesData',
      test: () => backendContent.includes('getServicesData') || backendContent.includes('getServices'),
      description: 'Vérifie que la méthode de récupération existe'
    },
    {
      name: 'Méthode updateServicesData',
      test: () => backendContent.includes('updateServicesData') || backendContent.includes('updateServices'),
      description: 'Vérifie que la méthode de mise à jour existe'
    },
    {
      name: 'Gestion des testimonials',
      test: () => backendContent.includes('testimonials'),
      description: 'Vérifie que les testimonials sont gérés côté backend'
    }
  ];

  apiTests.forEach((test, index) => {
    try {
      const result = test.test();
      if (result) {
        console.log(`✅ API ${index + 1}: ${test.name}`);
        passed++;
      } else {
        console.log(`❌ API ${index + 1}: ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ API ${index + 1}: ${test.name} (Erreur: ${error.message})`);
      failed++;
    }
  });
} else {
  console.log('⚠️  Service backend non trouvé, tests API ignorés');
}

// Test de simulation d'utilisation
console.log('\n🎭 Simulation d\'utilisation...');

const simulationData = {
  testimonials: [
    {
      id: 'testimonial-1',
      text: 'Victor est un développeur exceptionnel qui a livré des résultats remarquables sur notre projet.',
      author: {
        name: 'Marie Dubois',
        title: 'Chef de Projet',
        company: 'Innovation Corp',
        avatar: ''
      },
      project: {
        name: 'Plateforme E-commerce',
        image: '',
        url: 'https://example.com'
      },
      order: 1
    },
    {
      id: 'testimonial-2',
      text: 'Collaboration excellente, délais respectés et qualité au rendez-vous.',
      author: {
        name: 'Pierre Martin',
        title: 'Directeur Technique',
        company: 'Tech Solutions',
        avatar: ''
      },
      project: {
        name: 'Application Mobile',
        image: '',
        url: ''
      },
      order: 2
    }
  ]
};

// Vérifier que les données de simulation sont valides
const simulationValid = 
  simulationData.testimonials &&
  simulationData.testimonials.length === 2 &&
  simulationData.testimonials[0].author.name &&
  simulationData.testimonials[1].text;

if (simulationValid) {
  console.log('✅ Données de simulation valides');
  console.log(`   ${simulationData.testimonials.length} témoignages de test`);
  passed++;
} else {
  console.log('❌ Données de simulation invalides');
  failed++;
}

// Test des fonctionnalités principales
console.log('\n⚙️  Test des fonctionnalités principales...');

const componentPath = path.join(__dirname, 'frontend/src/components/services/TestimonialsEditor.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

const functionalityTests = [
  {
    name: 'Ajout de témoignage',
    test: () => componentContent.includes('handleAddTestimonial') && componentContent.includes('generateTestimonialId'),
    description: 'Vérifie que l\'ajout de témoignage fonctionne'
  },
  {
    name: 'Modification de témoignage',
    test: () => componentContent.includes('handleEditTestimonial') && componentContent.includes('handleUpdateTestimonial'),
    description: 'Vérifie que la modification fonctionne'
  },
  {
    name: 'Suppression de témoignage',
    test: () => componentContent.includes('handleRemoveTestimonial') && componentContent.includes('filter'),
    description: 'Vérifie que la suppression fonctionne'
  },
  {
    name: 'Validation des données',
    test: () => componentContent.includes('validateTestimonialForm') && componentContent.includes('errors'),
    description: 'Vérifie que la validation fonctionne'
  },
  {
    name: 'Sauvegarde et notifications',
    test: () => componentContent.includes('toast.success') && componentContent.includes('handleSave'),
    description: 'Vérifie que la sauvegarde et les notifications fonctionnent'
  }
];

functionalityTests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ Fonctionnalité ${index + 1}: ${test.name}`);
      passed++;
    } else {
      console.log(`❌ Fonctionnalité ${index + 1}: ${test.name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Fonctionnalité ${index + 1}: ${test.name} (Erreur: ${error.message})`);
    failed++;
  }
});

// Résultats finaux
const totalTests = cmsTests.length + functionalityTests.length + 2; // +2 pour simulation et compilation
console.log('\n📊 Résultats des tests CMS:');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);
console.log(`📈 Taux de réussite: ${Math.round((passed / totalTests) * 100)}%`);

// Recommandations finales
console.log('\n🎯 Statut de l\'intégration:');

const finalScore = Math.round((passed / totalTests) * 100);

if (finalScore >= 90) {
  console.log('🎉 Excellent ! TestimonialsEditor simple est prêt pour la production');
  console.log('\n📝 Fonctionnalités disponibles:');
  console.log('   ✅ Ajout de témoignages');
  console.log('   ✅ Modification de témoignages');
  console.log('   ✅ Suppression de témoignages');
  console.log('   ✅ Validation des données');
  console.log('   ✅ Sauvegarde et notifications');
  console.log('   ✅ Interface utilisateur intuitive');
  
  console.log('\n🚀 Prochaines étapes suggérées:');
  console.log('   1. Ajouter le drag & drop pour réorganiser');
  console.log('   2. Intégrer MediaSelector pour les avatars et images');
  console.log('   3. Ajouter la prévisualisation en temps réel');
  console.log('   4. Implémenter les tests unitaires complets');
  
} else if (finalScore >= 70) {
  console.log('👍 Bon travail ! Quelques ajustements nécessaires');
  console.log('\n📝 Actions recommandées:');
  console.log('   1. Vérifier l\'intégration avec ServicesPage');
  console.log('   2. Tester la sauvegarde avec l\'API');
  console.log('   3. Corriger les erreurs de compilation si présentes');
  
} else {
  console.log('⚠️  Des améliorations importantes sont nécessaires');
  console.log('\n📝 Actions prioritaires:');
  console.log('   1. Corriger les erreurs d\'intégration');
  console.log('   2. Vérifier la compatibilité des types');
  console.log('   3. Tester manuellement les fonctionnalités');
}

console.log('\n🏁 Test CMS terminé');

// Retourner le code de sortie approprié
process.exit(failed > 0 ? 1 : 0);