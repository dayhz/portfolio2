/**
 * Extension Tiptap pour les vidéos universelles
 */

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { VideoAttributes } from '../types';
import { VideoBlockView } from '../nodeviews/VideoBlockView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    universalVideo: {
      setUniversalVideo: (attrs?: Partial<VideoAttributes>) => ReturnType;
    };
  }
}

export const VideoExtension = Node.create<{}>({
  name: 'universalVideo',

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
      title: {
        default: null,
      },
      autoplay: {
        default: false,
      },
      controls: {
        default: true,
      },
      loop: {
        default: false,
      },
      muted: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="universal-video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, autoplay, controls, loop, muted } = HTMLAttributes;
    
    return [
      'div',
      {
        'data-type': 'universal-video',
        class: 'section',
      },
      [
        'div',
        { class: 'u-container' },
        [
          'div',
          { class: 'video-wrp' },
          src ? [
            'video',
            {
              class: 'video',
              src,
              title: title || alt || '',
              controls: controls ? 'controls' : undefined,
              autoplay: autoplay ? 'autoplay' : undefined,
              loop: loop ? 'loop' : undefined,
              muted: muted ? 'muted' : undefined,
            }
          ] : [
            'div',
            {
              class: 'video-placeholder',
              style: 'min-height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #1f2937; border-radius: 16px;'
            },
            [
              'div',
              { class: 'video-placeholder-icon', style: 'font-size: 3rem; color: white; margin-bottom: 1rem;' },
              '🎥'
            ],
            [
              'div',
              { class: 'video-placeholder-text', style: 'color: white; text-align: center;' },
              'Cliquez pour ajouter une vidéo'
            ]
          ]
        ]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockView);
  },

  addCommands() {
    return {
      setUniversalVideo:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: null,
              alt: '',
              title: '',
              autoplay: false,
              controls: true,
              loop: false,
              muted: false,
              ...attrs
            },
          });
        },
    };
  },
});