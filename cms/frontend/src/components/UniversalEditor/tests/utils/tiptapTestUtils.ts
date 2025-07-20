/**
 * Utilitaires pour tester les extensions Tiptap
 */

import { Editor } from '@tiptap/core';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import StarterKit from '@tiptap/starter-kit';

/**
 * Crée un éditeur Tiptap pour les tests
 * @param extensions Extensions à tester
 * @param content Contenu initial
 * @returns Instance de l'éditeur
 */
export function createTestEditor(extensions: any[] = [], content: string = '') {
  return new Editor({
    extensions: [
      StarterKit.configure({
        heading: false,
        history: false,
      }),
      ...extensions,
    ],
    content,
  });
}

/**
 * Crée un nœud Prosemirror pour les tests
 * @param editor Éditeur Tiptap
 * @param type Type de nœud
 * @param attrs Attributs du nœud
 * @param content Contenu du nœud
 * @returns Nœud Prosemirror
 */
export function createTestNode(
  editor: Editor,
  type: string,
  attrs: Record<string, any> = {},
  content: ProsemirrorNode[] = []
): ProsemirrorNode {
  const schema = editor.schema;
  const nodeType = schema.nodes[type];
  
  if (!nodeType) {
    throw new Error(`Node type "${type}" not found in schema`);
  }
  
  return nodeType.create(attrs, content);
}

/**
 * Crée un état d'éditeur Prosemirror pour les tests
 * @param editor Éditeur Tiptap
 * @param doc Document Prosemirror
 * @returns État de l'éditeur
 */
export function createTestEditorState(
  editor: Editor,
  doc: ProsemirrorNode
): EditorState {
  return EditorState.create({
    schema: editor.schema,
    doc,
    plugins: editor.extensionManager.plugins,
  });
}

/**
 * Crée une vue d'éditeur Prosemirror pour les tests
 * @param state État de l'éditeur
 * @param element Élément DOM
 * @returns Vue de l'éditeur
 */
export function createTestEditorView(
  state: EditorState,
  element: HTMLElement = document.createElement('div')
): EditorView {
  return new EditorView(element, { state });
}

/**
 * Vérifie si un nœud a un type spécifique
 * @param node Nœud à vérifier
 * @param type Type de nœud attendu
 * @returns true si le nœud est du type attendu
 */
export function isNodeType(node: ProsemirrorNode, type: string): boolean {
  return node.type.name === type;
}

/**
 * Vérifie si un nœud a des attributs spécifiques
 * @param node Nœud à vérifier
 * @param attrs Attributs attendus
 * @returns true si le nœud a les attributs attendus
 */
export function hasNodeAttributes(
  node: ProsemirrorNode,
  attrs: Record<string, any>
): boolean {
  for (const [key, value] of Object.entries(attrs)) {
    if (node.attrs[key] !== value) {
      return false;
    }
  }
  
  return true;
}

/**
 * Vérifie si un nœud a un contenu spécifique
 * @param node Nœud à vérifier
 * @param content Contenu attendu
 * @returns true si le nœud a le contenu attendu
 */
export function hasNodeContent(
  node: ProsemirrorNode,
  content: string
): boolean {
  return node.textContent === content;
}

/**
 * Vérifie si un HTML contient un élément avec des attributs spécifiques
 * @param html HTML à vérifier
 * @param selector Sélecteur CSS
 * @param attrs Attributs attendus
 * @returns true si l'élément existe avec les attributs attendus
 */
export function htmlContainsElement(
  html: string,
  selector: string,
  attrs: Record<string, any> = {}
): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const element = doc.querySelector(selector);
  
  if (!element) {
    return false;
  }
  
  for (const [key, value] of Object.entries(attrs)) {
    if (element.getAttribute(key) !== value) {
      return false;
    }
  }
  
  return true;
}

/**
 * Vérifie si un HTML contient un texte spécifique
 * @param html HTML à vérifier
 * @param text Texte attendu
 * @returns true si le HTML contient le texte
 */
export function htmlContainsText(html: string, text: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return doc.body.textContent?.includes(text) || false;
}

/**
 * Exécute une commande sur l'éditeur et retourne le HTML résultant
 * @param editor Éditeur Tiptap
 * @param command Fonction de commande
 * @returns HTML résultant
 */
export function runCommand(
  editor: Editor,
  command: (chain: any) => any
): string {
  command(editor.chain().focus());
  return editor.getHTML();
}