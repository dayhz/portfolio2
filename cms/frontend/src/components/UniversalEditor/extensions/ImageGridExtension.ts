/**
 * Extension Tiptap pour les grilles d'images et vidéos
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
    const { images } = HTMLAttributes; // layout unused for now
    
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
          ...(images || []).map((item: any) => [
            'div',
            { class: 'img_grid-container' },
            item.hasVideo && item.videoSrc ? [
              'div',
              { class: 'temp-img none-ratio' },
              [
                'div',
                { class: 'img-wrp' },
                [
                  'video',
                  {
                    class: 'comp-img',
                    'data-wf--template-image--variant': 'radius-16px',
                    src: item.videoSrc || '',
                    controls: 'controls',
                    muted: 'muted',
                    preload: 'metadata',
                  }
                ]
              ]
            ] : [
              'div',
              { class: 'temp-img none-ratio' },
              [
                'div',
                { class: 'img-wrp' },
                [
                  'img',
                  {
                    class: 'comp-img',
                    'data-wf--template-image--variant': 'radius-16px',
                    src: item.src || '',
                    alt: item.alt || '',
                  }
                ]
              ]
            ]
          ])
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props: any) => {
      return ImageGridBlockView({
        node: props.node,
        updateAttributes: props.updateAttributes,
        selected: props.selected
      });
    });
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