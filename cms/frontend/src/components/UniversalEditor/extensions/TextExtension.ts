/**
 * Extension Tiptap pour les blocs de texte universels
 */

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TextAttributes } from '../types';
import { TextBlockView } from '../nodeviews/TextBlockView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    universalText: {
      setUniversalText: (attrs: Partial<TextAttributes>) => ReturnType;
    };
  }
}

export const TextExtension = Node.create<{}>({
  name: 'universalText',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      variant: {
        default: 'rich',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="universal-text"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { variant } = HTMLAttributes;
    
    const contentClass = variant === 'rich' 
      ? 'temp-rich u-color-dark w-richtext'
      : variant === 'about'
      ? 'temp-about_container'
      : 'temp-comp-text';

    return [
      'div',
      {
        'data-type': 'universal-text',
        class: 'section',
      },
      [
        'div',
        { class: 'u-container' },
        [
          'div',
          { class: contentClass },
          0 // Le contenu sera inséré ici
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props: any) => {
      return TextBlockView({
        node: props.node,
        updateAttributes: props.updateAttributes,
        selected: props.selected
      });
    });
  },

  addCommands() {
    return {
      setUniversalText:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: attrs.variant === 'rich' 
                      ? 'Tapez votre texte riche ici...'
                      : 'Tapez votre texte ici...'
                  }
                ]
              }
            ]
          });
        },
    };
  },
});