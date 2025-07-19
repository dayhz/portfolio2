/**
 * Extension Tiptap pour les grilles d'images
 */

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageGridAttributes } from '../types';
import { ImageGridBlockView } from '../nodeviews/ImageGridBlockView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGrid: {
      setImageGrid: (attrs?: Partial<ImageGridAttributes>) => ReturnType;
    };
  }
}

export const ImageGridExtension = Node.create<{}>({
  name: 'imageGrid',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      images: {
        default: [],
      },
      layout: {
        default: '2-columns',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-grid"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { images, layout } = HTMLAttributes;
    
    return [
      'div',
      {
        'data-type': 'image-grid',
        class: 'section',
      },
      [
        'div',
        { class: 'u-container' },
        [
          'div',
          { class: 'temp-comp-img_grid' },
          [
            'div',
            { class: 'img_grid-container' },
            ...(images || []).map((image: any) => [
              'div',
              { class: 'img-wrp' },
              [
                'img',
                {
                  class: 'comp-img',
                  'data-wf--template-image--variant': 'radius-16px',
                  src: image.src || '',
                  alt: image.alt || '',
                }
              ]
            ])
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGridBlockView);
  },

  addCommands() {
    return {
      setImageGrid:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              images: [],
              layout: '2-columns',
              ...attrs
            },
          });
        },
    };
  },
});