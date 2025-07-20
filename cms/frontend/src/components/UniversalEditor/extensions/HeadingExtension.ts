/**
 * Extension personnalisée pour les titres
 */

import { Heading } from '@tiptap/extension-heading';

export const HeadingExtension = Heading.configure({
  levels: [1, 2, 3],
  HTMLAttributes: {
    class: 'universal-heading',
  },
}).extend({
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: true,
      },
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return {
            class: `universal-heading universal-heading-${attributes.level} ${attributes.class || ''}`.trim(),
          };
        },
      },
    };
  },
});