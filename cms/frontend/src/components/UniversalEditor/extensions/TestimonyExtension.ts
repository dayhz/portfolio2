/**
 * Extension Tiptap pour les témoignages
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TestimonyAttributes } from '../types';
import { TestimonyBlockView } from '../nodeviews/TestimonyBlockView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    testimony: {
      setTestimony: (attrs?: Partial<TestimonyAttributes>) => ReturnType;
    };
  }
}

export const TestimonyExtension = Node.create<{}>({
  name: 'testimony',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      quote: {
        default: '',
      },
      authorName: {
        default: '',
      },
      authorRole: {
        default: '',
      },
      authorImage: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="testimony"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { quote, authorName, authorRole, authorImage } = HTMLAttributes;
    
    return [
      'div',
      {
        'data-type': 'testimony',
        class: 'section',
      },
      [
        'div',
        { class: 'u-container' },
        [
          'div',
          { class: 'temp-comp-testimony' },
          [
            'h4',
            { class: 'testimony' },
            quote || 'Cliquez pour ajouter une citation...'
          ],
          [
            'div',
            { class: 'testimony-profile' },
            authorImage ? [
              'div',
              { class: 'testimony-profile-img' },
              [
                'img',
                {
                  class: 'testimonial-img-item',
                  src: authorImage,
                  alt: authorName || 'Auteur'
                }
              ]
            ] : null,
            [
              'div',
              { class: 'testimony-profile-name' },
              authorName || 'Nom de l\'auteur'
            ],
            [
              'div',
              { class: 'testimony-profile-role' },
              authorRole || 'Rôle de l\'auteur'
            ]
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TestimonyBlockView);
  },

  addCommands() {
    return {
      setTestimony:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              quote: 'Votre témoignage ici...',
              authorName: 'Nom de l\'auteur',
              authorRole: 'Rôle',
              ...attrs
            },
          });
        },
    };
  },
});