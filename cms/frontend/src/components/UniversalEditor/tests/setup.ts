/**
 * Configuration pour les tests unitaires de l'éditeur universel
 */

// Mocks pour les objets du navigateur
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  callback: IntersectionObserverCallback;
  
  // Méthode pour simuler une intersection
  simulateIntersection(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this);
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock pour URL.createObjectURL et URL.revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockImplementation(blob => `mock-object-url-${Math.random().toString(36).substring(2)}`),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock pour canvas
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
  }),
  putImageData: jest.fn(),
  createImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
  }),
  setTransform: jest.fn(),
  resetTransform: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 0 }),
}));

HTMLCanvasElement.prototype.toBlob = jest.fn().mockImplementation(callback => {
  callback(new Blob(['mock-blob'], { type: 'image/png' }));
});

// Mock pour ResizeObserver
class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  callback: ResizeObserverCallback;
  
  // Méthode pour simuler un redimensionnement
  simulateResize(entries: ResizeObserverEntry[]) {
    this.callback(entries, this);
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock pour les animations
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn().mockImplementation(callback => {
    return setTimeout(() => callback(Date.now()), 0);
  }),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn().mockImplementation(id => {
    clearTimeout(id);
  }),
});

// Mock pour localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn().mockImplementation((key: string) => store[key] || null),
    setItem: jest.fn().mockImplementation((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn().mockImplementation((key: string) => {
      delete store[key];
    }),
    clear: jest.fn().mockImplementation(() => {
      store = {};
    }),
    key: jest.fn().mockImplementation((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    length: 0,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock pour sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock pour navigator
Object.defineProperty(window.navigator, 'userAgent', {
  value: 'jest-test-user-agent',
});

// Mock pour console.error et console.warn pour éviter le bruit dans les tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn().mockImplementation((...args) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args);
  }
});

console.warn = jest.fn().mockImplementation((...args) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args);
  }
});

// Nettoyer les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});