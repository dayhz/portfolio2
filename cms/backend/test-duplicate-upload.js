const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8000/api';

async function testDuplicateUpload() {
  console.log('🧪 Test de détection des doublons à l\'upload');
  
  try {
    // Créer un fichier de test temporaire
    const testFilePath = path.join(__dirname, 'test-image.jpg');
    const testContent = Buffer.from('fake-image-content-for-testing');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📁 Fichier de test créé:', testFilePath);
    
    // Premier upload - devrait réussir
    console.log('\n1️⃣ Premier upload...');
    const formData1 = new FormData();
    formData1.append('file', fs.createReadStream(testFilePath));
    formData1.append('name', 'test-image.jpg');
    formData1.append('alt', 'Image de test');
    formData1.append('description', 'Description de test');
    
    const response1 = await axios.post(`${API_URL}/media`, formData1, {
      headers: {
        ...formData1.getHeaders()
      }
    });
    
    console.log('✅ Premier upload réussi:', response1.data.name);
    const firstFileId = response1.data.id;
    
    // Deuxième upload du même fichier - devrait détecter le doublon
    console.log('\n2️⃣ Deuxième upload (doublon attendu)...');
    const formData2 = new FormData();
    formData2.append('file', fs.createReadStream(testFilePath));
    formData2.append('name', 'test-image.jpg');
    formData2.append('alt', 'Image de test');
    formData2.append('description', 'Description de test');
    
    try {
      const response2 = await axios.post(`${API_URL}/media`, formData2, {
        headers: {
          ...formData2.getHeaders()
        }
      });
      
      console.log('❌ Erreur: Le doublon n\'a pas été détecté!');
      console.log('Réponse:', response2.data);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ Doublon détecté correctement!');
        console.log('Message:', error.response.data.message);
        console.log('Actions disponibles:', error.response.data.actions);
        console.log('Fichier existant:', error.response.data.existingFile.name);
        console.log('Nouveau fichier:', error.response.data.uploadedFile.originalName);
        
        // Test de l'action "replace"
        console.log('\n3️⃣ Test de l\'action "replace"...');
        const formData3 = new FormData();
        formData3.append('file', fs.createReadStream(testFilePath));
        formData3.append('name', 'test-image.jpg');
        formData3.append('alt', 'Image de test remplacée');
        formData3.append('description', 'Description remplacée');
        formData3.append('action', 'replace');
        
        const response3 = await axios.post(`${API_URL}/media`, formData3, {
          headers: {
            ...formData3.getHeaders()
          }
        });
        
        console.log('✅ Remplacement réussi:', response3.data.message);
        console.log('Fichier remplacé:', response3.data.replaced);
        
        // Test de l'action "rename"
        console.log('\n4️⃣ Test de l\'action "rename"...');
        const formData4 = new FormData();
        formData4.append('file', fs.createReadStream(testFilePath));
        formData4.append('name', 'test-image.jpg');
        formData4.append('alt', 'Image de test renommée');
        formData4.append('description', 'Description renommée');
        formData4.append('action', 'rename');
        
        const response4 = await axios.post(`${API_URL}/media`, formData4, {
          headers: {
            ...formData4.getHeaders()
          }
        });
        
        console.log('✅ Renommage réussi:', response4.data.message);
        console.log('Fichier renommé:', response4.data.renamed);
        console.log('Nom original demandé:', response4.data.originalRequestedName);
        console.log('Nom final:', response4.data.originalName);
        
      } else {
        console.log('❌ Erreur inattendue:', error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
        }
      }
    }
    
    // Nettoyer les fichiers de test
    console.log('\n🧹 Nettoyage...');
    
    // Récupérer tous les médias pour nettoyer
    const mediaResponse = await axios.get(`${API_URL}/media`);
    const testFiles = mediaResponse.data.data.filter(media => 
      media.originalName.includes('test-image.jpg')
    );
    
    for (const file of testFiles) {
      try {
        await axios.delete(`${API_URL}/media/${file.id}`);
        console.log('🗑️ Fichier supprimé:', file.name);
      } catch (deleteError) {
        console.log('⚠️ Erreur lors de la suppression:', file.name);
      }
    }
    
    // Supprimer le fichier de test local
    fs.unlinkSync(testFilePath);
    console.log('🗑️ Fichier de test local supprimé');
    
    console.log('\n✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testDuplicateUpload();
}

module.exports = { testDuplicateUpload };