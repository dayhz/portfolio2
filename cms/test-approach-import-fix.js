#!/usr/bin/env node

/**
 * Test de correction des imports ApproachEditor
 * Vérifie que les imports correspondent à l'export
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test de correction des imports - ApproachEditor');
console.log('=================================================');

// Vérifier l'export dans ApproachEditor.tsx
const approachEditorPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');
const servicesPagePath = path.join(__dirname, 'frontend/src/pages/ServicesPage.tsx');
const testFilePath = path.join(__dirname, 'frontend/src/test/components/ApproachEditor.test.tsx');

console.log('1️⃣ Vérification de l\'export...');

if (!fs.existsSync(approachEditorPath)) {
  console.log('❌ Fichier ApproachEditor.tsx non trouvé');
  process.exit(1);
}

const approachContent = fs.readFileSync(approachEditorPath, 'utf8');
const hasDefaultExport = /export default function ApproachEditor/.test(approachContent);

if (hasDefaultExport) {
  console.log('✅ Export par défaut trouvé: export default function ApproachEditor');
} else {
  console.log('❌ Export par défaut non trouvé');
}

console.log('\n2️⃣ Vérification des imports...');

// Vérifier ServicesPage.tsx
if (fs.existsSync(servicesPagePath)) {
  const servicesContent = fs.readFileSync(servicesPagePath, 'utf8');
  const hasCorrectImport = /import ApproachEditor from/.test(servicesContent);
  const hasIncorrectImport = /import \{ ApproachEditor \} from/.test(servicesContent);
  
  if (hasCorrectImport && !hasIncorrectImport) {
    console.log('✅ ServicesPage.tsx: Import correct (default import)');
  } else if (hasIncorrectImport) {
    console.log('❌ ServicesPage.tsx: Import incorrect (named import au lieu de default)');
  } else {
    console.log('⚠️  ServicesPage.tsx: Aucun import d\'ApproachEditor trouvé');
  }
} else {
  console.log('❌ ServicesPage.tsx non trouvé');
}

// Vérifier le fichier de test
if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  const hasCorrectImport = /import ApproachEditor from/.test(testContent);
  const hasIncorrectImport = /import \{ ApproachEditor \} from/.test(testContent);
  
  if (hasCorrectImport && !hasIncorrectImport) {
    console.log('✅ ApproachEditor.test.tsx: Import correct (default import)');
  } else if (hasIncorrectImport) {
    console.log('❌ ApproachEditor.test.tsx: Import incorrect (named import au lieu de default)');
  } else {
    console.log('⚠️  ApproachEditor.test.tsx: Aucun import d\'ApproachEditor trouvé');
  }
} else {
  console.log('❌ ApproachEditor.test.tsx non trouvé');
}

console.log('\n3️⃣ Recherche d\'autres imports...');

// Rechercher d'autres fichiers qui pourraient importer ApproachEditor
const { execSync } = require('child_process');

try {
  const grepResult = execSync('grep -r "import.*ApproachEditor" frontend/src/ || true', { 
    cwd: __dirname,
    encoding: 'utf8' 
  });
  
  if (grepResult.trim()) {
    console.log('📁 Autres fichiers avec imports d\'ApproachEditor:');
    grepResult.trim().split('\n').forEach(line => {
      if (line.includes('ApproachEditor')) {
        const isCorrect = line.includes('import ApproachEditor from');
        const status = isCorrect ? '✅' : '❌';
        console.log(`   ${status} ${line}`);
      }
    });
  } else {
    console.log('📁 Aucun autre import d\'ApproachEditor trouvé');
  }
} catch (error) {
  console.log('⚠️  Impossible de rechercher d\'autres imports');
}

console.log('\n4️⃣ Résumé...');

const allCorrect = hasDefaultExport;

if (allCorrect) {
  console.log('🎉 Tous les imports/exports sont maintenant corrects !');
  console.log('📝 Le composant ApproachEditor devrait maintenant se charger sans erreur.');
  console.log('\n📋 Actions recommandées:');
  console.log('   1. Redémarrer le serveur de développement si nécessaire');
  console.log('   2. Vérifier que la page Services se charge sans erreur');
  console.log('   3. Tester l\'édition de la section Approach');
} else {
  console.log('❌ Des problèmes d\'import/export subsistent');
  console.log('📝 Vérifiez manuellement les fichiers mentionnés ci-dessus');
}

console.log('\n🔍 Test terminé !');
console.log('================');

process.exit(allCorrect ? 0 : 1);