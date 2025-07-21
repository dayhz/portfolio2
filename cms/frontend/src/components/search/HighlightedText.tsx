import React from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query, className = '' }) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Échapper les caractères spéciaux de regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Créer une regex pour trouver toutes les occurrences (insensible à la casse)
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  
  // Diviser le texte en parties
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Si la partie correspond à la requête (insensible à la casse)
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium"
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

export default HighlightedText;