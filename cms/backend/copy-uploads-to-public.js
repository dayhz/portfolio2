const fs = require('fs');
const path = require('path');

// Chemins des répertoires
const sourceDir = path.join(__dirname, 'uploads');
const targetDir = path.join(__dirname, '../frontend/public/uploads');

// Créer le répertoire cible s'il n'existe pas
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Répertoire créé: ${targetDir}`);
}

// Fonction pour copier un fichier
function copyFile(source, target) {
  const targetFile = path.join(target, path.basename(source));
  
  // Vérifier si le fichier existe déjà dans la destination
  if (fs.existsSync(targetFile)) {
    const sourceStats = fs.statSync(source);
    const targetStats = fs.statSync(targetFile);
    
    // Ne copier que si le fichier source est plus récent
    if (sourceStats.mtime <= targetStats.mtime) {
      console.log(`Fichier déjà à jour: ${path.basename(source)}`);
      return;
    }
  }
  
  // Copier le fichier
  fs.copyFileSync(source, targetFile);
  console.log(`Fichier copié: ${path.basename(source)}`);
}

// Fonction pour synchroniser les répertoires
function syncDirectories() {
  // Vérifier si le répertoire source existe
  if (!fs.existsSync(sourceDir)) {
    console.log(`Le répertoire source n'existe pas: ${sourceDir}`);
    return;
  }
  
  // Lire les fichiers du répertoire source
  const files = fs.readdirSync(sourceDir);
  
  // Copier chaque fichier
  let count = 0;
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    
    // Vérifier si c'est un fichier
    if (fs.statSync(sourcePath).isFile()) {
      copyFile(sourcePath, targetDir);
      count++;
    }
  }
  
  console.log(`Synchronisation terminée. ${count} fichiers copiés.`);
}

// Exécuter la synchronisation
syncDirectories();

// Configurer un observateur pour synchroniser automatiquement les nouveaux fichiers
const watcher = fs.watch(sourceDir, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const sourcePath = path.join(sourceDir, filename);
    
    // Vérifier si le fichier existe (il peut avoir été supprimé)
    if (fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile()) {
      console.log(`Nouveau fichier détecté: ${filename}`);
      copyFile(sourcePath, targetDir);
    }
  }
});

console.log(`Surveillance du répertoire ${sourceDir} pour les nouveaux fichiers...`);
console.log('Appuyez sur Ctrl+C pour arrêter.');

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  watcher.close();
  console.log('\nSurveillance arrêtée.');
  process.exit(0);
});