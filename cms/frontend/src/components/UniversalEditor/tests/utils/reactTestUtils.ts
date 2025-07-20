/**
 * Utilitaires pour tester les composants React
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { createTestEditor } from './tiptapTestUtils';

// Interface pour le contexte de test
interface TestContextProps {
  editor?: Editor;
  children: React.ReactNode;
}

/**
 * Composant de contexte pour les tests
 * @param props Props du contexte
 * @returns Composant de contexte
 */
const TestContext: React.FC<TestContextProps> = ({ editor, children }) => {
  return <>{children}</>;
};

/**
 * Options pour le rendu de test
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  editor?: Editor;
}

/**
 * Fonction de rendu personnalisée pour les tests
 * @param ui Composant à rendre
 * @param options Options de rendu
 * @returns Résultat du rendu
 */
export function renderWithContext(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { editor, ...renderOptions } = options;
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestContext editor={editor}>{children}</TestContext>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Crée un éditeur et rend un composant pour les tests
 * @param ui Composant à rendre
 * @param extensions Extensions Tiptap
 * @param content Contenu initial
 * @param options Options de rendu
 * @returns Résultat du rendu et l'éditeur
 */
export function renderWithEditor(
  ui: React.ReactElement,
  extensions: any[] = [],
  content: string = '',
  options: Omit<CustomRenderOptions, 'editor'> = {}
): { editor: Editor } & RenderResult {
  const editor = createTestEditor(extensions, content);
  
  const result = renderWithContext(ui, {
    editor,
    ...options,
  });
  
  return {
    ...result,
    editor,
  };
}

/**
 * Simule un événement de changement sur un élément
 * @param element Élément DOM
 * @param value Nouvelle valeur
 */
export function simulateChange(
  element: HTMLElement,
  value: string | boolean | number
): void {
  const isCheckbox = element.getAttribute('type') === 'checkbox';
  
  if (isCheckbox) {
    Object.defineProperty(element, 'checked', {
      value: Boolean(value),
      configurable: true,
    });
  } else {
    Object.defineProperty(element, 'value', {
      value: String(value),
      configurable: true,
    });
  }
  
  const event = new Event('change', { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * Simule un événement de clic sur un élément
 * @param element Élément DOM
 */
export function simulateClick(element: HTMLElement): void {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  
  element.dispatchEvent(event);
}

/**
 * Simule un événement de toucher sur un élément
 * @param element Élément DOM
 * @param x Position X
 * @param y Position Y
 */
export function simulateTouch(
  element: HTMLElement,
  x: number = 0,
  y: number = 0
): void {
  const touchStartEvent = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    view: window,
    touches: [
      new Touch({
        identifier: 0,
        target: element,
        clientX: x,
        clientY: y,
      }),
    ],
  });
  
  const touchEndEvent = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    view: window,
    changedTouches: [
      new Touch({
        identifier: 0,
        target: element,
        clientX: x,
        clientY: y,
      }),
    ],
  });
  
  element.dispatchEvent(touchStartEvent);
  element.dispatchEvent(touchEndEvent);
}

/**
 * Simule un événement de glisser-déposer
 * @param source Élément source
 * @param target Élément cible
 */
export function simulateDragAndDrop(
  source: HTMLElement,
  target: HTMLElement
): void {
  // Événement dragstart
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer(),
  });
  
  source.dispatchEvent(dragStartEvent);
  
  // Événement dragover
  const dragOverEvent = new DragEvent('dragover', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dragStartEvent.dataTransfer,
  });
  
  target.dispatchEvent(dragOverEvent);
  
  // Événement drop
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dragStartEvent.dataTransfer,
  });
  
  target.dispatchEvent(dropEvent);
  
  // Événement dragend
  const dragEndEvent = new DragEvent('dragend', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dragStartEvent.dataTransfer,
  });
  
  source.dispatchEvent(dragEndEvent);
}

/**
 * Attend que les promesses soient résolues
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Crée un fichier pour les tests
 * @param name Nom du fichier
 * @param type Type MIME
 * @param size Taille en octets
 * @returns Objet File
 */
export function createTestFile(
  name: string = 'test.png',
  type: string = 'image/png',
  size: number = 1024
): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}