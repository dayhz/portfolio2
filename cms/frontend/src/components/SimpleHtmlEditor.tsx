import React, { useState, useEffect } from 'react';

interface SimpleHtmlEditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
}

export function SimpleHtmlEditor({ content, onChange, height = '400px' }: SimpleHtmlEditorProps) {
  const [value, setValue] = useState(content);

  // Mettre à jour la valeur lorsque le contenu change
  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="simple-html-editor">
      <style>{`
        .simple-html-editor {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .simple-html-editor textarea {
          width: 100%;
          height: ${height};
          padding: 16px;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          border: none;
          outline: none;
          resize: vertical;
        }
        
        .simple-html-editor textarea:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
      `}</style>
      <textarea 
        value={value} 
        onChange={handleChange}
        placeholder="Entrez votre contenu HTML ici..."
      />
    </div>
  );
}

export function SimpleHtmlPreview({ content }: { content: string }) {
  return (
    <div className="simple-html-preview">
      <style>{`
        .simple-html-preview {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          overflow: auto;
          max-height: 600px;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}