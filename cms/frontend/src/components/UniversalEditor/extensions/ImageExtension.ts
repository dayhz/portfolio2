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
    const { variant, src, alt, size } = HTMLAttributes;
    
    // Déterminer les classes CSS en fonction du variant et de la taille
    const getImageContainerClass = () => {
      if (variant === 'full') {
        return 'temp-img_container full-width';
      }
      
      switch (size) {
        case 'small':
          return 'temp-img_container small-width';
        case 'large':
          return 'temp-img_container large-width';
        default:
          return 'temp-img_container'; // medium est la valeur par défaut
      }
    };
    
    // Déterminer la classe CSS pour l'élément temp-img
    const getTempImgClass = () => {
      if (variant === '16-9') {
        return 'temp-img'; // Pour 16:9, on utilise l'aspect-ratio défini en CSS
      }
      return 'temp-img none-ratio w-variant-e18145a5-28b8-affd-e283-83a4aa5ff6de';
    };
    
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
          { class: getImageContainerClass() },
          [
            'div',
            { class: getTempImgClass() },
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
                  loading: 'lazy', // Ajout du lazy loading pour optimiser les performances
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
                  `Image ${variant === 'full' ? 'pleine largeur' : variant === '16-9' ? '16:9' : 'standard'}${size !== 'medium' ? ` (${size === 'small' ? 'petite' : 'grande'})` : ''}`
                ]
              ]
            ]
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props: any) => {
      return ImageBlockView({
        node: props.node,
        updateAttributes: props.updateAttributes,
        selected: props.selected
      });
    });
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