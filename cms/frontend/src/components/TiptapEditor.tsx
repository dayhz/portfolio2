import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'react-iconly';
import React from 'react';
import './TiptapEditor.css';
import { Video } from './VideoExtension';

interface TiptapEditorProps {
  content?: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content = '', onChange }: TiptapEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'tiptap-heading',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'tiptap-blockquote',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'tiptap-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'tiptap-ordered-list',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
        inline: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Titre ${node.attrs.level}...`;
          }
          return 'Commencez à écrire votre contenu...';
        },
      }),
      Video.configure({
        HTMLAttributes: {
          class: 'tiptap-video',
        },
        inline: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        editor?.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        editor?.chain().focus().setVideo({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Chargement de l'éditeur...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • Liste
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. Liste
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            💬 Citation
          </Button>
          
          <div className="border-l border-gray-300 mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            🧹 Effacer
          </Button>
          
          {/* Upload d'image */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div className="mr-1">
                <Upload size="small" />
              </div>
              Image
            </Button>
          </div>

          {/* Upload de vidéo */}
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('video-upload')?.click()}
            >
              🎥 Vidéo
            </Button>
          </div>
        </div>
      </Card>

      {/* Éditeur */}
      <Card className="min-h-96 border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
        <EditorContent editor={editor} />
      </Card>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• Utilisez la barre d'outils pour formater le texte</p>
        <p>• Cliquez sur "Image" ou "Vidéo" pour ajouter des médias</p>
        <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">**texte**</kbd> pour du gras</p>
        <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs"># </kbd> pour un titre</p>
        <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">- </kbd> pour une liste</p>
        <p>• Tapez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">{'> '}</kbd> pour une citation</p>
      </div>
    </div>
  );
}