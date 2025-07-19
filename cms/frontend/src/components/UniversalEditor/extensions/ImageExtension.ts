/**
 * Extension Tiptap pour les images universelles
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageAttributes } from '../types';
import { ImageBlockView } from '../nodeviews/ImageBlockView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    universalImage: {
      setUniversalImage: (attrs: Partial<ImageAttributes>) => ReturnType;
    };
  }
}

export const ImageExtension = Node.create<{}>({
  name: 'universalImage',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      variant: {
        default: 'auto',
      },
      size: {
        default: 'medium',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="universal-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { variant, src, alt } = HTMLAttributes;
    
    return [
      'div',
      {
        'data-type': 'universal-image',
        class: 'section',
        'data-wf--template-section-image--variant': variant,
      },
      [
        'div',
        { class: 'u-container' },
        [
          'div',
          { class: 'temp-img_container' },
          [
            'div',
            { class: `temp-img${variant === '16-9' ? '' : ' w-variant-e18145a5-28b8-affd-e283-83a4aa5ff6de'}` },
            [
              'div',
              { class: 'img-wrp' },
              src ? [
                'img',
                mergeAttributes({
                  class: 'comp-img',
                  'data-wf--template-image--variant': 'radius-16px',
                  src,
                  alt: alt || '',
                })
              ] : [
                'div',
                {
                  class: 'block-placeholder',
                  style: 'min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column;'
                },
                [
                  'div',
                  { class: 'block-placeholder-icon' },
                  '🖼️'
                ],
                [
                  'div',
                  { class: 'block-placeholder-text' },
                  `Image ${variant === 'full' ? 'pleine largeur' : variant === '16-9' ? '16:9' : 'standard'}`
                ]
              ]
            ]
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },

  addCommands() {
    return {
      setUniversalImage:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});