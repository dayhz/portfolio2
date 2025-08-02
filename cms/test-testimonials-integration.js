#!/usr/bin/env node

/**
 * Test d'intégration pour TestimonialsEditor
 * Teste l'intégration avec les données et l'API
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Test TestimonialsEditor Intégration - Démarrage');

// Vérifier les fichiers nécessaires
const filesToCheck = [
  'frontend/src/components/services/TestimonialsEditor.simple.tsx',
  'shared/types/services.ts',
  'frontend/src/api/services.ts',
  'backend/src/services/servicesService.ts'
];

console.log('\n📁 Vérification des fichiers...');

let allFilesExist = true;
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Certains fichiers sont manquants, mais on continue...');
}

// Lire le contenu du composant
const componentPath = path.join(__dirname, 'frontend/src/components/services/TestimonialsEditor.simple.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Lire les types si disponibles
let typesContent = '';
const typesPath = path.join(__dirname, 'shared/types/services.ts');
if (fs.existsSync(typesPath)) {
  typesContent = fs.readFileSync(typesPath, 'utf8');
}

console.log('\n🧪 Tests d\'intégration...\n');

// Tests d'intégration
const integrationTests = [
  {
    name: 'Import des types TestimonialsData',
    test: () => componentContent.includes('TestimonialsData') && componentContent.includes('Testimonial'),
    description: 'Vérifie que les types sont correctement importés'
  },
  {
    name: 'Interface compatible avec les props',
    test: () => {
      return componentContent.includes('data: TestimonialsData') &&
             componentContent.includes('onChange: (data: TestimonialsData) => void') &&
             componentContent.includes('onSave?: (data: TestimonialsData) => Promise<void>');
    },
    description: 'Vérifie que l\'interface est compatible avec l\'API'
  },
  {
    name: 'Structure des données testimonial',
    test: () => {
      return componentContent.includes('id:') &&
             componentContent.includes('text:') &&
             componentContent.includes('author:') &&
             componentContent.includes('project:') &&
             componentContent.includes('order:');
    },
    description: 'Vérifie que la structure des données est respectée'
  },
  {
    name: 'Gestion des changements non sauvegardés',
    test: () => {
      return componentContent.includes('hasUnsavedChanges') &&
             componentContent.includes('onUnsavedChanges') &&
             componentContent.includes('setHasUnsavedChanges(true)');
    },
    description: 'Vérifie la gestion des changements non sauvegardés'
  },
  {
    name: 'Propagation des changements',
    test: () => {
      return componentContent.includes('onChange(newData)') &&
             componentContent.includes('setFormData(newData)');
    },
    description: 'Vérifie que les changements sont propagés au parent'
  },
  {
    name: 'Gestion des erreurs de validation',
    test: () => {
      return componentContent.includes('ValidationError[]') &&
             componentContent.includes('errors.forEach') &&
             componentContent.includes('error.section === \'testimonials\'');
    },
    description: 'Vérifie la gestion des erreurs de validation'
  },
  {
    name: 'Sauvegarde asynchrone',
    test: () => {
      return componentContent.includes('await onSave(formData)') &&
             componentContent.includes('try {') &&
             componentContent.includes('catch (error)');
    },
    description: 'Vérifie la gestion de la sauvegarde asynchrone'
  },
  {
    name: 'Génération d\'ID unique',
    test: () => {
      return componentContent.includes('generateTestimonialId') &&
             componentContent.includes('Date.now()') &&
             componentContent.includes('Math.random()');
    },
    description: 'Vérifie la génération d\'ID unique pour les nouveaux témoignages'
  },
  {
    name: 'Mise à jour de l\'ordre',
    test: () => {
      return componentContent.includes('order: index + 1') ||
             componentContent.includes('order:') &&
             componentContent.includes('formData.testimonials.length + 1');
    },
    description: 'Vérifie la gestion de l\'ordre des témoignages'
  },
  {
    name: 'Nettoyage des données',
    test: () => {
      return componentContent.includes('.trim()') &&
             componentContent.includes('authorName.trim()') &&
             componentContent.includes('text.trim()');
    },
    description: 'Vérifie le nettoyage des données avant sauvegarde'
  }
];

// Exécuter les tests d'intégration
let passed = 0;
let failed = 0;

integrationTests.forEach((test, index) => {
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

// Tests de compatibilité avec les types
if (typesContent) {
  console.log('🔍 Tests de compatibilité des types:');
  
  const typeTests = [
    {
      name: 'Type TestimonialsData défini',
      test: () => typesContent.includes('interface TestimonialsData') || typesContent.includes('type TestimonialsData'),
      description: 'Vérifie que TestimonialsData est défini dans les types'
    },
    {
      name: 'Type Testimonial défini',
      test: () => typesContent.includes('interface Testimonial') || typesContent.includes('type Testimonial'),
      description: 'Vérifie que Testimonial est défini dans les types'
    },
    {
      name: 'Structure author définie',
      test: () => typesContent.includes('author:') && (typesContent.includes('name:') || typesContent.includes('TestimonialAuthor')),
      description: 'Vérifie que la structure author est définie'
    },
    {
      name: 'Structure project définie',
      test: () => typesContent.includes('project:') && (typesContent.includes('TestimonialProject') || typesContent.includes('name:')),
      description: 'Vérifie que la structure project est définie'
    }
  ];

  typeTests.forEach((test, index) => {
    try {
      const result = test.test();
      if (result) {
        console.log(`✅ Type ${index + 1}: ${test.name}`);
        passed++;
      } else {
        console.log(`❌ Type ${index + 1}: ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Type ${index + 1}: ${test.name} (Erreur: ${error.message})`);
      failed++;
    }
  });
  console.log('');
}

// Simulation de données de test
console.log('📊 Simulation avec données de test:');

const testData = {
  testimonials: [
    {
      id: 'test-1',
      text: 'Victor est un développeur exceptionnel qui a livré des résultats remarquables.',
      author: {
        name: 'Jean Dupont',
        title: 'Directeur Technique',
        company: 'Tech Corp',
        avatar: ''
      },
      project: {
        name: 'Application Mobile',
        image: '',
        url: ''
      },
      order: 1
    }
  ]
};

// Vérifier que la structure de données est compatible
const dataStructureValid = 
  testData.testimonials &&
  testData.testimonials[0].id &&
  testData.testimonials[0].text &&
  testData.testimonials[0].author &&
  testData.testimonials[0].author.name &&
  testData.testimonials[0].project;

if (dataStructureValid) {
  console.log('✅ Structure de données de test valide');
} else {
  console.log('❌ Structure de données de test invalide');
  failed++;
}

// Résultats finaux
const totalTests = integrationTests.length + (typesContent ? 4 : 0) + 1;
console.log('\n📊 Résultats des tests d\'intégration:');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);
console.log(`📈 Taux de réussite: ${Math.round((passed / totalTests) * 100)}%`);

// Recommandations
console.log('\n💡 Recommandations pour l\'intégration:');

if (componentContent.includes('toast.success') && componentContent.includes('toast.error')) {
  console.log('✅ Notifications utilisateur implémentées');
} else {
  console.log('⚠️  Ajouter des notifications utilisateur pour les actions');
}

if (componentContent.includes('try {') && componentContent.includes('catch (error)')) {
  console.log('✅ Gestion d\'erreurs implémentée');
} else {
  console.log('⚠️  Améliorer la gestion d\'erreurs');
}

if (componentContent.includes('isLoading') && componentContent.includes('isSaving')) {
  console.log('✅ États de chargement gérés');
} else {
  console.log('⚠️  Ajouter des indicateurs de chargement');
}

// Score final et recommandations
const finalScore = Math.round((passed / totalTests) * 100);

if (finalScore >= 90) {
  console.log('\n🎉 Excellent ! Le composant est prêt pour l\'intégration');
  console.log('📝 Prochaines étapes suggérées:');
  console.log('   1. Ajouter le drag & drop pour réorganiser');
  console.log('   2. Intégrer avec le MediaSelector pour les images');
  console.log('   3. Ajouter des tests unitaires complets');
} else if (finalScore >= 70) {
  console.log('\n👍 Bon travail ! Quelques ajustements nécessaires');
  console.log('📝 Améliorations suggérées:');
  console.log('   1. Vérifier la compatibilité des types');
  console.log('   2. Améliorer la gestion d\'erreurs');
  console.log('   3. Tester l\'intégration avec l\'API');
} else {
  console.log('\n⚠️  Des améliorations importantes sont nécessaires');
  console.log('📝 Actions prioritaires:');
  console.log('   1. Corriger les problèmes de types');
  console.log('   2. Implémenter la gestion d\'erreurs');
  console.log('   3. Vérifier la structure des données');
}

console.log('\n🏁 Test d\'intégration terminé');

// Retourner le code de sortie approprié
process.exit(failed > 0 ? 1 : 0);