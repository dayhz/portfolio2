/**
 * Page de test pour l'éditeur universel
 * Permet de visualiser et tester toutes les fonctionnalités
 */
import { useState } from 'react';
import { UniversalEditor } from '../components/UniversalEditor';

export function UniversalEditorTestPage() {
  const [content, setContent] = useState(`
    <h1>Test de l'Éditeur Universel</h1>
    <p>Tapez "/" pour voir le menu des blocs disponibles.</p>
    <p>Vous pouvez ajouter des images, vidéos, grilles d'images, témoignages et plus encore.</p>
  `);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Contenu mis à jour:', newContent);
  };

  return (
    <div className="universal-editor-test-page">
      <div className="test-header">
        <h1>Test de l'Éditeur Universel Portfolio</h1>
        <p>Cette page permet de tester toutes les fonctionnalités de l'éditeur universel.</p>
      </div>

      <div className="test-content">
        <div className="editor-section">
          <h2>Éditeur</h2>
          <div className="editor-container">
            <UniversalEditor
              content={content}
              onChange={handleContentChange}
              projectId="test-project"
              autoSave={true}
            />
          </div>
        </div>

        <div className="preview-section">
          <h2>Aperçu HTML généré</h2>
          <div className="html-preview">
            <pre>
              <code>{content}</code>
            </pre>
          </div>
        </div>

        <div className="rendered-preview">
          <h2>Rendu final</h2>
          <div 
            className="rendered-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <style>{`
        .universal-editor-test-page {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .test-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .test-header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .test-header p {
          color: #666;
          font-size: 16px;
        }

        .test-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .editor-section {
          grid-column: 1 / -1;
        }

        .editor-section h2 {
          margin-bottom: 15px;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 5px;
        }

        .editor-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          min-height: 400px;
          background: white;
        }

        .preview-section,
        .rendered-preview {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .preview-section h2,
        .rendered-preview h2 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
          font-size: 18px;
        }

        .html-preview {
          background: #2d3748;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          line-height: 1.5;
        }

        .rendered-content {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 6px;
          background: white;
          min-height: 200px;
        }

        /* Styles pour le contenu rendu */
        .rendered-content h1,
        .rendered-content h2,
        .rendered-content h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .rendered-content p {
          margin-bottom: 15px;
          line-height: 1.6;
        }

        .rendered-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .rendered-content video {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .test-content {
            grid-template-columns: 1fr;
          }
          
          .universal-editor-test-page {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}