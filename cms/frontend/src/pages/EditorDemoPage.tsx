/**
 * Page de démonstration simple pour l'éditeur universel
 */
import { useState } from 'react';
import { UniversalEditor } from '../components/UniversalEditor';

export function EditorDemoPage() {
  const [content, setContent] = useState(`
    <div class="section">
      <div class="u-container">
        <h1>Bienvenue dans l'Éditeur Universel</h1>
        <p>Cet éditeur permet de créer du contenu riche avec des blocs spécialisés.</p>
        
        <h2>Instructions :</h2>
        <ul>
          <li>Tapez <strong>"/"</strong> pour ouvrir le menu des blocs</li>
          <li>Utilisez les flèches pour naviguer</li>
          <li>Appuyez sur Entrée pour sélectionner un bloc</li>
          <li>Échap pour fermer le menu</li>
        </ul>

        <h3>Types de blocs disponibles :</h3>
        <ul>
          <li>📷 Images (pleine largeur, 16:9, auto)</li>
          <li>🎥 Vidéos</li>
          <li>🖼️ Grilles d'images</li>
          <li>📝 Texte riche</li>
          <li>💬 Témoignages</li>
          <li>📋 Sections spéciales</li>
        </ul>

        <p>Essayez de taper "/" ci-dessous pour commencer !</p>
      </div>
    </div>
  `);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        marginBottom: '30px', 
        textAlign: 'center',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          Démonstration de l'Éditeur Universel
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Testez toutes les fonctionnalités de l'éditeur en temps réel
        </p>
      </div>

      <div style={{
        border: '2px solid #007bff',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          background: '#007bff',
          color: 'white',
          padding: '12px 20px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          ✨ Éditeur Universel - Mode Démo
        </div>
        
        <div style={{ padding: '20px' }}>
          <UniversalEditor
            content={content}
            onChange={handleContentChange}
            projectId="demo-project"
            autoSave={false}
          />
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>💡 Conseils d'utilisation :</h3>
        <ul style={{ color: '#856404', margin: 0 }}>
          <li>L'auto-sauvegarde est désactivée en mode démo</li>
          <li>Tous les médias uploadés sont temporaires</li>
          <li>Utilisez Ctrl+Z / Ctrl+Y pour annuler/refaire</li>
          <li>Le contenu est sauvegardé localement pendant votre session</li>
        </ul>
      </div>
    </div>
  );
}