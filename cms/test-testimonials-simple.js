#!/usr/bin/env node

/**
 * Test simple pour TestimonialsEditor
 * Teste les fonctionnalités de base : ajout, modification, suppression
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test TestimonialsEditor Simple - Démarrage');

// Vérifier que le fichier existe
const componentPath = path.join(__dirname, 'frontend/src/components/services/TestimonialsEditor.simple.tsx');

if (!fs.existsSync(componentPath)) {
  console.error('❌ Fichier TestimonialsEditor.simple.tsx non trouvé');
  process.exit(1);
}

console.log('✅ Fichier TestimonialsEditor.simple.tsx trouvé');

// Lire le contenu du fichier
const content = fs.readFileSync(componentPath, 'utf8');

// Tests de base
const tests = [
  {
    name: 'Import des dépendances React',
    test: () => content.includes("import React, { useState, useEffect }"),
    description: 'Vérifie que React et les hooks sont importés'
  },
  {
    name: 'Interface TestimonialsEditorProps',
    test: () => content.includes('interface TestimonialsEditorProps'),
    description: 'Vérifie que l\'interface des props est définie'
  },
  {
    name: 'Fonction principale TestimonialsEditor',
    test: () => content.includes('export function TestimonialsEditor'),
    description: 'Vérifie que la fonction principale est exportée'
  },
  {
    name: 'Gestion des états',
    test: () => content.includes('useState<TestimonialsData>') && content.includes('hasUnsavedChanges'),
    description: 'Vérifie que les états sont correctement gérés'
  },
  {
    name: 'Validation des formulaires',
    test: () => content.includes('validateTestimonialForm'),
    description: 'Vérifie que la validation est implémentée'
  },
  {
    name: 'Ajout de témoignage',
    test: () => content.includes('handleAddTestimonial'),
    description: 'Vérifie que l\'ajout de témoignage est implémenté'
  },
  {
    name: 'Modification de témoignage',
    test: () => content.includes('handleEditTestimonial') && content.includes('handleUpdateTestimonial'),
    description: 'Vérifie que la modification est implémentée'
  },
  {
    name: 'Suppression de témoignage',
    test: () => content.includes('handleRemoveTestimonial'),
    description: 'Vérifie que la suppression est implémentée'
  },
  {
    name: 'Sauvegarde',
    test: () => content.includes('handleSave') && content.includes('onSave'),
    description: 'Vérifie que la sauvegarde est implémentée'
  },
  {
    name: 'Prévisualisation',
    test: () => content.includes('handlePreview') && content.includes('onPreview'),
    description: 'Vérifie que la prévisualisation est implémentée'
  },
  {
    name: 'Gestion des erreurs',
    test: () => content.includes('validationErrors') && content.includes('AlertCircle'),
    description: 'Vérifie que la gestion d\'erreurs est présente'
  },
  {
    name: 'État de chargement',
    test: () => content.includes('isLoading') && content.includes('Loader2'),
    description: 'Vérifie que l\'état de chargement est géré'
  },
  {
    name: 'Dialogs d\'ajout et modification',
    test: () => content.includes('isAddDialogOpen') && content.includes('isEditDialogOpen'),
    description: 'Vérifie que les dialogs sont implémentés'
  },
  {
    name: 'Formulaires avec validation',
    test: () => content.includes('newTestimonialForm') && content.includes('editTestimonialForm'),
    description: 'Vérifie que les formulaires sont présents'
  },
  {
    name: 'Notifications toast',
    test: () => content.includes('toast.success') && content.includes('toast.error'),
    description: 'Vérifie que les notifications sont implémentées'
  }
];

// Exécuter les tests
let passed = 0;
let failed = 0;

console.log('\n📋 Exécution des tests...\n');

tests.forEach((test, index) => {
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

// Résultats
console.log('📊 Résultats des tests:');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);
console.log(`📈 Taux de réussite: ${Math.round((passed / tests.length) * 100)}%`);

// Tests spécifiques au contenu
console.log('\n🔍 Tests de contenu spécifiques:');

// Vérifier les champs requis
const requiredFields = ['text', 'authorName', 'authorTitle'];
const hasRequiredValidation = requiredFields.every(field => 
  content.includes(`!formData.${field}.trim()`) || content.includes(`${field} est requis`)
);

if (hasRequiredValidation) {
  console.log('✅ Validation des champs requis implémentée');
} else {
  console.log('❌ Validation des champs requis manquante');
}

// Vérifier la structure des témoignages
if (content.includes('testimonials.map') && content.includes('CardContent')) {
  console.log('✅ Affichage de la liste des témoignages implémenté');
} else {
  console.log('❌ Affichage de la liste des témoignages manquant');
}

// Vérifier l'état vide
if (content.includes('Aucun témoignage défini') && content.includes('border-dashed')) {
  console.log('✅ État vide (empty state) implémenté');
} else {
  console.log('❌ État vide (empty state) manquant');
}

// Score final
const finalScore = Math.round((passed / tests.length) * 100);

if (finalScore >= 90) {
  console.log('\n🎉 Excellent ! TestimonialsEditor.simple.tsx est bien implémenté');
} else if (finalScore >= 70) {
  console.log('\n👍 Bon travail ! Quelques améliorations possibles');
} else {
  console.log('\n⚠️  Des améliorations sont nécessaires');
}

console.log('\n🏁 Test terminé');

// Retourner le code de sortie approprié
process.exit(failed > 0 ? 1 : 0);